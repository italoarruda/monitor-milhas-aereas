'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { createRoute } from '@/lib/supabase/routes'
import { AirportSearch } from '@/components/AirportSearch'
import { cn, airlineName, cabinName } from '@/lib/utils'
import type { Airport, Airline, CabinClass } from '@/lib/types'

const AIRLINES: Airline[] = ['smiles', 'latam', 'azul']
const CABINS: CabinClass[] = ['economy', 'business', 'first']

const AIRLINE_COLORS: Record<Airline, string> = {
  smiles: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  latam:  'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20',
  azul:   'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20',
}

export default function NovoMonitoramentoPage() {
  const router = useRouter()
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [destination, setDestination] = useState<Airport | null>(null)
  const [airline, setAirline] = useState<Airline>('smiles')
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [isDiamond, setIsDiamond] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyTelegram, setNotifyTelegram] = useState(false)
  const [threshold, setThreshold] = useState(5)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!origin || !destination) { setError('Selecione origem e destino.'); return }
    setSaving(true)
    setError('')
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push('/login'); return }

      const route = await createRoute({
        user_id: data.user.id,
        origin_iata: origin.iata_code,
        destination_iata: destination.iata_code,
        airline,
        cabin_class: cabin,
        is_azul_diamond: airline === 'azul' ? isDiamond : false,
        active: true,
      })

      router.push(`/monitoramentos/${route.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/monitoramentos" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Novo Monitoramento</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Acompanhe a variação de milhas em uma rota</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-6">
        {/* Airline */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Companhia aérea</label>
          <div className="grid grid-cols-3 gap-2">
            {AIRLINES.map((a) => (
              <button
                key={a}
                onClick={() => setAirline(a)}
                className={cn(
                  'py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all',
                  airline === a ? AIRLINE_COLORS[a] : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400',
                )}
              >
                {airlineName(a)}
              </button>
            ))}
          </div>
        </div>

        {/* Origin / Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Rota</label>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <AirportSearch label="Origem" placeholder="Cidade ou aeroporto" value={origin} onChange={setOrigin} />
            </div>
            <button
              onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp) }}
              className="shrink-0 w-10 self-center rounded-full border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center h-10 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeftRight size={16} className="text-gray-400" />
            </button>
            <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <AirportSearch label="Destino" placeholder="Cidade ou aeroporto" value={destination} onChange={setDestination} icon="pin" />
            </div>
          </div>
        </div>

        {/* Cabin */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Classe</label>
          <div className="grid grid-cols-3 gap-2">
            {CABINS.map((c) => (
              <button
                key={c}
                onClick={() => setCabin(c)}
                className={cn(
                  'py-2 px-3 rounded-lg border text-sm transition-all',
                  cabin === c
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400',
                )}
              >
                {cabinName(c)}
              </button>
            ))}
          </div>
        </div>

        {/* Azul Diamond */}
        {airline === 'azul' && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-200 dark:border-blue-800">
            <Star size={16} className="text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Cliente Diamante Azul?</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Aplica 10% de desconto no preço em milhas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isDiamond} onChange={(e) => setIsDiamond(e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        {/* Alert config */}
        <div className="space-y-3 border-t border-gray-100 dark:border-slate-800 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Configuração de alertas</p>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-slate-400 flex-1">Alertar quando variação ≥</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min={1}
                max={50}
                className="w-16 text-center border border-gray-200 dark:border-slate-700 rounded-lg py-1 text-sm bg-transparent outline-none focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="rounded border-gray-300" />
              Email
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={notifyTelegram} onChange={(e) => setNotifyTelegram(e.target.checked)} className="rounded border-gray-300" />
              Telegram
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!origin || !destination || saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Salvando...' : 'Criar monitoramento'}
        </button>
      </div>
    </div>
  )
}
