import type { ScraperResult } from '@/lib/types'

const SMILES_API = 'https://api.smiles.com.br/v1/airlines/search'

interface SmilesSegment {
  fareList?: Array<{
    type: string
    miles: number
    money: number
  }>
}

interface SmilesResponse {
  requestedFlightSegmentList?: SmilesSegment[]
}

export async function scrapeSmiles(
  origin: string,
  destination: string,
  date: string,
  cabin: 'economy' | 'business' | 'first' = 'economy'
): Promise<ScraperResult> {
  const cabinMap = { economy: 'Y', business: 'C', first: 'F' }

  const params = new URLSearchParams({
    adults: '1',
    children: '0',
    infants: '0',
    tripType: '2',
    cabinType: cabinMap[cabin],
    originAirportCode: origin,
    destinationAirportCode: destination,
    departureDate: date,
    forceCongener: 'false',
    r: 'ar',
  })

  try {
    const res = await fetch(`${SMILES_API}?${params}`, {
      headers: {
        'x-api-key': 'aJqPU7xNHl9qN3NVZnPaJ208OfR8usFH',
        'region': 'br',
        'channel': 'Web',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return { miles_price: null, cash_fee: null, available: false, error: `HTTP ${res.status}` }
    }

    const json: SmilesResponse = await res.json()
    const segment = json.requestedFlightSegmentList?.[0]
    const econFare = segment?.fareList?.find((f) => f.type === 'SMILES_FARE')

    if (!econFare) {
      return { miles_price: null, cash_fee: null, available: false }
    }

    return {
      miles_price: econFare.miles,
      cash_fee: econFare.money,
      available: true,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return { miles_price: null, cash_fee: null, available: false, error: message }
  }
}
