import type { ScraperResult } from '@/lib/types'

export async function scrapeAzul(
  origin: string,
  destination: string,
  date: string,
  isDiamond = false
): Promise<ScraperResult> {
  const DIAMOND_DISCOUNT = 0.10

  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    })

    const url = `https://www.voeazul.com.br/br/pt/home/selecao-de-voos?origem=${origin}&destino=${destination}&dataIda=${date}&adultos=1&criancas=0&bebes=0&tipoBusca=SO&cabine=E&isRewards=true`

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const milesText = await page
      .locator('[class*="miles"], [class*="pontos"], [class*="rewards"], .miles-value')
      .first()
      .textContent({ timeout: 10000 })
      .catch(() => null)

    const taxText = await page
      .locator('[class*="tax"], [class*="taxa"], .tax-value')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null)

    await browser.close()

    if (!milesText) {
      return { miles_price: null, cash_fee: null, available: false }
    }

    let miles = parseInt(milesText.replace(/\D/g, ''), 10)
    const fee = taxText ? parseFloat(taxText.replace(/[^\d,]/g, '').replace(',', '.')) : null

    if (isNaN(miles)) {
      return { miles_price: null, cash_fee: null, available: false }
    }

    if (isDiamond) {
      miles = Math.round(miles * (1 - DIAMOND_DISCOUNT))
    }

    return { miles_price: miles, cash_fee: fee, available: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return { miles_price: null, cash_fee: null, available: false, error: message }
  }
}
