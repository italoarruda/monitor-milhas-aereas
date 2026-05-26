import { describe, it, expect } from 'vitest'

const DIAMOND_DISCOUNT = 0.10

function applyDiamondDiscount(miles: number, isDiamond: boolean): number {
  if (!isDiamond) return miles
  return Math.round(miles * (1 - DIAMOND_DISCOUNT))
}

describe('Desconto Diamante Azul', () => {
  it('aplica 10% de desconto para clientes Diamante', () => {
    expect(applyDiamondDiscount(50000, true)).toBe(45000)
    expect(applyDiamondDiscount(10000, true)).toBe(9000)
  })

  it('não aplica desconto para não-Diamante', () => {
    expect(applyDiamondDiscount(50000, false)).toBe(50000)
  })

  it('arredonda o resultado para inteiro', () => {
    const result = applyDiamondDiscount(33333, true)
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBe(30000)
  })
})
