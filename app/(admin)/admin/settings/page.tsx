'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Setting {
  key: string
  value: string
}

const LABELS: Record<string, string> = {
  yape_number: 'Número Yape',
  plin_number: 'Número Plin',
  contact_whatsapp: 'WhatsApp de contacto',
}

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('club_settings').select('key, value')
      const map: Record<string, string> = {}
      for (const s of (data || []) as Setting[]) {
        map[s.key] = s.value
      }
      setSettings(map)
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('club_settings').upsert({ key, value }, { onConflict: 'key' })
    }
    toast.success('Configuración guardada')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Datos de pago y contacto</h2>
        <div className="space-y-4">
          {Object.keys(LABELS).map((key) => (
            <Input
              key={key}
              label={LABELS[key]}
              value={settings[key] || ''}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              placeholder={key === 'contact_whatsapp' ? '+51999999999' : '999-999-999'}
            />
          ))}
          <Button loading={saving} onClick={save} fullWidth>
            Guardar configuración
          </Button>
        </div>
      </Card>
    </div>
  )
}
