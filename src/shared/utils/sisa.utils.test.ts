import { describe, it, expect } from 'vitest'
import { calcSisa } from './sisa.utils'

describe('calcSisa', () => {
  it('happy — subtracts tagihan and nabung from saldo', () => {
    expect(calcSisa(5_000_000, 1_000_000, 500_000)).toBe(3_500_000)
  })

  it('empty — no tagihan/nabung → sisa equals saldo total', () => {
    expect(calcSisa(2_000_000, 0, 0)).toBe(2_000_000)
  })

  it('boundary — sisa goes negative when obligations exceed saldo', () => {
    expect(calcSisa(1_000_000, 800_000, 400_000)).toBe(-200_000)
  })
})
