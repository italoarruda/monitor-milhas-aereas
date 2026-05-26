'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Trash2, Pause, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getRoute, getPriceHistory, updateRoute, deleteRoute } from '@/lib/supabase/routes'
import { MilesChart } from '@/components/MilesChart'
import { airlineName, cabinName, formatMiles, formatCurrency } from '@/lib/utils'
import type { MonitoredRoute, PriceHistory } from '@/lib/types'

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [route, setRoute] = useState<MonitoredRoute | null>(null)
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRoute(id), getPriceHistory(id, 60)]).then(([r, h]) => {
      setRoute(r)
      setHistory(h)
      setLoading(false)
    })
  }, [id])

  async function handleToggle() {
    if (!route) return
    await updateRoute(id, { active: !route.active })
    setRoute({ ...route, active: !route.active })
  }

  async function handleDelete() {
    if (!confirm('Excluir este monitoramento e todo o histórico?')) return
    await deleteRoute(id)
    router.push('/monitoramentos')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
  if (!route) return <div className="text-center text-gray-500 mt-12">Rota não encontrada.</div>

  const latest = history[history.length - 1]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/monitoramentos" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-slate-100">
            <span>{route.origin_iata}</span>
            <ArrowRight size={16} className="text-gray-400" />
            <span>{route.destination_iata}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {airlineName(route.airline)} · {cabinName(route.cabin_class)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggle} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            {route.active ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Retomar</>}
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      </div>

      {/* Current price */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Último preço coletado</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-slate-100">{formatMiles(latest?.miles_price ?? null)}</p>
        {latest?.cash_fee && <p className="text-sm text-gray-400 mt-1">+ {formatCurrency(latest.cash_fee)} em taxas</p>}
        {latest && (
          <p className="text-xs text-gray-400 mt-2">
            Atualizado em {new Date(latest.checked_at).toLocaleString('pt-BR')}
          </p>
        )}
        {route.is_azul_diamond && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">★ Desconto Diamante Azul aplicado (−10%)</p>
        )}
      </div>

      {/* Chart */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">Evolução do preço</h2>
        <MilesChart data={history} />
      </div>

      {/* History table */}
      {history.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">Histórico de coletas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800">
                  <th className="text-left py-2 text-xs font-medium text-gray-400 dark:text-slate-500">Data</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-400 dark:text-slate-500">Milhas</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-400 dark:text-slate-500">Taxas</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-400 dark:text-slate-500">R$/milha</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-slate-800/50">
                    <td className="py-2 text-gray-600 dark:text-slate-400">{new Date(p.checked_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-slate-100">{p.miles_price?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="py-2 text-right text-gray-500">{p.cash_fee ? formatCurrency(p.cash_fee) : '—'}</td>
                    <td className="py-2 text-right text-gray-500">{p.miles_per_brl ? `R$ ${p.miles_per_brl.toFixed(4)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
