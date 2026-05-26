'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getRoutes, updateRoute, deleteRoute } from '@/lib/supabase/routes'
import { RouteCard } from '@/components/RouteCard'
import type { MonitoredRoute } from '@/lib/types'

export default function MonitoramentosPage() {
  const [routes, setRoutes] = useState<MonitoredRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      getRoutes(data.user.id).then((r) => { setRoutes(r); setLoading(false) })
    })
  }, [])

  async function handleToggle(id: string, active: boolean) {
    await updateRoute(id, { active })
    setRoutes((prev) => prev.map((r) => r.id === id ? { ...r, active } : r))
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este monitoramento?')) return
    await deleteRoute(id)
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Monitoramentos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{routes.length} rota{routes.length !== 1 ? 's' : ''} cadastrada{routes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/monitoramentos/novo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Nova rota
        </Link>
      </div>

      {routes.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <p className="font-medium text-gray-600 dark:text-slate-400">Nenhuma rota cadastrada</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Pesquise um voo e adicione ao monitoramento</p>
          <Link href="/pesquisa" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Ir para pesquisa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} onToggleActive={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
