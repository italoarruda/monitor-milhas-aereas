export type Airline = 'smiles' | 'latam' | 'azul'
export type CabinClass = 'economy' | 'business' | 'first'

export interface Airport {
  id: string
  iata_code: string
  icao_code: string | null
  name: string
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  is_brazil: boolean
}

export interface MonitoredRoute {
  id: string
  user_id: string
  origin_iata: string
  destination_iata: string
  airline: Airline
  cabin_class: CabinClass
  is_azul_diamond: boolean
  active: boolean
  created_at: string
  origin_airport?: Airport
  destination_airport?: Airport
  latest_price?: PriceHistory | null
}

export interface PriceHistory {
  id: string
  route_id: string
  miles_price: number | null
  cash_fee: number | null
  miles_per_brl: number | null
  available: boolean | null
  checked_at: string
}

export interface AlertConfig {
  id: string
  user_id: string
  route_id: string
  threshold_percent: number
  notify_email: boolean
  notify_telegram: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  telegram_chat_id: string | null
  is_azul_diamond: boolean
  updated_at: string
}

export interface ScraperResult {
  miles_price: number | null
  cash_fee: number | null
  available: boolean
  error?: string
}
