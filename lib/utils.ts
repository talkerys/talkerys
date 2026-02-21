import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number): string {
  return `S/${n}`
}

export function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(t: string): string {
  const [hours, minutes] = t.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export interface ExperienceBadge {
  label: string
  emoji: string
}

export function getExperienceBadge(n: number): ExperienceBadge {
  if (n === 0) return { label: 'Nuevo', emoji: '🌱' }
  if (n <= 4) return { label: 'Regular', emoji: '⭐' }
  if (n <= 12) return { label: 'Veterano', emoji: '🏆' }
  return { label: 'Pro', emoji: '💎' }
}

export function generateWhatsAppUrl(phone: string, msg: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(msg)
  return `https://wa.me/${cleaned}?text=${encoded}`
}
