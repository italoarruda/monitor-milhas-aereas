import { describe, it, expect } from 'vitest'
import { priceChangePercent } from '../../lib/utils'

function shouldAlert(current: number, previous: number, threshold: number): boolean {
  const change = Math.abs(priceChangePercent(current, previous))
  return change >= threshold
}

describe('Lógica de alertas', () => {
  it('dispara alerta quando queda supera o threshold', () => {
    expect(shouldAlert(9000, 10000, 5)).toBe(true)   // -10%
    expect(shouldAlert(9600, 10000, 5)).toBe(false)  // -4%
  })

  it('dispara alerta quando alta supera o threshold', () => {
    expect(shouldAlert(11000, 10000, 5)).toBe(true)  // +10%
    expect(shouldAlert(10400, 10000, 5)).toBe(false) // +4%
  })

  it('dispara alerta exatamente no threshold', () => {
    expect(shouldAlert(9500, 10000, 5)).toBe(true)   // exatamente -5%
  })

  it('não dispara alerta com preço igual', () => {
    expect(shouldAlert(10000, 10000, 5)).toBe(false)
  })
})
