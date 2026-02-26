'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Тапать сообщение тут...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (message.trim() && onTyping) {
      onTyping()
    }
  }, [message])

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('border-t bg-background', className)}
    >
      <div className="p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="pr-12 h-11 sm:h-12"
            />
          </div>

          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 sm:h-12 sm:w-12 shrink-0"
            disabled={disabled || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-muted-foreground">
            Нажмите{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>{' '}
            для отправки
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {message.length}/500
          </span>
        </div>
      </div>
    </form>
  )
}
