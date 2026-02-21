'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PayStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PaymentStatus } from '@/types/database'

interface PaymentRow {
  id: number
  user_id: string
  subscription_id: number | null
  amount: number
  method: string
  status: PaymentStatus
  voucher_url: string
  reference: string
  rejection_reason: string
  created_at: string
  profile: { full_name: string; phone: string } | null
  subscription: { plan: { name: string } | null } | null
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('payments')
      .select('*, profile:profiles(full_name, phone), subscription:subscriptions(plan:plans(name))')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query
    setPayments((data || []) as unknown as PaymentRow[])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function approve(payment: PaymentRow) {
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Update payment
    await supabase.from('payments').update({
      status: 'verified',
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    }).eq('id', payment.id)

    // Update subscription
    if (payment.subscription_id) {
      const today = new Date()
      const expires = new Date(today)
      expires.setDate(expires.getDate() + 30)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, plan:plans(sessions_included)')
        .eq('id', payment.subscription_id)
        .single()

      if (sub) {
        await supabase.from('subscriptions').update({
          status: 'active',
          sessions_remaining: (sub as any).plan?.sessions_included || 0,
          starts_at: today.toISOString().split('T')[0],
          expires_at: expires.toISOString().split('T')[0],
        }).eq('id', payment.subscription_id)
      }
    }

    // Update profile status
    await supabase.from('profiles').update({ status: 'active' }).eq('id', payment.user_id)

    toast.success('Pago aprobado')
    setActionLoading(false)
    load()
  }

  async function reject(id: number) {
    if (!rejectReason.trim()) {
      toast.error('Indica el motivo del rechazo')
      return
    }
    setActionLoading(true)
    await supabase.from('payments').update({
      status: 'rejected',
      rejection_reason: rejectReason,
    }).eq('id', id)

    toast.success('Pago rechazado')
    setRejectId(null)
    setRejectReason('')
    setActionLoading(false)
    load()
  }

  const pending = payments.filter((p) => p.status === 'pending')
  const rest = payments.filter((p) => p.status !== 'pending')

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-amber-800">⏳ Pagos pendientes ({pending.length})</h2>
          {pending.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{payment.profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{payment.profile?.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {payment.subscription?.plan?.name} · {payment.method.toUpperCase()} · {formatDate(payment.created_at)}
                  </p>
                </div>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
              </div>
              {rejectId === payment.id ? (
                <div className="space-y-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Motivo del rechazo..."
                    className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" loading={actionLoading} onClick={() => reject(payment.id)}>
                      Confirmar rechazo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRejectId(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" loading={actionLoading} onClick={() => approve(payment)}>
                    ✅ Aprobar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => { setRejectId(payment.id); setRejectReason('') }}>
                    ❌ Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-gray-700">Historial</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PaymentStatus | 'all')}
          className="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="verified">Verificado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {rest.map((payment) => (
            <Card key={payment.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{payment.profile?.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {payment.subscription?.plan?.name} · {payment.method.toUpperCase()} · {formatDate(payment.created_at)}
                  </p>
                  {payment.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">Motivo: {payment.rejection_reason}</p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                  <PayStatusBadge status={payment.status} />
                </div>
              </div>
            </Card>
          ))}
          {rest.length === 0 && (
            <Card>
              <p className="text-center text-gray-400 py-6 text-sm">No hay pagos en esta categoría</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
