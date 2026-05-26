'use client'

import { useState } from 'react'
import { ArrowLeftRight, Search, Calendar, Users, PlaneTakeoff, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AirportSearch } from '@/components/AirportSearch'
import type { Airport, Airline, CabinClass } from '@/lib/types'

type TripType = 'oneway' | 'roundtrip'

const AIRLINES: { id: Airline; label: string; color: string; bg: string; badgeBg: string; buttonBg: string }[] = [
  {
    id: 'smiles',
    label: 'GOL Smiles',
    color: 'text-orange-600',
    bg: 'border-orange-500',
    badgeBg: 'bg-orange-500',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: 'latam',
    label: 'LATAM Pass',
    color: 'text-red-600',
    bg: 'border-red-500',
    badgeBg: 'bg-red-600',
    buttonBg: 'bg-red-600 hover:bg-red-700',
  },
  {
    id: 'azul',
    label: 'Azul Infinito',
    color: 'text-blue-600',
    bg: 'border-blue-600',
    badgeBg: 'bg-blue-700',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
]

const CABINS: { id: CabinClass; label: string }[] = [
  { id: 'economy', label: 'Cabine Econômica' },
  { id: 'business', label: 'Executiva' },
  { id: 'first', label: 'Primeira Classe' },
]

const RECENT_SEARCHES = [
  { label: 'GRU ↔ CGH · Hoje' },
  { label: 'GRU ↔ BSB · 01/07' },
  { label: 'GIG ↔ FOR · 15/07' },
]

export default function PesquisaPage() {
  const [airline, setAirline] = useState<Airline>('smiles')
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [destination, setDestination] = useState<Airport | null>(null)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [adults, setAdults] = useState(1)
  const [isDiamond, setIsDiamond] = useState(false)
  const [loading, setLoading] = useState(false)

  const selected = AIRLINES.find((a) => a.id === airline)!

  function swapAirports() {
    setOrigin(destination)
    setDestination(origin)
  }

  async function handleSearch() {
    if (!origin || !destination || !departureDate) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        airline,
        origin: origin.iata_code,
        destination: destination.iata_code,
        date: departureDate,
        cabin,
        adults: String(adults),
        ...(airline === 'azul' && isDiamond ? { diamond: '1' } : {}),
      })
      window.location.href = `/resultados?${params}`
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Para onde você quer ir?</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Pesquise passagens em milhas nas principais companhias aéreas</p>
      </div>

      {/* Airline selector */}
      <div className="flex gap-2 flex-wrap">
        {AIRLINES.map((a) => (
          <button
            key={a.id}
            onClick={() => setAirline(a.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all',
              airline === a.id
                ? `${a.bg} ${a.color} bg-white dark:bg-slate-800 shadow-sm`
                : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600',
            )}
          >
            <PlaneTakeoff size={14} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Main search card */}
      <div className={cn('bg-[var(--card-bg)] rounded-2xl shadow-sm border-2 overflow-visible', selected.bg)}>
        {/* Header bar */}
        <div className={cn('flex items-center justify-between px-6 py-3 rounded-t-xl', selected.badgeBg)}>
          <span className="text-white font-semibold text-sm">{selected.label}</span>
          {/* Trip type toggle */}
          <div className="flex gap-1">
            {(['oneway', 'roundtrip'] as TripType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  tripType === t
                    ? 'bg-white text-gray-900'
                    : 'text-white/80 hover:text-white hover:bg-white/20',
                )}
              >
                {t === 'oneway' ? 'Somente ida' : 'Ida e volta'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Origin / Destination row */}
          <div className="flex items-stretch gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <AirportSearch
                label="Partindo de"
                placeholder="Cidade ou aeroporto de origem"
                value={origin}
                onChange={setOrigin}
                icon="plane"
              />
            </div>

            <button
              onClick={swapAirports}
              className={cn(
                'shrink-0 w-10 h-10 self-center rounded-full border-2 flex items-center justify-center transition-colors bg-white dark:bg-slate-800',
                selected.bg,
                selected.color,
              )}
              aria-label="Inverter origem e destino"
            >
              <ArrowLeftRight size={16} />
            </button>

            <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <AirportSearch
                label="Destino"
                placeholder="Cidade ou aeroporto de destino"
                value={destination}
                onChange={setDestination}
                icon="pin"
              />
            </div>
          </div>

          {/* Date + Cabin row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-gray-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Ida</span>
              </div>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>

            <div className={cn('bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3', tripType === 'oneway' && 'opacity-40 pointer-events-none')}>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-gray-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Volta</span>
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={13} className="text-gray-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Adultos</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setAdults((n) => Math.max(1, n - 1))} className="w-6 h-6 rounded-full border border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-bold text-sm leading-none">−</button>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100 w-4 text-center">{adults.toString().padStart(2, '0')}</span>
                <button onClick={() => setAdults((n) => Math.min(9, n + 1))} className="w-6 h-6 rounded-full border border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-bold text-sm leading-none">+</button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Cabine</span>
              </div>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value as CabinClass)}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                {CABINS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Azul Diamond toggle */}
          {airline === 'azul' && (
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-200 dark:border-blue-800">
              <Star size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Você é cliente Diamante Azul?</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Clientes Diamante têm 10% de desconto nas milhas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isDiamond} onChange={(e) => setIsDiamond(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!origin || !destination || !departureDate || loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
              selected.buttonBg,
            )}
          >
            <Search size={18} />
            {loading ? 'Buscando...' : 'Buscar passagens em milhas'}
          </button>
        </div>
      </div>

      {/* Recent searches */}
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mb-2">Últimas buscas</p>
        <div className="flex gap-2 flex-wrap">
          {RECENT_SEARCHES.map((s) => (
            <button
              key={s.label}
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
