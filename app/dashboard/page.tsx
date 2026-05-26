'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingDown, TrendingUp, Route, Bell, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getRoutes } from '@/lib/supabase/routes'
import { RouteCard } from '@/components/RouteCard'
import type { MonitoredRoute } from '@/lib/types'

export default function DashboardPage() {
  const [routes, setRoutes] = useState<MonitoredRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      getRoutes(data.user.id).then((r) => { setRoutes(r); setLoading(false) })
    })
  }, [])

  const active = routes.filter((r) => r.active)
  const dropping = routes.filter((r) => r.latest_price?.miles_price && r.latest_price.miles_price < 50000)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-slate-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Visão geral dos seus monitoramentos</p>
        </div>
        <Link href="/monitoramentos/novo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Novo monitoramento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rotas ativas', value: active.length, icon: Route, color: 'text-blue-600' },
          { label: 'Total monitoradas', value: routes.length, icon: Route, color: 'text-gray-600' },
          { label: 'Com queda recente', value: dropping.length, icon: TrendingDown, color: 'text-green-600' },
          { label: 'Alertas hoje', value: 0, icon: Bell, color: 'text-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <p className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Routes */}
      {routes.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Route size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="font-medium text-gray-600 dark:text-slate-400">Nenhuma rota monitorada ainda</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 mb-4">Adicione rotas para acompanhar a variação de milhas</p>
          <Link href="/monitoramentos/novo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={14} />
            Adicionar primeira rota
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  )
}
