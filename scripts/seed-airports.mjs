/**
 * Seed de aeroportos: combina OpenFlights (global) + aeroportos-br (Brasil)
 * Uso: node scripts/seed-airports.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// OpenFlights: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
// Colunas: id, name, city, country, iata, icao, lat, lon, alt, tz, dst, tz_db, type, source
async function fetchOpenFlights() {
  console.log('📥 Baixando dados do OpenFlights...')
  const res = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat')
  const text = await res.text()
  const airports = []

  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    // CSV com aspas
    const fields = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map((f) => f.replace(/^"|"$/g, '').replace(/""/g, '"'))
    if (!fields || fields.length < 8) continue

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
      icao_code: icao === '\\N' ? null : icao,
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
  console.log('📥 Baixando aeroportos brasileiros...')
  try {
    const res = await fetch('https://raw.githubusercontent.com/ArthurPavezzi-zz/aeroportos-br/master/aeroportos.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
  } catch (err) {
    console.warn('⚠️  Falha ao carregar aeroportos-br:', err.message)
    return []
  }
}

async function main() {
  const [openFlights, brazilExtra] = await Promise.all([fetchOpenFlights(), fetchBrazilAirports()])

  // Mescla: aeroportos-br tem precedência para registros brasileiros
  const byIata = new Map()
  for (const apt of openFlights) byIata.set(apt.iata_code, apt)
  for (const apt of brazilExtra) byIata.set(apt.iata_code, apt) // sobrescreve BR

  const all = [...byIata.values()]
  console.log(`\n📊 Total de aeroportos únicos: ${all.length}`)
  console.log(`🇧🇷 Aeroportos brasileiros: ${all.filter((a) => a.is_brazil).length}`)

  // Insere em lotes de 500
  const BATCH = 500
  let inserted = 0
  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH)
    const { error } = await supabase
      .from('airports')
      .upsert(batch, { onConflict: 'iata_code' })

    if (error) {
      console.error(`❌ Erro no lote ${i / BATCH + 1}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r📤 Inseridos: ${inserted}/${all.length}`)
    }
  }

  console.log(`\n✅ Seed concluído! ${inserted} aeroportos no banco.`)
}

main().catch((err) => {
  console.error('❌ Falha no seed:', err)
  process.exit(1)
})
