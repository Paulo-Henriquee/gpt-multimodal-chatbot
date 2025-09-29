'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { ChatService } from '@/lib/chat-service'

interface ChatInputProps {
  onSendMessage: (message: string, type: 'text' | 'image', imageData?: string) => void
  disabled?: boolean
}

interface StagedImage {
  base64: string
  fileName: string
  preview: string
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [stagedImage, setStagedImage] = useState<StagedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !stagedImage) return
    if (disabled) return

    // 🎯 ENVIO INTELIGENTE: Texto + Imagem ou só Texto
    if (stagedImage) {
      // Enviar texto + imagem juntos
      const finalMessage = message.trim() || 'Analise esta imagem'
      onSendMessage(finalMessage, 'image', stagedImage.base64)
      setStagedImage(null) // Limpar imagem preparada
    } else {
      // Enviar só texto
      onSendMessage(message.trim(), 'text')
    }
    
    setMessage('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 10MB.')
      return
    }

    setIsUploading(true)
    try {
      const base64 = await ChatService.imageToBase64(file)
      
      // 🎯 PREPARAR IMAGEM (não enviar ainda)
      setStagedImage({
        base64,
        fileName: file.name,
        preview: base64
      })
      
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      alert('Erro ao processar a imagem. Tente novamente.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 🗑️ Função para remover imagem preparada
  const handleRemoveImage = () => {
    setStagedImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <Card className="p-4 border-t">
      {/* 🖼️ PREVIEW DA IMAGEM PREPARADA */}
      {stagedImage && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={stagedImage.preview} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Imagem preparada</p>
              <p className="text-xs text-muted-foreground">{stagedImage.fileName}</p>
              <p className="text-xs text-green-600 mt-1">
                ✨ Digite sua pergunta e pressione Enter para enviar junto!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isUploading 
                ? "Processando imagem..." 
                : "Digite sua mensagem ou selecione uma imagem... (Enter para enviar, Shift+Enter para nova linha)"
              }
              className="min-h-[60px] resize-none"
              disabled={disabled || isUploading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="icon"
              disabled={(!message.trim() && !stagedImage) || disabled || isUploading}
              className={`h-[60px] ${stagedImage ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-[60px]"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {stagedImage ? (
            message.trim() ? (
              <span className="text-green-600">
                ✨ Pronto! Pressione Enter para enviar texto + imagem juntos
              </span>
            ) : (
              <span className="text-blue-600">
                📝 Digite sua pergunta sobre a imagem e pressione Enter
              </span>
            )
          ) : (
            <span>
              💡 Dica: Selecione uma imagem primeiro, depois digite sua pergunta!
            </span>
          )}
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </Card>
  )
}
