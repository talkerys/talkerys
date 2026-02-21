'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { LEVELS, PLANS } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import type { EnglishLevel, PaymentMethod } from '@/types/database'

const PAYMENT_SETTINGS: Record<string, string> = {
  yape: '999-999-999',
  plin: '999-999-999',
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<EnglishLevel>('beginner')
  const [planSlug, setPlanSlug] = useState('session')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('yape')
  const [accepted, setAccepted] = useState(false)

  const selectedPlan = PLANS.find((p) => p.slug === planSlug)!

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!accepted) {
      setError('Debes aceptar la política de pagos para continuar')
      return
    }
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const full_name = String(form.get('full_name') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone, english_level: level },
      },
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message || 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // Wait a moment for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 2. Get plan id
    const { data: planData } = await supabase
      .from('plans')
      .select('id, sessions_included')
      .eq('slug', planSlug)
      .single()

    if (!planData) {
      setError('Error al obtener el plan')
      setLoading(false)
      return
    }

    // 3. Create subscription
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planData.id,
        status: 'pending',
        sessions_remaining: planData.sessions_included,
      })
      .select('id')
      .single()

    if (subError || !subData) {
      setError('Error al crear la suscripción')
      setLoading(false)
      return
    }

    // 4. Create payment
    await supabase.from('payments').insert({
      user_id: userId,
      subscription_id: subData.id,
      amount: selectedPlan.price,
      method: payMethod,
      status: 'pending',
    })

    toast.success('¡Registro exitoso! Tu pago está siendo verificado')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-primary">
            Talkerys
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Únete al club</h1>
          <p className="text-gray-500 text-sm">Completa tus datos para empezar</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Nombre */}
            <Input
              label="Nombre completo"
              name="full_name"
              type="text"
              placeholder="Juan Pérez"
              required
              autoComplete="name"
            />

            {/* WhatsApp */}
            <Input
              label="WhatsApp"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="+51 999 999 999"
              required
            />

            {/* Nivel */}
            <div>
              <p className="block text-sm font-medium text-gray-600 mb-2">Nivel de inglés</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id as EnglishLevel)}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-colors',
                      level === l.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <div className="text-sm font-semibold">{l.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            {/* Password */}
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />

            {/* Plan */}
            <div>
              <p className="block text-sm font-medium text-gray-600 mb-2">Elige tu plan</p>
              <div className="space-y-2">
                {PLANS.map((plan) => (
                  <button
                    key={plan.slug}
                    type="button"
                    onClick={() => setPlanSlug(plan.slug)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left',
                      planSlug === plan.slug
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div>
                      <span className={cn('font-semibold text-sm', planSlug === plan.slug ? 'text-primary' : 'text-gray-900')}>
                        {plan.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">{plan.tag}</span>
                    </div>
                    <span className={cn('font-bold', planSlug === plan.slug ? 'text-primary' : 'text-gray-700')}>
                      {formatCurrency(plan.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <p className="block text-sm font-medium text-gray-600 mb-2">Método de pago</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['yape', 'plin'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayMethod(method)}
                    className={cn(
                      'py-3 rounded-xl border font-semibold text-sm capitalize transition-colors',
                      payMethod === method
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-medium mb-1">Envía {formatCurrency(selectedPlan.price)} a:</p>
                <p className="text-lg font-bold text-gray-900">{PAYMENT_SETTINGS[payMethod]}</p>
                <p className="text-xs text-gray-400 mt-1">Nuestro equipo verificará tu pago en menos de 24 horas</p>
              </div>
            </div>

            {/* Política */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                Acepto que los pagos <strong>no son reembolsables</strong> ni postergables bajo ninguna circunstancia.
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Registrarme y pagar {formatCurrency(selectedPlan.price)}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
