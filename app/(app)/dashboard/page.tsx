import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { LevelBadge, UserStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatTime, getExperienceBadge, generateWhatsAppUrl } from '@/lib/utils'
import { Profile, Subscription, Session, SessionTable, TableAssignment } from '@/types/database'
import { MapPin, MessageCircle, Calendar, Clock, Coffee } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch pending payment if pending status
  const { data: pendingPayment } = profile.status === 'pending'
    ? await supabase
        .from('payments')
        .select('*, subscription:subscriptions(*, plan:plans(*))')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  // Fetch club settings for WhatsApp
  const { data: settings } = await supabase
    .from('club_settings')
    .select('key, value')

  const settingsMap = Object.fromEntries((settings || []).map((s: { key: string; value: string }) => [s.key, s.value]))

  // Fetch next session assignment
  const today = new Date().toISOString().split('T')[0]
  const { data: myAssignment } = await supabase
    .from('table_assignments')
    .select(`
      *,
      table:session_tables(
        *,
        session:sessions(*, cafeteria:cafeterias(*))
      )
    `)
    .eq('user_id', user.id)
    .gte('table.session.session_date', today)
    .order('table.session.session_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // Fetch tablemates if assigned
  let tablemates: Array<Profile & { attended: boolean }> = []
  if (myAssignment?.table_id) {
    const { data: mates } = await supabase
      .from('table_assignments')
      .select('*, profile:profiles(*)')
      .eq('table_id', myAssignment.table_id)
      .neq('user_id', user.id)

    tablemates = (mates || []).map((m: TableAssignment & { profile: Profile }) => ({
      ...m.profile,
      attended: m.attended,
    }))
  }

  // Fetch session history
  const { data: history } = await supabase
    .from('table_assignments')
    .select(`
      attended,
      table:session_tables(
        session:sessions(*, cafeteria:cafeterias(*))
      )
    `)
    .eq('user_id', user.id)
    .lt('table.session.session_date', today)
    .order('table.session.session_date', { ascending: false })
    .limit(10)

  const firstName = profile.full_name.split(' ')[0]
  const experience = getExperienceBadge(profile.sessions_attended)

  const nextSession = myAssignment?.table as (SessionTable & { session: Session & { cafeteria: any } }) | undefined
  const nextSessionData = nextSession?.session

  // WhatsApp message for pending payment
  const planName = (pendingPayment as any)?.subscription?.plan?.name || 'un plan'
  const payAmount = (pendingPayment as any)?.subscription?.plan?.price
  const payMethod = (pendingPayment as any)?.method || 'Yape'
  const payNumber = payMethod === 'yape' ? settingsMap['yape_number'] : settingsMap['plin_number']
  const waMsg = `Hola, soy ${profile.full_name}. Acabo de registrarme en Talkerys con el plan ${planName}. Adjunto mi comprobante de pago.`
  const waUrl = generateWhatsAppUrl(settingsMap['contact_whatsapp'] || '51999999999', waMsg)

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {firstName}!</h1>
          <p className="text-gray-500 text-sm mt-0.5">{experience.label} {experience.emoji}</p>
        </div>
        <UserStatusBadge status={profile.status} />
      </div>

      {/* Pago pendiente */}
      {profile.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-800 mb-2">Tu pago está siendo verificado</h3>
          <p className="text-amber-700 text-sm mb-4">
            {payAmount && payNumber
              ? `Envía ${formatCurrency(payAmount)} por ${payMethod} al ${payNumber} y manda el comprobante por WhatsApp.`
              : 'Nuestro equipo revisará tu pago pronto.'}
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <MessageCircle size={16} />
            Enviar por WhatsApp
          </a>
        </div>
      )}

      {/* Mi plan */}
      {subscription && (
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Mi plan</p>
              <p className="font-semibold text-gray-900">{(subscription as any).plan?.name}</p>
              <p className="text-sm text-gray-500">{formatCurrency((subscription as any).plan?.price)}</p>
            </div>
            {subscription.expires_at && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Vence</p>
                <p className="text-sm text-gray-600">{formatDate(subscription.expires_at)}</p>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sesiones</span>
              <span className="font-semibold text-gray-900">
                {subscription.sessions_remaining} / {(subscription as any).plan?.sessions_included}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${((subscription as any).plan?.sessions_included > 0
                    ? (subscription.sessions_remaining / (subscription as any).plan?.sessions_included) * 100
                    : 0)}%`,
                }}
              />
            </div>
          </div>
          {subscription.sessions_remaining === 0 && (
            <Link
              href="/register"
              className="mt-3 inline-flex items-center text-sm text-primary font-medium hover:underline"
            >
              Renovar plan →
            </Link>
          )}
        </Card>
      )}

      {/* Próxima sesión */}
      {nextSessionData && (
        <div className="bg-navy rounded-3xl p-6 text-white">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Próxima sesión
          </span>
          <h2 className="text-xl font-bold mb-4">{nextSessionData.topic}</h2>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-primary flex-shrink-0" />
              {formatDate(nextSessionData.session_date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary flex-shrink-0" />
              {formatTime(nextSessionData.time_start)} - {formatTime(nextSessionData.time_end)}
            </div>
            {nextSessionData.cafeteria && (
              <>
                <div className="flex items-center gap-2">
                  <Coffee size={15} className="text-primary flex-shrink-0" />
                  {nextSessionData.cafeteria.name}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-primary flex-shrink-0" />
                  <span>{nextSessionData.cafeteria.address}</span>
                  {nextSessionData.cafeteria.google_maps_url && (
                    <a
                      href={nextSessionData.cafeteria.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-light text-xs underline ml-1"
                    >
                      Ver en Maps
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mesa */}
          {nextSession && (
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Mesa {nextSession.table_label}
                {nextSession.target_level && ` · ${nextSession.target_level}`}
              </p>
              {nextSession.moderator_name && (
                <p className="text-sm text-white/60 mb-3">Moderador: {nextSession.moderator_name}</p>
              )}
              {tablemates.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {tablemates.map((mate) => {
                    const exp = getExperienceBadge(mate.sessions_attended)
                    return (
                      <div key={mate.id} className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5">
                        <Avatar name={mate.full_name} url={mate.avatar_url || undefined} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{mate.full_name.split(' ')[0]}</p>
                          <LevelBadge level={mate.english_level} className="text-[10px]" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Tu progreso 🚀</h3>
        {!history || history.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Tus sesiones aparecerán aquí después de tu primera reunión
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4">
              {(history as any[]).map((item, i) => {
                const session = item.table?.session
                if (!session) return null
                return (
                  <div key={i} className="flex items-start gap-4 pl-8 relative">
                    <div className={`absolute left-2 top-1.5 w-2 h-2 rounded-full border-2 ${item.attended ? 'bg-emerald-400 border-emerald-400' : 'bg-gray-200 border-gray-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(session.session_date)}
                        {session.cafeteria && ` · ${session.cafeteria.name}`}
                      </p>
                      <span className={`text-xs mt-0.5 inline-block ${item.attended ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {item.attended ? '✅ Asistió' : '❌ No asistió'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
