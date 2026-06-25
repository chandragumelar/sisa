import { describe, it, expect } from 'vitest'
import { calcSisa } from './sisa.utils'

describe('calcSisa', () => {
  it('happy — subtracts tagihan from saldo', () => {
    expect(calcSisa(5_000_000, 1_000_000)).toBe(4_000_000)
  })

  it('empty — no tagihan → sisa equals saldo total', () => {
    expect(calcSisa(2_000_000, 0)).toBe(2_000_000)
  })

  it('boundary — sisa goes negative when tagihan exceeds saldo', () => {
    expect(calcSisa(1_000_000, 1_500_000)).toBe(-500_000)
  })
})
