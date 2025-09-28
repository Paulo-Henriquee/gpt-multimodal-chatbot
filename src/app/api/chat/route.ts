import { NextRequest, NextResponse } from 'next/server'
import { openai, MODELS } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { ChatRequest, ChatMessage } from '@/lib/types'
import { z } from 'zod'

// Schema de validação para o request
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().optional(),
  type: z.enum(['text', 'image']).default('text'),
  imageData: z.string().optional(), // Base64 string
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Chat API called')
    const body = await request.json()
    console.log('📝 Request body:', { message: body.message?.slice(0, 50), type: body.type, hasImageData: !!body.imageData })
    const { message, conversationId, type, imageData } = chatRequestSchema.parse(body)

    // Criar ou buscar conversa
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      })
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      // Criar nova conversa
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: { messages: true }
      })
    }

    // Salvar mensagem do usuário
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: type === 'image' ? imageData! : message,
        type,
        metadata: type === 'image' ? { originalText: message } : undefined,
      }
    })

    // Preparar mensagens para OpenAI
    const messages: any[] = []
    
    // Adicionar histórico da conversa
    for (const msg of conversation.messages) {
      if (msg.type === 'text') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      } else if (msg.type === 'image' && msg.role === 'user') {
        messages.push({
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: msg.metadata?.originalText || 'Analyze this image' 
            },
            {
              type: 'image_url',
              image_url: { url: msg.content }
            }
          ]
        })
      } else {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }

    // Adicionar mensagem atual
    if (type === 'image') {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message },
          {
            type: 'image_url',
            image_url: { url: imageData! }
          }
        ]
      })
    } else {
      messages.push({
        role: 'user',
        content: message
      })
    }

    // Adicionar system prompt personalizado
    messages.unshift({
      role: 'system',
      content: `Você é um assistente de IA inteligente e prestativo. Características:
- Responda sempre em português brasileiro
- Seja amigável, educado e profissional
- Forneça respostas claras e bem estruturadas
- Se não souber algo, admita honestamente
- Para análise de imagens, seja detalhado e preciso
- Mantenha o contexto da conversa`
    })

    // Criar stream de resposta
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🤖 Calling OpenAI with model:', type === 'image' ? MODELS.VISION : MODELS.CHAT)
          const completion = await openai.chat.completions.create({
            model: type === 'image' ? MODELS.VISION : MODELS.CHAT,
            messages,
            stream: true,
            max_tokens: type === 'image' ? 1000 : 2000,
            temperature: 0.7,
          })
          console.log('✅ OpenAI response received')

          let fullResponse = ''

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              
              // Enviar chunk para o cliente
              const data = JSON.stringify({
                type: 'chunk',
                content,
                conversationId: conversation.id
              })
              
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }

          // Salvar resposta completa no banco
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content: fullResponse,
              type: 'text',
            }
          })

          // Enviar evento de finalização
          const finalData = JSON.stringify({
            type: 'done',
            conversationId: conversation.id,
            messageId: userMessage.id
          })
          
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`))
          controller.close()

        } catch (error) {
          console.error('Error in chat stream:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response'
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
