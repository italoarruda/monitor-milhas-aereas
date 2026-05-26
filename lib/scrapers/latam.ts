import type { ScraperResult } from '@/lib/types'

export async function scrapeLatam(
  origin: string,
  destination: string,
  date: string,
  cabin: 'economy' | 'business' | 'first' = 'economy'
): Promise<ScraperResult> {
  const cabinMap = { economy: 'Y', business: 'C', first: 'F' }

  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    })

    const url = `https://www.latamairlines.com/br/pt/oferta-voos?origin=${origin}&inbound=null&outbound=${date}&destination=${destination}&adt=1&chd=0&inf=0&trip=OW&cabin=${cabinMap[cabin]}&redemption=true&sort=RECOMMENDED`

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const milesText = await page
      .locator('[data-testid="price-points"], .sc-fzoLsD, [class*="miles"], [class*="points"]')
      .first()
      .textContent({ timeout: 10000 })
      .catch(() => null)

    const taxText = await page
      .locator('[data-testid="price-taxes"], [class*="tax"], [class*="fee"]')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null)

    await browser.close()

    if (!milesText) {
      return { miles_price: null, cash_fee: null, available: false }
    }

    const miles = parseInt(milesText.replace(/\D/g, ''), 10)
    const fee = taxText ? parseFloat(taxText.replace(/[^\d,]/g, '').replace(',', '.')) : null

    if (isNaN(miles)) {
      return { miles_price: null, cash_fee: null, available: false }
    }

    return { miles_price: miles, cash_fee: fee, available: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return { miles_price: null, cash_fee: null, available: false, error: message }
  }
}
