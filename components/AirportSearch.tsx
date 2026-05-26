'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Airport } from '@/lib/types'

interface Props {
  label: string
  placeholder: string
  value: Airport | null
  onChange: (airport: Airport | null) => void
  icon?: 'plane' | 'pin'
  className?: string
}

export function AirportSearch({ label, placeholder, value, onChange, icon = 'plane', className }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.airports ?? [])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  function select(airport: Airport) {
    onChange(airport)
    setQuery('')
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
  }

  const Icon = icon === 'pin' ? MapPin : Plane

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-1">{label}</span>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-400 shrink-0" />
          {value ? (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                  {value.iata_code} {value.city ?? value.name}
                </span>
                <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight">{value.name}</p>
              </div>
              <button onClick={clear} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 ml-2 text-lg leading-none">×</button>
            </div>
          ) : (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setOpen(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400"
            />
          )}
        </div>
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {loading && <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>}
          {results.map((airport) => (
            <button
              key={airport.id}
              onClick={() => select(airport)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <span className="mt-0.5 shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded px-1.5 py-0.5">
                {airport.iata_code}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{airport.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{airport.city} · {airport.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
