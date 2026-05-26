/**
 * Seed de aeroportos: combina OpenFlights (global) + aeroportos-br (Brasil)
 * Uso: node scripts/seed-airports.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function parseCSVLine(line) {
  const fields = []
  let field = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuote = false
      else field += c
    } else if (c === '"') {
      inQuote = true
    } else if (c === ',') {
      fields.push(field); field = ''
    } else {
      field += c
    }
  }
  fields.push(field)
  return fields
}

// OpenFlights: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
// Colunas: id, name, city, country, iata, icao, lat, lon, alt, tz, dst, tz_db, type, source
async function fetchOpenFlights() {
  console.log('📥 Baixando dados do OpenFlights (~7500 aeroportos)...')
  const res = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat')
  const text = await res.text()
  const airports = []

  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const fields = parseCSVLine(line.trim())
    if (fields.length < 8) continue

    const iata = fields[4]?.trim()
    const icao = fields[5]?.trim()
    const name = fields[1]?.trim()
    const city = fields[2]?.trim()
    const country = fields[3]?.trim()
    const lat = parseFloat(fields[6])
    const lon = parseFloat(fields[7])

    if (!iata || iata === '\\N' || iata.length !== 3) continue
    if (!name) continue

    airports.push({
      iata_code: iata,
      icao_code: (!icao || icao === '\\N') ? null : icao,
      name,
      city: city || null,
      country: country || null,
      latitude: isNaN(lat) ? null : lat,
      longitude: isNaN(lon) ? null : lon,
      is_brazil: country === 'Brazil',
    })
  }

  console.log(`✅ OpenFlights: ${airports.length} aeroportos com IATA`)
  return airports
}

// aeroportos-br: JSON com aeroportos brasileiros mais detalhados
async function fetchBrazilAirports() {
  console.log('📥 Buscando aeroportos brasileiros extras...')
  const URLS = [
    'https://raw.githubusercontent.com/ArthurPavezzi-zz/aeroportos-br/main/aeroportos.json',
    'https://raw.githubusercontent.com/ArthurPavezzi-zz/aeroportos-br/master/aeroportos.json',
  ]

  for (const url of URLS) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      const airports = []
      for (const apt of data) {
        const iata = apt.iata?.trim()
        if (!iata || iata.length !== 3) continue
        airports.push({
          iata_code: iata,
          icao_code: apt.icao?.trim() || null,
          name: apt.nome || apt.name || iata,
          city: apt.cidade || apt.city || null,
          country: 'Brazil',
          latitude: apt.latitude ? parseFloat(apt.latitude) : null,
          longitude: apt.longitude ? parseFloat(apt.longitude) : null,
          is_brazil: true,
        })
      }
      console.log(`✅ aeroportos-br: ${airports.length} aeroportos brasileiros`)
      return airports
    } catch {
      continue
    }
  }

  console.warn('⚠️  aeroportos-br indisponível — usando apenas OpenFlights para o Brasil')
  return []
}

async function main() {
  const [openFlights, brazilExtra] = await Promise.all([fetchOpenFlights(), fetchBrazilAirports()])

  // Mescla: aeroportos-br tem precedência para registros brasileiros
  const byIata = new Map()
  for (const apt of openFlights) byIata.set(apt.iata_code, apt)
  for (const apt of brazilExtra) byIata.set(apt.iata_code, apt)

  const all = [...byIata.values()]
  const brazilCount = all.filter((a) => a.is_brazil).length
  console.log(`\n📊 Total de aeroportos únicos: ${all.length}`)
  console.log(`🇧🇷 Aeroportos brasileiros: ${brazilCount}`)

  // Insere em lotes de 500
  const BATCH = 500
  let inserted = 0
  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH)
    const { error } = await supabase
      .from('airports')
      .upsert(batch, { onConflict: 'iata_code' })

    if (error) {
      console.error(`\n❌ Erro no lote ${Math.floor(i / BATCH) + 1}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r📤 Inseridos: ${inserted}/${all.length}`)
    }
  }

  console.log(`\n\n✅ Seed concluído! ${inserted} aeroportos no banco.`)
  console.log(`\nVerifique no Studio: http://127.0.0.1:54323`)
}

main().catch((err) => {
  console.error('❌ Falha no seed:', err)
  process.exit(1)
})
