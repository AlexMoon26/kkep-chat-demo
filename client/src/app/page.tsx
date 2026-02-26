'use client'

import { ChatHeader } from '@/components/chatHeader'
import { ChatInput } from '@/components/chatInput'
import { ChatMessage } from '@/components/chatMessage'
import { ConnectionDialog } from '@/components/connectionDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Users, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'

type MessageType = {
  id: string
  content: string
  username: string
  room: string
  createdAt: string
}

type UserType = {
  id: string
  username: string
  avatar?: string
  room: string
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [room, setRoom] = useState('Каб 104')
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<UserType[]>([])
  const [userInfo, setUserInfo] = useState<{
    username: string
  } | null>(null)
  const [showConnectionDialog, setShowConnectionDialog] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!userInfo) return

    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: {
        username: userInfo.username,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)

      newSocket.emit('joinRoom', {
        room: 'Каб 104',
        user: userInfo,
      })

      newSocket.emit('getHistory', { room: 'Каб 104', limit: 100 })
    })

    newSocket.on('getHistory', (data: any) => {
      if (data?.messages && Array.isArray(data.messages)) {
        // Сортируем по времени на всякий случай
        const sortedMessages = [...data.messages].sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })

        setMessages(sortedMessages)
      } else {
        console.error('No messages in response or not an array!')
        setMessages([])
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('message', (message: MessageType) => {
      setMessages((prev: any) => [...prev, message])
    })

    newSocket.on('userJoined', (user: UserType) => {
      setOnlineUsers((prev: any[]) => {
        if (!prev.find((u: { id: string }) => u.id === user.id)) {
          return [...prev, user]
        }
        return prev
      })
    })

    newSocket.on('userLeft', (userId: string) => {
      setOnlineUsers((prev: any[]) =>
        prev.filter((user: { id: string }) => user.id !== userId)
      )
    })

    newSocket.on('onlineUsers', (users: UserType[]) => {
      setOnlineUsers(users)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [userInfo])

  useEffect(() => {
    if (!socket || !room) return

    const handleTyping = ({ username, room: typingRoom }: any) => {
      console.log('📨 Received typing event:', {
        username,
        typingRoom,
        currentRoom: room,
      })

      if (typingRoom !== room) {
        console.log(
          '⏭️ Ignoring typing - different room:',
          typingRoom,
          'vs',
          room
        )
        return
      }

      setTypingUsers((prev: string[]) => {
        if (!prev.includes(username) && username !== userInfo?.username) {
          console.log('✏️ Adding typing user:', username)
          return [...prev, username]
        }
        return prev
      })
    }

    const handleStopTyping = ({ username, room: typingRoom }: any) => {
      console.log('🛑 Received stopTyping event:', {
        username,
        typingRoom,
        currentRoom: room,
      })

      if (typingRoom !== room) {
        console.log(
          '⏭️ Ignoring stopTyping - different room:',
          typingRoom,
          'vs',
          room
        )
        return
      }

      setTypingUsers((prev: any[]) => {
        const filtered = prev.filter((u: any) => u !== username)
        if (filtered.length !== prev.length) {
          console.log('✋ Removed typing user:', username)
        }
        return filtered
      })
    }

    // Регистрируем listeners для текущей комнаты
    socket.on('typing', handleTyping)
    socket.on('stopTyping', handleStopTyping)

    console.log('🔔 Typing listeners registered for room:', room)

    // Очищаем старые listeners при смене комнаты
    return () => {
      socket.off('typing', handleTyping)
      socket.off('stopTyping', handleStopTyping)
      console.log('🔕 Typing listeners unregistered for room:', room)
    }
  }, [socket, room, userInfo?.username])

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollArea = scrollAreaRef.current
      if (scrollArea) {
        const isAtBottom =
          scrollArea.scrollHeight -
            scrollArea.scrollTop -
            scrollArea.clientHeight <
          100

        if (isAtBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [messages])

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !userInfo) return

      const messageData = {
        content,
        username: userInfo.username,
        room,
      }

      socket.emit('message', messageData)
      socket.emit('stopTyping', { room, username: userInfo.username })
    },
    [socket, userInfo, room]
  )

  const handleTyping = useCallback(() => {
    if (!socket || !userInfo) {
      console.warn('⚠️ Cannot emit typing - socket or userInfo missing', {
        hasSocket: !!socket,
        hasUserInfo: !!userInfo,
      })
      return
    }

    console.log(
      '📤 Emitting typing event for user:',
      userInfo.username,
      'in room:',
      room
    )
    socket.emit('typing', { room, username: userInfo.username })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log(
        '⏱️ Typing timeout - emitting stopTyping for user:',
        userInfo.username
      )
      socket.emit('stopTyping', { room, username: userInfo.username })
    }, 2000)
  }, [socket, userInfo, room])

  const changeRoom = useCallback(
    (newRoom: string) => {
      if (!socket || !userInfo || newRoom === room) return

      socket.emit('leaveRoom', { room })
      socket.emit('joinRoom', {
        room: newRoom,
        user: userInfo,
      })
      socket.emit('getHistory', { room: newRoom, limit: 100 })
      setRoom(newRoom)
      setMessages([])
      setTypingUsers([])

      if (isMobile) {
        setSidebarOpen(false)
      }
    },
    [socket, userInfo, room, isMobile]
  )

  const handleConnect = useCallback((username: string) => {
    setUserInfo({ username })
    setShowConnectionDialog(false)
  }, [])

  const showTypingIndicator = () => {
    if (typingUsers.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    showTypingIndicator()
  }, [typingUsers])

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {!userInfo ? (
        <ConnectionDialog
          open={showConnectionDialog}
          onConnect={handleConnect}
        />
      ) : (
        <div className="h-screen flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            {(sidebarOpen || !isMobile) && (
              <div
                className={cn(
                  'fixed md:relative z-40 h-full w-70 shrink-0',
                  'border-r bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60',
                  isMobile ? 'shadow-xl' : ''
                )}
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Пользователей в сети
                      <Badge variant="secondary" className="ml-2">
                        {onlineUsers.length}
                      </Badge>
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {onlineUsers.map(
                        (user: { id: any; username: string; room: any }) => (
                          <div
                            key={user.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg transition-colors',
                              'hover:bg-accent cursor-pointer group',
                              user.username === userInfo.username && 'bg-accent'
                            )}
                          >
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {user.username}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div
                                className={cn(
                                  'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                                  'bg-green-500 animate-pulse'
                                )}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate flex items-center gap-2">
                                {user.username}
                                {user.username === userInfo.username && (
                                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                    Вы
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                в #{user.room}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.username}`}
                          />
                          <AvatarFallback className="text-xs">
                            {userInfo.username}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-semibold">{userInfo.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Поключено к #{room}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
              <Card className="rounded-xl border py-6 gap-0 flex flex-col sm:m-4 md:m-6 overflow-hidden shadow-lg">
                <ChatHeader
                  room={room}
                  isConnected={isConnected}
                  onlineCount={onlineUsers.length}
                  onRoomChange={changeRoom}
                  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                  sidebarOpen={sidebarOpen}
                />

                <div className="flex flex-col min-h-0 ">
                  <ScrollArea
                    ref={scrollAreaRef}
                    className=" overflow-scroll no-scrollbar p-0"
                  >
                    <div className="space-y-1">
                      {messages.map(
                        (
                          msg: {
                            username: any
                            createdAt: any
                            content: any
                            id: any
                          },
                          index: number
                        ) => {
                          const prevMessage = messages[index - 1]
                          const showAvatar =
                            !prevMessage ||
                            prevMessage.username !== msg.username ||
                            new Date(msg.createdAt).getTime() -
                              new Date(prevMessage.createdAt).getTime() >
                              300000

                          return (
                            <ChatMessage
                              key={msg.id}
                              message={msg}
                              isCurrentUser={msg.username === userInfo.username}
                              showAvatar={showAvatar}
                            />
                          )
                        }
                      )}

                      {typingUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3"
                        >
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                            <div
                              className="h-2 w-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            />
                            <div
                              className="h-2 w-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: '0.4s' }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground italic">
                            {typingUsers.join(' и ')}{' '}
                            {typingUsers.length === 1
                              ? 'печатает...'
                              : 'печатают...'}
                          </span>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} className="h-4" />
                    </div>
                  </ScrollArea>

                  <Separator />

                  <ChatInput
                    onSendMessage={sendMessage}
                    onTyping={handleTyping}
                    disabled={!isConnected}
                    placeholder={`Написать в #${room}...`}
                  />
                </div>
              </Card>
            </div>
          </div>

          <div className="border-t bg-background/50 backdrop-blur">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"></div>
                  <span>•</span>
                  <span>
                    Комната: <span className="font-medium">#{room}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Пользователей:{' '}
                    <span className="font-medium">{onlineUsers.length}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Сообщений:{' '}
                    <span className="font-medium">{messages.length}</span>
                  </span>
                </div>
                <div className="hidden sm:block">
                  {isConnected ? (
                    <span className="text-green-600">Подключено</span>
                  ) : (
                    <span className="text-red-600">Соединение...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
