import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import { SessionStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatTime } from '@/lib/utils'
import { Plus, MapPin, Clock } from 'lucide-react'

export default async function AdminSessionsPage() {
  const supabase = createClient()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, cafeteria:cafeterias(name, address)')
    .order('session_date', { ascending: false })

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sesiones</h1>
        <Link
          href="/admin/sessions/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
        >
          <Plus size={16} /> Nueva sesión
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium">No hay sesiones</p>
            <p className="text-sm mt-1">Crea la primera sesión</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {(sessions as any[]).map((session) => (
            <Link key={session.id} href={`/admin/sessions/${session.id}`}>
              <Card className="hover:border-gray-200 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                      <SessionStatusBadge status={session.status} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{session.title}</p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span>📅</span>
                        {formatDate(session.session_date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatTime(session.time_start)} - {formatTime(session.time_end)}
                      </div>
                      {session.cafeteria && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {session.cafeteria.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
