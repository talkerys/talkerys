'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { LevelBadge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { LEVELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { EnglishLevel, Profile } from '@/types/database'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState<EnglishLevel>('beginner')
  const [bio, setBio] = useState('')
  const MAX_BIO = 200

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setLevel(data.english_level as EnglishLevel)
        setBio(data.bio || '')
      }
    }
    load()
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const full_name = String(form.get('full_name') || '').trim()
    const phone = String(form.get('phone') || '').trim()

    const { error } = await supabase
      .from('profiles')
      .update({ full_name, phone, english_level: level, bio, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) {
      toast.error('Error al guardar los cambios')
    } else {
      toast.success('Perfil actualizado')
      setProfile({ ...profile, full_name, phone, english_level: level, bio })
      router.refresh()
    }
    setLoading(false)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar name={profile.full_name} url={profile.avatar_url || undefined} size="lg" />
        <div>
          <p className="font-semibold text-gray-900">{profile.full_name}</p>
          <LevelBadge level={profile.english_level} className="mt-1" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            name="full_name"
            defaultValue={profile.full_name}
            required
          />
          <Input
            label="WhatsApp"
            name="phone"
            type="tel"
            defaultValue={profile.phone}
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
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Bio{' '}
              <span className="text-gray-400 font-normal">({bio.length}/{MAX_BIO})</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <Button type="submit" loading={loading} fullWidth>
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  )
}
