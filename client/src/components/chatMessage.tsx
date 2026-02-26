import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import { CheckCheck } from 'lucide-react'

interface ChatMessageProps {
  message: {
    id: string
    content: string
    username: string
    createdAt: string
  }
  isCurrentUser?: boolean
  showAvatar?: boolean
}

export function ChatMessage({
  message,
  isCurrentUser = false,
  showAvatar = true,
}: ChatMessageProps) {
  const initials = message.username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 sm:p-3 hover:bg-muted/50 transition-colors group',
        isCurrentUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Аватар */}
      <div
        className={cn(
          'shrink-0 transition-opacity',
          !showAvatar && 'opacity-0 pointer-events-none'
        )}
      >
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* Сообщение */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[calc(100%-100px)] sm:max-w-[70%]',
          isCurrentUser ? 'items-end' : ''
        )}
      >
        {showAvatar && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold truncate">
              {message.username}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs font-normal px-1.5 py-0 h-5"
            >
              {formatDate(message.createdAt)}
            </Badge>
          </div>
        )}

        {/* Текст сообщения */}
        <div
          className={cn(
            'rounded-xl px-3 sm:px-4 py-2 sm:py-3 transition-all',
            'break-words whitespace-pre-wrap',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-secondary rounded-tl-none',
            !showAvatar && 'mt-6'
          )}
        >
          <p className="text-sm sm:text-base leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Статус отправки  */}
        {isCurrentUser && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CheckCheck className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Отправлено
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
