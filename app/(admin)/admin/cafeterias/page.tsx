'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { MapPin, Phone, MessageCircle, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateWhatsAppUrl } from '@/lib/utils'
import type { Cafeteria } from '@/types/database'

const empty: Omit<Cafeteria, 'id' | 'created_at'> = {
  name: '',
  address: '',
  district: 'Miraflores',
  google_maps_url: '',
  phone: '',
  max_tables: 3,
  notes: '',
  is_active: true,
}

export default function CafeteriasPage() {
  const supabase = createClient()
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('cafeterias').select('*').order('name')
    setCafeterias((data || []) as Cafeteria[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(c: Cafeteria) {
    setEditId(c.id)
    setForm({ name: c.name, address: c.address, district: c.district, google_maps_url: c.google_maps_url, phone: c.phone, max_tables: c.max_tables, notes: c.notes, is_active: c.is_active })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(empty)
  }

  async function save() {
    if (!form.name || !form.address) {
      toast.error('Nombre y dirección son requeridos')
      return
    }
    setSaving(true)
    if (editId) {
      const { error } = await supabase.from('cafeterias').update(form).eq('id', editId)
      if (error) toast.error('Error al guardar')
      else { toast.success('Cafetería actualizada'); cancelForm(); load() }
    } else {
      const { error } = await supabase.from('cafeterias').insert(form)
      if (error) toast.error('Error al crear')
      else { toast.success('Cafetería creada'); cancelForm(); load() }
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cafeterías</h1>
        <Button size="sm" onClick={() => { cancelForm(); setShowForm(true) }}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editId ? 'Editar cafetería' : 'Nueva cafetería'}</h2>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Café de Lima" />
            <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Av. Larco 345, Miraflores" />
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="999000001" type="tel" />
            <Input label="Google Maps URL" value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.google.com/..." />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Ambiente, capacidad, observaciones..."
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" />
              <span className="text-sm text-gray-600">Activa</span>
            </label>
            <div className="flex gap-2 pt-1">
              <Button loading={saving} onClick={save}>Guardar</Button>
              <Button variant="ghost" onClick={cancelForm}>Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {cafeterias.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin size={13} />
                    {c.address}
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Phone size={13} />
                      {c.phone}
                    </div>
                  )}
                  {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(c)}>Editar</Button>
                  {c.phone && (
                    <a
                      href={generateWhatsAppUrl(c.phone, `Hola, soy de Talkerys. Quisiera consultar sobre disponibilidad.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {cafeterias.length === 0 && (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-3">☕</div>
                <p>No hay cafeterías registradas</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
