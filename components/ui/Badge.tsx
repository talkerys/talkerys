import { cn } from '@/lib/utils'
import { EnglishLevel, UserStatus, SubscriptionStatus, PaymentStatus, SessionStatus } from '@/types/database'

type BadgeVariant = 'level' | 'userStatus' | 'subStatus' | 'payStatus' | 'sessionStatus' | 'custom'

interface BadgeProps {
  variant?: BadgeVariant
  value?: string
  label?: string
  className?: string
}

const levelClasses: Record<EnglishLevel, string> = {
  beginner: 'bg-blue-50 text-blue-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-emerald-50 text-emerald-700',
}

const levelLabels: Record<EnglishLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const userStatusClasses: Record<UserStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
}

const userStatusLabels: Record<UserStatus, string> = {
  pending: 'Pago pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
}

const payStatusClasses: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
}

const payStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  verified: 'Verificado',
  rejected: 'Rechazado',
}

const sessionStatusClasses: Record<SessionStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const sessionStatusLabels: Record<SessionStatus, string> = {
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export function LevelBadge({ level, className }: { level: EnglishLevel; className?: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', levelClasses[level], className)}>
      {levelLabels[level]}
    </span>
  )
}

export function UserStatusBadge({ status, className }: { status: UserStatus; className?: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', userStatusClasses[status], className)}>
      {userStatusLabels[status]}
    </span>
  )
}

export function PayStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', payStatusClasses[status], className)}>
      {payStatusLabels[status]}
    </span>
  )
}

export function SessionStatusBadge({ status, className }: { status: SessionStatus; className?: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', sessionStatusClasses[status], className)}>
      {sessionStatusLabels[status]}
    </span>
  )
}

export default function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600', className)}>
      {label}
    </span>
  )
}
