import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { LevelBadge, PayStatusBadge, UserStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, CreditCard, DollarSign, Calendar } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const [
    { count: activeMembers },
    { count: pendingPayments },
    { data: monthPayments },
    { count: monthSessions },
    { data: recentProfiles },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payments').select('amount').eq('status', 'verified').gte('verified_at', startOfMonth).lte('verified_at', endOfMonth),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('session_date', startOfMonth.split('T')[0]).lte('session_date', endOfMonth.split('T')[0]),
    supabase.from('profiles').select('*, subscriptions(*, plan:plans(*)), payments(status, amount, method)').order('created_at', { ascending: false }).limit(5),
  ])

  const monthRevenue = (monthPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const kpis = [
    { label: 'Miembros activos', value: activeMembers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pagos pendientes', value: pendingPayments ?? 0, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Ingresos del mes', value: formatCurrency(monthRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Sesiones del mes', value: monthSessions ?? 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent registrations */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Últimos registros</h2>
        {!recentProfiles || recentProfiles.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay registros aún</p>
        ) : (
          <div className="space-y-3">
            {(recentProfiles as any[]).map((p) => {
              const latestSub = p.subscriptions?.[0]
              const latestPay = p.payments?.[0]
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm truncate">{p.full_name}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <LevelBadge level={p.english_level} />
                    {latestPay && <PayStatusBadge status={latestPay.status} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
