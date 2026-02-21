import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  name: string
  url?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

const sizePx = {
  sm: 32,
  md: 40,
  lg: 56,
}

function hashColor(name: string): string {
  const colors = [
    'bg-red-400', 'bg-pink-400', 'bg-purple-400', 'bg-indigo-400',
    'bg-blue-400', 'bg-teal-400', 'bg-green-400', 'bg-amber-400',
    'bg-orange-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ name, url, size = 'md', className }: AvatarProps) {
  const px = sizePx[size]

  if (url) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeClasses[size], className)}>
        <Image src={url} alt={name} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
        sizeClasses[size],
        hashColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
