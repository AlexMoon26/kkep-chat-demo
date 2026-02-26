import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'сейчас'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}ч назад`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}д назад`

  return d.toLocaleDateString()
}
