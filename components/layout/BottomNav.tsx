'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/sessions', label: 'Sesiones', icon: Calendar },
  { href: '/dashboard/materials', label: 'Materiales', icon: BookOpen },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
              isActive ? 'text-primary' : 'text-gray-400'
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
