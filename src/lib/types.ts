export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type: 'text' | 'image' | 'audio'
  metadata?: {
    fileName?: string
    fileSize?: number
    mimeType?: string
    originalText?: string
  }
  createdAt: Date
}

export interface Conversation {
  id: string
  title?: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

export interface ChatRequest {
  message: string
  conversationId?: string
  type?: 'text' | 'image' | 'audio'
  imageData?: string // Base64 string for images
}

export interface ChatResponse {
  message: ChatMessage
  conversationId: string
}
