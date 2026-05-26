'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlaneTakeoff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <PlaneTakeoff size={28} className="text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">Monitor Milhas</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Entrar na sua conta</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Acompanhe a variação de milhas das companhias aéreas</p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-slate-100 placeholder:text-gray-400"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Senha</label>
                <Link href="/esqueci-senha" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Esqueci a senha</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
