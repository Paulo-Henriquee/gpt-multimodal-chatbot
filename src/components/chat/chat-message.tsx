'use client'

import { ChatMessage as ChatMessageType } from '@/lib/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { User, Bot, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isImage = message.type === 'image'

  return (
    <div className={cn(
      'flex gap-3 p-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser && 'flex flex-col items-end'
      )}>
        <Card className={cn(
          'p-3 relative',
          isUser 
            ? 'bg-primary text-primary-foreground ml-12' 
            : 'bg-muted mr-12'
        )}>
          {isImage && isUser ? (
            <div className="space-y-2">
              {message.metadata?.originalText && (
                <p className="text-sm">{message.metadata.originalText}</p>
              )}
              <div className="relative">
                <img 
                  src={message.content} 
                  alt="Uploaded image" 
                  className="max-w-full h-auto rounded-md"
                  style={{ maxHeight: '300px' }}
                />
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                  <ImageIcon className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap break-words m-0">
                {message.content}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}
              </p>
            </div>
          )}
        </Card>
        
        <div className={cn(
          'text-xs text-muted-foreground px-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
