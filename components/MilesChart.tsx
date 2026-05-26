'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { PriceHistory } from '@/lib/types'

interface Props {
  data: PriceHistory[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-semibold text-gray-900 dark:text-slate-100">{label}</p>
      <p className="text-blue-600 dark:text-blue-400">{payload[0]?.value?.toLocaleString('pt-BR')} milhas</p>
    </div>
  )
}

export function MilesChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">
        Nenhum dado histórico disponível ainda.
      </div>
    )
  }

  const chartData = data.map((p) => ({
    date: formatDate(p.checked_at),
    milhas: p.miles_price,
    taxa: p.cash_fee,
  }))

  const values = data.map((p) => p.miles_price).filter(Boolean) as number[]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs text-gray-500 dark:text-slate-400">
        <span>Mín: <strong className="text-green-600 dark:text-green-400">{min.toLocaleString('pt-BR')}</strong></span>
        <span>Máx: <strong className="text-red-500">{max.toLocaleString('pt-BR')}</strong></span>
        <span>Média: <strong className="text-gray-700 dark:text-slate-200">{avg.toLocaleString('pt-BR')}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avg} stroke="#94a3b8" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="milhas"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
