'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BookOpen, User, Users, CreditCard, Coffee, Settings, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Profile } from '@/types/database'

const userNav = [
  { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
  { href: '/dashboard/sessions', label: 'Sesiones', icon: Calendar, exact: false },
  { href: '/dashboard/materials', label: 'Materiales', icon: BookOpen, exact: false },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: User, exact: false },
]

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: Shield, exact: true },
  { href: '/admin/users', label: 'Miembros', icon: Users, exact: false },
  { href: '/admin/payments', label: 'Pagos', icon: CreditCard, exact: false },
  { href: '/admin/sessions', label: 'Sesiones', icon: Calendar, exact: false },
  { href: '/admin/cafeterias', label: 'Cafeterías', icon: Coffee, exact: false },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, exact: false },
]

interface SidebarProps {
  user: Profile
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = user.role === 'admin'
  const navItems = isAdmin && pathname.startsWith('/admin') ? adminNav : userNav

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
      <div className="h-14 flex items-center px-6 border-b border-gray-100">
        <Link href="/dashboard" className="font-display text-xl font-bold text-primary">
          Talkerys
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
        {isAdmin && !pathname.startsWith('/admin') && (
          <>
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            {adminNav.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
