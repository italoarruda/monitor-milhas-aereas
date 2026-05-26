'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlaneTakeoff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function CadastroPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-5xl">✉️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Confirme seu email</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada.</p>
          <Link href="/login" className="block text-blue-600 dark:text-blue-400 text-sm hover:underline">Ir para o login</Link>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Criar conta</h1>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 text-gray-900 dark:text-slate-100"
                placeholder="Mínimo 6 caracteres" />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400">
          Já tem conta?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
