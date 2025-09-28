import { ChatRequest, ChatResponse, Conversation } from './types'

export class ChatService {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  // Enviar mensagem e receber stream
  async sendMessage(request: ChatRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`)
    }

    return response.body!
  }

  // Buscar todas as conversas
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/api/conversations`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`)
    }

    return response.json()
  }

  // Buscar conversa específica
  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/api/conversations/${id}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`)
    }

    return response.json()
  }

  // Criar nova conversa
  async createConversation(title?: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`)
    }

    return response.json()
  }

  // Deletar conversa
  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/conversations/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`)
    }
  }

  // Atualizar título da conversa
  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/api/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.statusText}`)
    }

    return response.json()
  }

  // Converter imagem para Base64
  static async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // Processar stream de resposta
  static async processStream(
    stream: ReadableStream,
    onChunk: (content: string) => void,
    onDone: (conversationId: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'chunk':
                  onChunk(data.content)
                  break
                case 'done':
                  onDone(data.conversationId)
                  break
                case 'error':
                  onError(data.error)
                  break
              }
            } catch (e) {
              // Ignorar linhas que não são JSON válido
            }
          }
        }
      }
    } catch (error) {
      onError('Stream processing error')
    } finally {
      reader.releaseLock()
    }
  }
}

// Instância singleton
export const chatService = new ChatService()
