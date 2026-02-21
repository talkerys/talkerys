'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { generateWhatsAppUrl, formatDate, formatTime } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Cafeteria } from '@/types/database'

export default function NewSessionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([])
  const [selectedCafe, setSelectedCafe] = useState<Cafeteria | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    topic: '',
    description: '',
    session_date: '',
    time_start: '20:00',
    time_end: '22:00',
    cafeteria_id: '',
    notes: '',
  })

  useEffect(() => {
    supabase.from('cafeterias').select('*').eq('is_active', true).order('name').then(({ data }) => {
      setCafeterias((data || []) as Cafeteria[])
    })
  }, [])

  function selectCafe(id: string) {
    setForm({ ...form, cafeteria_id: id })
    setSelectedCafe(cafeterias.find((c) => c.id === Number(id)) || null)
  }

  const reserveWaUrl = selectedCafe
    ? generateWhatsAppUrl(
        selectedCafe.phone,
        `Hola, soy de Talkerys. Quisiera reservar mesas para el ${form.session_date ? formatDate(form.session_date) : '{fecha}'} de ${form.time_start} a ${form.time_end}. Gracias!`
      )
    : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.topic || !form.session_date) {
      toast.error('Completa los campos requeridos')
      return
    }
    setLoading(true)

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        title: form.title,
        topic: form.topic,
        description: form.description,
        session_date: form.session_date,
        time_start: form.time_start,
        time_end: form.time_end,
        cafeteria_id: form.cafeteria_id ? Number(form.cafeteria_id) : null,
        notes: form.notes,
      })
      .select('id')
      .single()

    if (error || !data) {
      toast.error('Error al crear la sesión')
      setLoading(false)
      return
    }

    toast.success('Sesión creada')
    router.push(`/admin/sessions/${data.id}`)
  }

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Nueva sesión</h1>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Título *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Sesión #12"
            required
          />
          <Input
            label="Tema *"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="Travel & Experiences"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Descripción opcional..."
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>
          <Input
            label="Fecha *"
            type="date"
            value={form.session_date}
            onChange={(e) => setForm({ ...form, session_date: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hora inicio"
              type="time"
              value={form.time_start}
              onChange={(e) => setForm({ ...form, time_start: e.target.value })}
            />
            <Input
              label="Hora fin"
              type="time"
              value={form.time_end}
              onChange={(e) => setForm({ ...form, time_end: e.target.value })}
            />
          </div>

          {/* Cafetería */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Cafetería</label>
            <select
              value={form.cafeteria_id}
              onChange={(e) => selectCafe(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            >
              <option value="">Seleccionar cafetería...</option>
              {cafeterias.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedCafe && (
              <div className="mt-2 bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <p>{selectedCafe.address}</p>
                {selectedCafe.phone && reserveWaUrl && (
                  <a
                    href={reserveWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs hover:underline"
                  >
                    <MessageCircle size={13} />
                    📱 Reservar por WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Notas internas..."
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Crear sesión
          </Button>
        </form>
      </Card>
    </div>
  )
}
