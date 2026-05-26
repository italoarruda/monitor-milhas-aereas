import { supabase } from './client'
import type { MonitoredRoute, PriceHistory, AlertConfig } from '@/lib/types'

export async function getRoutes(userId: string): Promise<MonitoredRoute[]> {
  const { data, error } = await supabase
    .from('monitored_routes')
    .select(`
      *,
      origin_airport:airports!monitored_routes_origin_iata_fkey(iata_code, name, city, country),
      destination_airport:airports!monitored_routes_destination_iata_fkey(iata_code, name, city, country)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MonitoredRoute[]
}

export async function getRoute(id: string): Promise<MonitoredRoute | null> {
  const { data, error } = await supabase
    .from('monitored_routes')
    .select(`
      *,
      origin_airport:airports!monitored_routes_origin_iata_fkey(iata_code, name, city, country),
      destination_airport:airports!monitored_routes_destination_iata_fkey(iata_code, name, city, country)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as MonitoredRoute
}

export async function createRoute(
  route: Omit<MonitoredRoute, 'id' | 'created_at' | 'origin_airport' | 'destination_airport' | 'latest_price'>
): Promise<MonitoredRoute> {
  const { data, error } = await supabase
    .from('monitored_routes')
    .insert(route)
    .select()
    .single()

  if (error) throw error
  return data as MonitoredRoute
}

export async function updateRoute(
  id: string,
  updates: Partial<Pick<MonitoredRoute, 'active' | 'is_azul_diamond' | 'cabin_class'>>
): Promise<void> {
  const { error } = await supabase
    .from('monitored_routes')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deleteRoute(id: string): Promise<void> {
  const { error } = await supabase
    .from('monitored_routes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getPriceHistory(routeId: string, limit = 30): Promise<PriceHistory[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('route_id', routeId)
    .order('checked_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as PriceHistory[]
}

export async function getAlertConfig(routeId: string): Promise<AlertConfig | null> {
  const { data, error } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('route_id', routeId)
    .single()

  if (error) return null
  return data as AlertConfig
}

export async function upsertAlertConfig(config: Omit<AlertConfig, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('alert_configs')
    .upsert(config, { onConflict: 'route_id' })

  if (error) throw error
}
