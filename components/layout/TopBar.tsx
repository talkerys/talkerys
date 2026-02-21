'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

interface TopBarProps {
  user: Profile
}

export default function TopBar({ user }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 sticky top-0 z-40 flex items-center px-4 md:px-8">
      {/* Mobile logo */}
      <div className="flex-1 flex items-center justify-center md:justify-start">
        <Link href="/dashboard" className="md:hidden font-display text-xl font-bold text-primary">
          Talkerys
        </Link>
      </div>

      {/* Avatar dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Avatar name={user.full_name} url={user.avatar_url || undefined} size="sm" />
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.english_level}</p>
            </div>
            <div className="p-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <UserIcon size={15} />
                Mi perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full text-left"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
