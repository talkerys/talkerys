import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import { SessionStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Coffee, Clock } from 'lucide-react'

export default async function SessionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, cafeteria:cafeterias(*)')
    .gte('session_date', today)
    .order('session_date', { ascending: true })

  // Get user's assigned tables
  const { data: assignments } = await supabase
    .from('table_assignments')
    .select('table_id, table:session_tables(session_id, table_label)')
    .eq('user_id', user.id)

  const assignedSessionMap = new Map<number, string>()
  for (const a of (assignments || []) as any[]) {
    if (a.table?.session_id) {
      assignedSessionMap.set(a.table.session_id, a.table.table_label)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Sesiones programadas</h1>

      {!sessions || sessions.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium text-gray-600">No hay sesiones programadas</p>
            <p className="text-sm mt-1">Las próximas sesiones aparecerán aquí</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {(sessions as any[]).map((session) => {
            const tableLabel = assignedSessionMap.get(session.id)
            return (
              <Card key={session.id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{session.title}</p>
                  </div>
                  <SessionStatusBadge status={session.status} />
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    {formatDate(session.session_date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {formatTime(session.time_start)} - {formatTime(session.time_end)}
                  </div>
                  {session.cafeteria && (
                    <>
                      <div className="flex items-center gap-2">
                        <Coffee size={14} className="text-gray-400" />
                        {session.cafeteria.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        {session.cafeteria.address}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  {tableLabel ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      ✅ Mesa {tableLabel} asignada
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Aún no asignado</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
