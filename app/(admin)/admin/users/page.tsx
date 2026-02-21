'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { LevelBadge, UserStatusBadge } from '@/components/ui/Badge'
import { Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile, EnglishLevel, UserStatus } from '@/types/database'
import { cn } from '@/lib/utils'

export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<EnglishLevel | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all')
  const [selected, setSelected] = useState<Profile | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (filterLevel !== 'all') query = query.eq('english_level', filterLevel)
    if (filterStatus !== 'all') query = query.eq('status', filterStatus)

    const { data } = await query
    setUsers((data || []) as Profile[])
    setLoading(false)
  }, [filterLevel, filterStatus])

  useEffect(() => { load() }, [load])

  const filtered = users.filter((u) =>
    search === '' ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  async function toggleStatus(user: Profile) {
    setActionLoading(true)
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al actualizar')
    } else {
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`)
      setSelected(null)
      load()
    }
    setActionLoading(false)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Miembros</h1>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as EnglishLevel | 'all')}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="all">Todos los niveles</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'all')}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </Card>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p>No se encontraron usuarios</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer hover:border-gray-200 transition-colors"
              onClick={() => setSelected(user)}
            >
              <div className="flex items-center gap-3">
                <Avatar name={user.full_name} url={user.avatar_url || undefined} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{user.full_name}</p>
                    <LevelBadge level={user.english_level} />
                    <UserStatusBadge status={user.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{user.phone} · {formatDate(user.created_at)}</p>
                  <p className="text-xs text-gray-400">{user.sessions_attended} sesiones asistidas</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <Avatar name={selected.full_name} url={selected.avatar_url || undefined} size="lg" />
              <div>
                <p className="font-bold text-gray-900">{selected.full_name}</p>
                <LevelBadge level={selected.english_level} className="mt-1" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-5">
              <p>📱 {selected.phone}</p>
              <p>📅 Desde {formatDate(selected.created_at)}</p>
              <p>🏆 {selected.sessions_attended} sesiones asistidas</p>
              {selected.bio && <p className="text-gray-500 italic">"{selected.bio}"</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant={selected.status === 'active' ? 'danger' : 'primary'}
                fullWidth
                loading={actionLoading}
                onClick={() => toggleStatus(selected)}
              >
                {selected.status === 'active' ? 'Desactivar' : 'Activar'}
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
