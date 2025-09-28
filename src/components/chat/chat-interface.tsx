'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare } from 'lucide-react'
import { chatService, ChatService } from '@/lib/chat-service'
import { ChatMessage as ChatMessageType, Conversation } from '@/lib/types'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Criar nova conversa
  const handleNewConversation = () => {
    setMessages([])
    setCurrentConversation(null)
    setStreamingMessage('')
  }

  // Enviar mensagem
  const handleSendMessage = async (message: string, type: 'text' | 'image', imageData?: string) => {
    if (isLoading) return

    // Adicionar mensagem do usuário
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      conversationId: currentConversation?.id || '',
      role: 'user',
      content: type === 'image' ? imageData! : message,
      type,
      metadata: type === 'image' ? { originalText: message } : undefined,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingMessage('')

    try {
      const stream = await chatService.sendMessage({
        message,
        conversationId: currentConversation?.id,
        type,
        imageData
      })

      let fullResponse = ''
      
      await ChatService.processStream(
        stream,
        // onChunk
        (content: string) => {
          fullResponse += content
          setStreamingMessage(fullResponse)
        },
        // onDone
        (conversationId: string) => {
          // Adicionar mensagem completa do assistente
          const assistantMessage: ChatMessageType = {
            id: (Date.now() + 1).toString(),
            conversationId,
            role: 'assistant',
            content: fullResponse,
            type: 'text',
            createdAt: new Date()
          }

          setMessages(prev => [...prev, assistantMessage])
          setStreamingMessage('')
          setIsLoading(false)

          // Atualizar conversa atual se necessário
          if (!currentConversation) {
            chatService.getConversation(conversationId).then(setCurrentConversation)
          }
        },
        // onError
        (error: string) => {
          console.error('Stream error:', error)
          setIsLoading(false)
          setStreamingMessage('')
          
          // Adicionar mensagem de erro
          const errorMessage: ChatMessageType = {
            id: (Date.now() + 1).toString(),
            conversationId: currentConversation?.id || '',
            role: 'assistant',
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
            type: 'text',
            createdAt: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        }
      )

    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
      setStreamingMessage('')
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        conversationId: currentConversation?.id || '',
        role: 'assistant',
        content: 'Erro de conexão. Verifique sua internet e tente novamente.',
        type: 'text',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">
            {currentConversation?.title || 'Nova Conversa'}
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNewConversation}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !streamingMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Bem-vindo ao GPT Multimodal Chat!
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Converse comigo usando texto ou envie imagens para análise. 
                  Estou aqui para ajudar com qualquer coisa que precisar!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">💬 Chat de Texto</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça perguntas, peça explicações ou converse sobre qualquer assunto.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">🖼️ Análise de Imagem</h3>
                    <p className="text-sm text-muted-foreground">
                      Envie imagens e eu posso descrever, analisar ou responder perguntas sobre elas.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Mensagem sendo digitada */}
            {streamingMessage && (
              <ChatMessage 
                message={{
                  id: 'streaming',
                  conversationId: currentConversation?.id || '',
                  role: 'assistant',
                  content: streamingMessage,
                  type: 'text',
                  createdAt: new Date()
                }}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
