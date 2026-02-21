'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { LevelBadge, SessionStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatTime, generateWhatsAppUrl } from '@/lib/utils'
import { Plus, X, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Session, SessionTable, TableAssignment, Profile, EnglishLevel, Cafeteria } from '@/types/database'
import { cn } from '@/lib/utils'

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const router = useRouter()

  const [session, setSession] = useState<Session & { cafeteria: Cafeteria | null } | null>(null)
  const [tables, setTables] = useState<(SessionTable & { assignments: (TableAssignment & { profile: Profile })[] })[]>([])
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAttendance, setSavingAttendance] = useState(false)

  // New table form
  const [showTableForm, setShowTableForm] = useState(false)
  const [tableForm, setTableForm] = useState({ table_label: 'A', target_level: 'beginner' as EnglishLevel, moderator_name: '', max_seats: 8 })
  const [savingTable, setSavingTable] = useState(false)

  // Add user to table
  const [addingToTable, setAddingToTable] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState('')

  const load = useCallback(async () => {
    setLoading(true)

    const [sessionRes, tablesRes, usersRes] = await Promise.all([
      supabase.from('sessions').select('*, cafeteria:cafeterias(*)').eq('id', id).single(),
      supabase.from('session_tables').select('*, assignments:table_assignments(*, profile:profiles(*))').eq('session_id', id).order('table_label'),
      supabase.from('profiles').select('*').eq('status', 'active').order('full_name'),
    ])

    setSession(sessionRes.data as any)
    setTables((tablesRes.data || []) as any)
    setAvailableUsers((usersRes.data || []) as Profile[])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function createTable() {
    setSavingTable(true)
    const { error } = await supabase.from('session_tables').insert({
      session_id: Number(id),
      ...tableForm,
    })
    if (error) toast.error('Error al crear mesa')
    else { toast.success('Mesa creada'); setShowTableForm(false); load() }
    setSavingTable(false)
  }

  async function assignUser(tableId: number) {
    if (!selectedUser) return
    setAddingToTable(tableId)

    // Check user sessions_remaining > 0
    const user = availableUsers.find((u) => u.id === selectedUser)
    // Get subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, sessions_remaining')
      .eq('user_id', selectedUser)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub || sub.sessions_remaining <= 0) {
      toast.error('El usuario no tiene sesiones disponibles')
      setAddingToTable(null)
      return
    }

    const { error } = await supabase.from('table_assignments').insert({
      table_id: tableId,
      user_id: selectedUser,
    })

    if (error) {
      toast.error('Error al asignar usuario')
    } else {
      // Decrement sessions_remaining
      await supabase.from('subscriptions').update({
        sessions_remaining: sub.sessions_remaining - 1,
      }).eq('id', sub.id)

      toast.success('Usuario asignado')
      setSelectedUser('')
      load()
    }
    setAddingToTable(null)
  }

  async function removeUser(assignmentId: number, userId: string, tableId: number) {
    // Get assignment
    const { error } = await supabase.from('table_assignments').delete().eq('id', assignmentId)
    if (error) { toast.error('Error'); return }

    // Return session
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, sessions_remaining')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      await supabase.from('subscriptions').update({
        sessions_remaining: sub.sessions_remaining + 1,
      }).eq('id', sub.id)
    }

    toast.success('Usuario removido')
    load()
  }

  async function saveAttendance() {
    setSavingAttendance(true)
    for (const table of tables) {
      for (const a of table.assignments) {
        await supabase.from('table_assignments').update({ attended: a.attended }).eq('id', a.id)
        if (a.attended) {
          await supabase.from('profiles').update({
            sessions_attended: (a.profile.sessions_attended || 0) + 1,
          }).eq('id', a.profile.id)
        }
      }
    }
    toast.success('Asistencia guardada')
    setSavingAttendance(false)
  }

  async function completeSession() {
    await supabase.from('sessions').update({ status: 'completed' }).eq('id', id)
    toast.success('Sesión completada')
    load()
  }

  function toggleAttendance(tableId: number, assignmentId: number) {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t
        return {
          ...t,
          assignments: t.assignments.map((a) =>
            a.id === assignmentId ? { ...a, attended: !a.attended } : a
          ) as (TableAssignment & { profile: Profile })[],
        }
      })
    )
  }

  // WhatsApp message
  const whatsappSummary = session
    ? `🗣️ *TALKERYS — ${session.title}*\n\n📅 ${formatDate(session.session_date)}\n🕗 ${formatTime(session.time_start)} - ${formatTime(session.time_end)}\n☕ ${session.cafeteria?.name || ''} — ${session.cafeteria?.address || ''}\n🗺️ ${session.cafeteria?.google_maps_url || ''}\n\n📝 *Tema:* ${session.topic}\n\n📌 *Reglas:*\n• Solo en inglés\n• Respetar turnos\n• Celular en silencio\n\n¡Nos vemos! 🚀`
    : ''

  const assignedIds = new Set(tables.flatMap((t) => t.assignments.map((a) => a.user_id)))
  const unassignedUsers = availableUsers.filter((u) => !assignedIds.has(u.id))

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  if (!session) return <p className="text-gray-500">Sesión no encontrada</p>

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{session.topic}</h1>
          <p className="text-gray-500 text-sm">{session.title}</p>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      {/* Info */}
      <Card>
        <div className="space-y-2 text-sm text-gray-600">
          <p>📅 {formatDate(session.session_date)}</p>
          <p>🕗 {formatTime(session.time_start)} - {formatTime(session.time_end)}</p>
          {session.cafeteria && (
            <>
              <p>☕ {session.cafeteria.name}</p>
              <p>📍 {session.cafeteria.address}</p>
            </>
          )}
        </div>
        <div className="mt-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappSummary)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <MessageCircle size={15} />
            Enviar resumen por WhatsApp
          </a>
        </div>
      </Card>

      {/* Mesas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-lg">Mesas</h2>
          <Button size="sm" onClick={() => setShowTableForm(true)}>
            <Plus size={15} /> Crear mesa
          </Button>
        </div>

        {showTableForm && (
          <Card className="mb-3">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Label</label>
                  <select
                    value={tableForm.table_label}
                    onChange={(e) => setTableForm({ ...tableForm, table_label: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Nivel</label>
                  <select
                    value={tableForm.target_level}
                    onChange={(e) => setTableForm({ ...tableForm, target_level: e.target.value as EnglishLevel })}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Moderador</label>
                  <input
                    value={tableForm.moderator_name}
                    onChange={(e) => setTableForm({ ...tableForm, moderator_name: e.target.value })}
                    placeholder="Nombre del moderador"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Capacidad</label>
                  <input
                    type="number"
                    value={tableForm.max_seats}
                    onChange={(e) => setTableForm({ ...tableForm, max_seats: Number(e.target.value) })}
                    min={2}
                    max={12}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={savingTable} onClick={createTable}>Crear</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowTableForm(false)}>Cancelar</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {tables.map((table) => (
            <Card key={table.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Mesa {table.table_label}</span>
                  {table.target_level && <LevelBadge level={table.target_level} />}
                  {table.moderator_name && (
                    <span className="text-xs text-gray-400">Mod: {table.moderator_name}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {table.assignments.length}/{table.max_seats}
                </span>
              </div>

              {/* Assigned users */}
              {table.assignments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {table.assignments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                      <Avatar name={a.profile?.full_name ?? ''} url={a.profile?.avatar_url || undefined} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.profile?.full_name ?? ''}</p>
                        {a.profile && <LevelBadge level={a.profile.english_level} />}
                      </div>
                      {/* Attendance toggle for post-session */}
                      {session.status !== 'completed' && (
                        <button
                          onClick={() => toggleAttendance(table.id, a.id)}
                          className={cn('text-xs px-2 py-1 rounded-lg font-medium transition-colors', a.attended ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}
                        >
                          {a.attended ? '✅' : '○'}
                        </button>
                      )}
                      <button
                        onClick={() => removeUser(a.id, a.user_id, table.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add user */}
              {table.assignments.length < table.max_seats && (
                <div className="flex gap-2">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                  >
                    <option value="">Agregar usuario...</option>
                    {unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.english_level})
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!selectedUser}
                    loading={addingToTable === table.id}
                    onClick={() => assignUser(table.id)}
                  >
                    Agregar
                  </Button>
                </div>
              )}
            </Card>
          ))}
          {tables.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No hay mesas creadas aún</p>
          )}
        </div>
      </div>

      {/* Usuarios disponibles */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Usuarios disponibles ({unassignedUsers.length})</h2>
        {unassignedUsers.length === 0 ? (
          <p className="text-gray-400 text-sm">Todos los usuarios activos han sido asignados</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unassignedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                <Avatar name={u.full_name} url={u.avatar_url || undefined} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
                  <LevelBadge level={u.english_level} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Asistencia */}
      {session.status !== 'completed' && tables.some((t) => t.assignments.length > 0) && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Asistencia</h2>
          <p className="text-sm text-gray-500 mb-4">Marca quién asistió a la sesión usando los botones ✅/○ en cada mesa</p>
          <div className="flex gap-2 flex-wrap">
            <Button loading={savingAttendance} onClick={saveAttendance}>
              Guardar asistencia
            </Button>
            <Button variant="secondary" onClick={completeSession}>
              Completar sesión
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
