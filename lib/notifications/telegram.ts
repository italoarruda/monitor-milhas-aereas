import type { MonitoredRoute } from '@/lib/types'
import { airlineName, formatMiles } from '@/lib/utils'

interface AlertTelegramPayload {
  chatId: string
  route: MonitoredRoute
  previousMiles: number
  currentMiles: number
  changePercent: number
  appUrl: string
}

export async function sendTelegramAlert(payload: AlertTelegramPayload): Promise<void> {
  const { chatId, route, previousMiles, currentMiles, changePercent, appUrl } = payload
  const token = process.env.TELEGRAM_BOT_TOKEN!

  const isDropping = changePercent < 0
  const emoji = isDropping ? '📉' : '📈'
  const origin = route.origin_airport?.city ?? route.origin_iata
  const destination = route.destination_airport?.city ?? route.destination_iata

  const text = [
    `${emoji} *${isDropping ? 'Queda' : 'Alta'} de ${Math.abs(changePercent).toFixed(1)}%* nas milhas!`,
    '',
    `✈️ *${origin} → ${destination}*`,
    `🏢 ${airlineName(route.airline)}`,
    '',
    `Antes: ~${formatMiles(previousMiles)}~`,
    `Agora: *${formatMiles(currentMiles)}*`,
    '',
    `[Ver detalhes da rota](${appUrl}/monitoramentos/${route.id})`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
  })
}
