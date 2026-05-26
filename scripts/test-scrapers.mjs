/**
 * Testa scrapers manualmente
 * Uso: node scripts/test-scrapers.mjs --route GRU-CGH --airline smiles
 */
import { parseArgs } from 'util'

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    route: { type: 'string', default: 'GRU-CGH' },
    airline: { type: 'string', default: 'smiles' },
    cabin: { type: 'string', default: 'economy' },
    diamond: { type: 'boolean', default: false },
  },
})

const [origin, destination] = values.route.split('-')
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

console.log(`\n🔍 Testando scraper: ${values.airline.toUpperCase()}`)
console.log(`   Rota: ${origin} → ${destination}`)
console.log(`   Data: ${tomorrow}`)
console.log(`   Cabine: ${values.cabin}`)
if (values.airline === 'azul') console.log(`   Diamante: ${values.diamond}`)
console.log()

try {
  let result
  if (values.airline === 'smiles') {
    const { scrapeSmiles } = await import('../lib/scrapers/smiles.ts')
    result = await scrapeSmiles(origin, destination, tomorrow, values.cabin)
  } else if (values.airline === 'latam') {
    const { scrapeLatam } = await import('../lib/scrapers/latam.ts')
    result = await scrapeLatam(origin, destination, tomorrow, values.cabin)
  } else if (values.airline === 'azul') {
    const { scrapeAzul } = await import('../lib/scrapers/azul.ts')
    result = await scrapeAzul(origin, destination, tomorrow, values.diamond)
  } else {
    console.error('Airline inválida. Use: smiles | latam | azul')
    process.exit(1)
  }

  console.log('Resultado:')
  console.log(`  Disponível: ${result.available}`)
  console.log(`  Milhas:     ${result.miles_price?.toLocaleString('pt-BR') ?? 'N/D'}`)
  console.log(`  Taxas:      R$ ${result.cash_fee?.toFixed(2) ?? 'N/D'}`)
  if (result.error) console.log(`  Erro:       ${result.error}`)
} catch (err) {
  console.error('❌ Erro:', err.message)
}
