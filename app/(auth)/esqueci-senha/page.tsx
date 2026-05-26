'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlaneTakeoff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/nova-senha`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Email enviado!</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
          <Link href="/login" className="block text-blue-600 text-sm hover:underline">Voltar ao login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <PlaneTakeoff size={28} className="text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">Monitor Milhas</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Recuperar senha</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Enviaremos um link de redefinição para seu email</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                placeholder="seu@email.com" />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-slate-400">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
