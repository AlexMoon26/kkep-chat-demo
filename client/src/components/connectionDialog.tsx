'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

interface ConnectionDialogProps {
  open: boolean
  onConnect: (username: string) => void
}

export function ConnectionDialog({ open, onConnect }: ConnectionDialogProps) {
  const [username, setUsername] = useState('')
  const [avatarSet, setAvatarSet] = useState('avataaars')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onConnect(username.trim())
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">
              Добро пожаловать в наш чат!!!
            </DialogTitle>
            <DialogDescription className="text-base">
              Заходим не стесняемся
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Никнейм
              </Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введи свой ник"
                  autoComplete="off"
                  className="h-11 text-base"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Этот ник будет виден всем
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={!username.trim()}
            >
              Присоединиться
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
