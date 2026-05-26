import type { MonitoredRoute } from '@/lib/types'
import { airlineName, formatMiles, formatCurrency } from '@/lib/utils'

interface AlertEmailPayload {
  to: string
  route: MonitoredRoute
  previousMiles: number
  currentMiles: number
  changePercent: number
  appUrl: string
}

export async function sendAlertEmail(payload: AlertEmailPayload): Promise<void> {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { to, route, previousMiles, currentMiles, changePercent, appUrl } = payload
  const isDropping = changePercent < 0
  const direction = isDropping ? '⬇️ Queda' : '⬆️ Alta'
  const directionColor = isDropping ? '#16a34a' : '#dc2626'
  const origin = route.origin_airport?.city ?? route.origin_iata
  const destination = route.destination_airport?.city ?? route.destination_iata
  const subject = `${direction} de ${Math.abs(changePercent).toFixed(1)}% — ${origin} → ${destination} (${airlineName(route.airline)})`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #1e3a5f; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">Monitor Milhas Aéreas</h1>
      <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Alerta de variação de preço</p>
    </div>
    <div style="padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">${isDropping ? '📉' : '📈'}</span>
        <h2 style="color: ${directionColor}; margin: 8px 0 4px; font-size: 24px;">${direction} de ${Math.abs(changePercent).toFixed(1)}%</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">${airlineName(route.airline)}</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; font-weight: 600; color: #1f2937; font-size: 16px;">
          ${origin} (${route.origin_iata}) → ${destination} (${route.destination_iata})
        </p>
        <div style="display: flex; justify-content: space-between; gap: 16px;">
          <div style="flex: 1; text-align: center; padding: 12px; background: #fee2e2; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px; color: #ef4444; font-weight: 500;">Antes</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #991b1b;">${formatMiles(previousMiles)}</p>
          </div>
          <div style="flex: 1; text-align: center; padding: 12px; background: #dcfce7; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px; color: #16a34a; font-weight: 500;">Agora</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #166534;">${formatMiles(currentMiles)}</p>
          </div>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}/monitoramentos/${route.id}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Ver detalhes da rota</a>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Para parar de receber alertas, <a href="${appUrl}/monitoramentos/${route.id}" style="color: #6b7280;">ajuste as configurações da rota</a>.</p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({ from: 'Monitor Milhas <alertas@monitor-milhas-aereas.app>', to, subject, html })
}
