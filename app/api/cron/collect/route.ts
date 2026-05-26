import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { scrapeSmiles } from '@/lib/scrapers/smiles'
import { scrapeLatam } from '@/lib/scrapers/latam'
import { scrapeAzul } from '@/lib/scrapers/azul'
import { sendAlertEmail } from '@/lib/notifications/email'
import { sendTelegramAlert } from '@/lib/notifications/telegram'
import { priceChangePercent } from '@/lib/utils'
import type { MonitoredRoute } from '@/lib/types'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const { data: routes, error } = await supabase
    .from('monitored_routes')
    .select(`
      *,
      origin_airport:airports!monitored_routes_origin_iata_fkey(iata_code, name, city, country),
      destination_airport:airports!monitored_routes_destination_iata_fkey(iata_code, name, city, country)
    `)
    .eq('active', true)

  if (error || !routes) {
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }

  const results: { routeId: string; status: string }[] = []

  for (const route of routes as MonitoredRoute[]) {
    try {
      let scraperResult

      if (route.airline === 'smiles') {
        scraperResult = await scrapeSmiles(route.origin_iata, route.destination_iata, tomorrow, route.cabin_class)
      } else if (route.airline === 'latam') {
        scraperResult = await scrapeLatam(route.origin_iata, route.destination_iata, tomorrow, route.cabin_class)
      } else {
        scraperResult = await scrapeAzul(route.origin_iata, route.destination_iata, tomorrow, route.is_azul_diamond)
      }

      const milesPerBrl =
        scraperResult.miles_price && scraperResult.cash_fee
          ? scraperResult.cash_fee / scraperResult.miles_price
          : null

      const { data: inserted } = await supabase
        .from('price_history')
        .insert({
          route_id: route.id,
          miles_price: scraperResult.miles_price,
          cash_fee: scraperResult.cash_fee,
          miles_per_brl: milesPerBrl,
          available: scraperResult.available,
        })
        .select()
        .single()

      if (inserted && scraperResult.miles_price) {
        const { data: prevHistory } = await supabase
          .from('price_history')
          .select('miles_price')
          .eq('route_id', route.id)
          .order('checked_at', { ascending: false })
          .limit(2)

        const previousPrice = prevHistory?.[1]?.miles_price
        if (previousPrice && previousPrice !== scraperResult.miles_price) {
          const changePercent = priceChangePercent(scraperResult.miles_price, previousPrice)

          const { data: alertConfig } = await supabase
            .from('alert_configs')
            .select(`*, user_profiles(telegram_chat_id)`)
            .eq('route_id', route.id)
            .single()

          if (alertConfig && Math.abs(changePercent) >= alertConfig.threshold_percent) {
            const { data: userAuth } = await supabase.auth.admin.getUserById(route.user_id)
            const userEmail = userAuth?.user?.email
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

            if (alertConfig.notify_email && userEmail) {
              await sendAlertEmail({
                to: userEmail,
                route,
                previousMiles: previousPrice,
                currentMiles: scraperResult.miles_price,
                changePercent,
                appUrl,
              }).catch(() => {})
            }

            const telegramId = alertConfig.user_profiles?.telegram_chat_id
            if (alertConfig.notify_telegram && telegramId) {
              await sendTelegramAlert({
                chatId: telegramId,
                route,
                previousMiles: previousPrice,
                currentMiles: scraperResult.miles_price,
                changePercent,
                appUrl,
              }).catch(() => {})
            }
          }
        }
      }

      results.push({ routeId: route.id, status: scraperResult.error ?? 'ok' })
    } catch (err) {
      results.push({ routeId: route.id, status: `error: ${err instanceof Error ? err.message : 'unknown'}` })
    }
  }

  return NextResponse.json({ collected: results.length, results, date: today })
}
