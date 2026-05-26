import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMiles(miles: number | null): string {
  if (miles === null) return '—'
  return miles.toLocaleString('pt-BR') + ' milhas'
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatMilesPerBrl(value: number | null): string {
  if (value === null) return '—'
  return `R$ ${value.toFixed(4)}/milha`
}

export function airlineName(airline: string): string {
  const names: Record<string, string> = {
    smiles: 'GOL Smiles',
    latam: 'LATAM Pass',
    azul: 'Azul Infinito',
  }
  return names[airline] ?? airline
}

export function cabinName(cabin: string): string {
  const names: Record<string, string> = {
    economy: 'Econômica',
    business: 'Executiva',
    first: 'Primeira Classe',
  }
  return names[cabin] ?? cabin
}

export function priceChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
