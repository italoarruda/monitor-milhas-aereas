import { describe, it, expect } from 'vitest'
import { formatMiles, formatCurrency, priceChangePercent, airlineName, cabinName } from '../../lib/utils'

describe('formatMiles', () => {
  it('formata milhas com locale pt-BR', () => {
    expect(formatMiles(50000)).toBe('50.000 milhas')
  })

  it('retorna traço para null', () => {
    expect(formatMiles(null)).toBe('—')
  })
})

describe('formatCurrency', () => {
  it('formata valor em BRL', () => {
    expect(formatCurrency(100)).toContain('R$')
    expect(formatCurrency(100)).toContain('100')
  })

  it('retorna traço para null', () => {
    expect(formatCurrency(null)).toBe('—')
  })
})

describe('priceChangePercent', () => {
  it('calcula queda de 10%', () => {
    expect(priceChangePercent(9000, 10000)).toBeCloseTo(-10, 1)
  })

  it('calcula alta de 20%', () => {
    expect(priceChangePercent(12000, 10000)).toBeCloseTo(20, 1)
  })

  it('retorna 0 para divisão por zero', () => {
    expect(priceChangePercent(1000, 0)).toBe(0)
  })
})

describe('airlineName', () => {
  it('retorna nome completo das companhias', () => {
    expect(airlineName('smiles')).toBe('GOL Smiles')
    expect(airlineName('latam')).toBe('LATAM Pass')
    expect(airlineName('azul')).toBe('Azul Infinito')
  })

  it('retorna o próprio valor para companhia desconhecida', () => {
    expect(airlineName('other')).toBe('other')
  })
})

describe('cabinName', () => {
  it('retorna nomes em português', () => {
    expect(cabinName('economy')).toBe('Econômica')
    expect(cabinName('business')).toBe('Executiva')
    expect(cabinName('first')).toBe('Primeira Classe')
  })
})
