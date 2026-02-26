import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Menu, Users } from 'lucide-react'

interface ChatHeaderProps {
  room: string
  isConnected: boolean
  onlineCount?: number
  onRoomChange: (room: string) => void
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function ChatHeader({
  room,
  isConnected,
  onlineCount = 0,
  onRoomChange,
  onToggleSidebar,
}: ChatHeaderProps) {
  const rooms = ['Каб 104', 'Флудилка', 'Помогите']

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full animate-pulse',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="text-xs sm:text-sm"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline">#</span>
              <span className="truncate max-w-20 sm:max-w-30">{room}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {rooms.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => onRoomChange(r)}
                className={cn(
                  'flex items-center gap-2',
                  room === r && 'bg-accent'
                )}
              >
                <span className="text-muted-foreground">#</span>
                <span>{r}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {onlineCount} В сети
          </span>
        </div>
        <Badge variant="secondary" className="sm:hidden">
          {onlineCount}
        </Badge>
      </div>
    </div>
  )
}
