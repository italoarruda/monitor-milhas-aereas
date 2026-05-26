'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getProfile, upsertProfile } from '@/lib/supabase/profile'
import type { UserProfile } from '@/lib/types'

export default function PerfilPage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setEmail(data.user.email ?? '')
      getProfile(data.user.id).then((p) => {
        if (p) setProfile(p)
        else setProfile({ id: data.user!.id })
        setLoading(false)
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return
      await upsertProfile({ ...profile, id: data.user.id })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Perfil</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Gerencie suas informações e preferências de notificação</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Informações pessoais</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome completo</label>
            <input type="text" value={profile.full_name ?? ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
              placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" value={email} disabled
              className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-slate-900 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado por aqui.</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Notificações</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Telegram Chat ID</label>
            <input type="text" value={profile.telegram_chat_id ?? ''} onChange={(e) => setProfile({ ...profile, telegram_chat_id: e.target.value })}
              className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
              placeholder="Ex: 123456789" />
            <p className="text-xs text-gray-400 mt-1">Para obter seu Chat ID, inicie uma conversa com @userinfobot no Telegram.</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Status Diamante Azul (global)</p>
              <p className="text-xs text-gray-400 mt-0.5">Aplica 10% de desconto automaticamente em rotas Azul</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={profile.is_azul_diamond ?? false} onChange={(e) => setProfile({ ...profile, is_azul_diamond: e.target.checked })} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
