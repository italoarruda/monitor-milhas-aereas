'use client'

import Link from 'next/link'
import { ArrowRight, TrendingDown, TrendingUp, Minus, Pause, Play, Trash2 } from 'lucide-react'
import { cn, formatMiles, formatCurrency, airlineName, cabinName, priceChangePercent } from '@/lib/utils'
import type { MonitoredRoute } from '@/lib/types'

const AIRLINE_COLORS: Record<string, string> = {
  smiles: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  latam:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  azul:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
}

interface Props {
  route: MonitoredRoute
  previousPrice?: number | null
  onToggleActive?: (id: string, active: boolean) => void
  onDelete?: (id: string) => void
}

export function RouteCard({ route, previousPrice, onToggleActive, onDelete }: Props) {
  const current = route.latest_price?.miles_price ?? null
  const change = current && previousPrice ? priceChangePercent(current, previousPrice) : null
  const isDropping = change !== null && change < 0
  const isRising = change !== null && change > 0

  return (
    <div className={cn('bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4 transition-opacity', !route.active && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-slate-100">
              <span>{route.origin_iata}</span>
              <ArrowRight size={16} className="text-gray-400" />
              <span>{route.destination_iata}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {route.origin_airport?.city} → {route.destination_airport?.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn('text-xs font-medium border rounded-full px-2 py-0.5', AIRLINE_COLORS[route.airline])}>
            {airlineName(route.airline)}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatMiles(current)}</p>
          {route.latest_price?.cash_fee && (
            <p className="text-xs text-gray-400 dark:text-slate-500">+ {formatCurrency(route.latest_price.cash_fee)} em taxas</p>
          )}
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{cabinName(route.cabin_class)}</p>
        </div>
        {change !== null && (
          <div className={cn('flex items-center gap-1 text-sm font-semibold rounded-lg px-2 py-1', isDropping ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : isRising ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 bg-gray-50 dark:bg-slate-800')}>
            {isDropping ? <TrendingDown size={14} /> : isRising ? <TrendingUp size={14} /> : <Minus size={14} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      {route.is_azul_diamond && (
        <p className="text-xs text-blue-600 dark:text-blue-400">★ Desconto Diamante aplicado (−10%)</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-800">
        <Link href={`/monitoramentos/${route.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Ver histórico →
        </Link>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleActive?.(route.id, !route.active)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={route.active ? 'Pausar monitoramento' : 'Retomar monitoramento'}
          >
            {route.active ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => onDelete?.(route.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
            title="Excluir monitoramento"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
