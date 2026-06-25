import { describe, it, expect } from 'vitest'
import { calcAndai } from './andai.utils'
import type { AndaiBaseline, AndaiItem } from './andai.utils'

// Self-consistent baseline:
//   sisaPeriode=4jt, dailyBudget=4jt/20=200rb
const BASELINE: AndaiBaseline = {
  sisaPeriode: 4_000_000,
  dailyBudget: 200_000,
  daysUntilPayday: 20,
  uangMengendap: 500_000,
}

function item(kind: AndaiItem['kind'], amount: number, desc = ''): AndaiItem {
  return { id: String(Math.random()), kind, desc, amount }
}

describe('calcAndai — empty stack', () => {
  it('daily after equals daily before', () => {
    const r = calcAndai([], BASELINE)
    expect(r.dailyAfter).toBe(r.dailyBefore)
  })

  it('sisa after equals sisa before', () => {
    const r = calcAndai([], BASELINE)
    expect(r.sisaAfter).toBe(r.sisaBefore)
  })
})

describe('calcAndai — beli', () => {
  it('reduces daily budget', () => {
    const r = calcAndai([item('beli', 1_000_000)], BASELINE)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('reduces sisa', () => {
    const r = calcAndai([item('beli', 1_000_000)], BASELINE)
    expect(r.sisaAfter).toBeLessThan(r.sisaBefore)
  })

  it('large beli clamps daily to 0', () => {
    const r = calcAndai([item('beli', 20_000_000)], BASELINE)
    expect(r.dailyAfter).toBe(0)
  })
})

describe('calcAndai — income', () => {
  it('increases daily budget', () => {
    const r = calcAndai([item('income', 3_000_000)], BASELINE)
    expect(r.dailyAfter).toBeGreaterThan(r.dailyBefore)
  })

  it('improves sisa', () => {
    const r = calcAndai([item('income', 3_000_000)], BASELINE)
    expect(r.sisaAfter).toBeGreaterThan(r.sisaBefore)
  })
})

describe('calcAndai — tagihan (new commitment)', () => {
  it('reduces daily budget', () => {
    const r = calcAndai([item('tagihan', 500_000)], BASELINE)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('reduces sisa', () => {
    const r = calcAndai([item('tagihan', 500_000)], BASELINE)
    expect(r.sisaAfter).toBeLessThan(r.sisaBefore)
  })
})

describe('calcAndai — combined variables', () => {
  it('beli + income of equal amounts: daily returns to baseline', () => {
    const r = calcAndai([item('beli', 2_000_000), item('income', 2_000_000)], BASELINE)
    expect(r.dailyAfter).toBeCloseTo(r.dailyBefore, 0)
  })

  it('two beli sum correctly', () => {
    const r1 = calcAndai([item('beli', 3_000_000)], BASELINE)
    const r2 = calcAndai([item('beli', 1_500_000), item('beli', 1_500_000)], BASELINE)
    expect(r1.dailyAfter).toBeCloseTo(r2.dailyAfter, 0)
  })

  it('tagihan + income of equal amounts: daily returns to baseline', () => {
    const r = calcAndai([item('tagihan', 1_000_000), item('income', 1_000_000)], BASELINE)
    expect(r.dailyAfter).toBeCloseTo(r.dailyBefore, 0)
    expect(r.sisaAfter).toBeCloseTo(r.sisaBefore, 0)
  })
})

describe('calcAndai — daily never negative', () => {
  it('daily after is clamped at 0', () => {
    const r = calcAndai([item('beli', 50_000_000)], BASELINE)
    expect(r.dailyAfter).toBe(0)
    expect(r.dailyAfter).toBeGreaterThanOrEqual(0)
  })
})

describe('calcAndai — sisa correctness (repro: saldo 8jt, purchases 5jt → sisa 3jt not -5jt)', () => {
  const BIG: AndaiBaseline = {
    sisaPeriode: 8_000_000,
    dailyBudget: 400_000, // 8jt / 20
    daysUntilPayday: 20,
    uangMengendap: 0,
  }

  it('no items: sisa before equals sisaPeriode when no tagihan', () => {
    const r = calcAndai([], BIG)
    expect(r.sisaBefore).toBe(8_000_000)
    expect(r.sisaAfter).toBe(r.sisaBefore)
  })

  it('single beli: sisaAfter = sisaBefore − purchaseAmount', () => {
    const r = calcAndai([item('beli', 3_000_000)], BIG)
    expect(r.sisaAfter).toBe(r.sisaBefore - 3_000_000)
    expect(r.sisaAfter).toBe(5_000_000)
  })

  it('multiple beli summing to 5jt: sisaAfter = 3jt', () => {
    const r = calcAndai(
      [item('beli', 2_000_000), item('beli', 2_000_000), item('beli', 1_000_000)],
      BIG,
    )
    expect(r.sisaAfter).toBe(3_000_000)
  })

  it('beli exceeding saldo: sisa goes negative, daily clamps to 0', () => {
    const r = calcAndai([item('beli', 10_000_000)], BIG)
    expect(r.sisaAfter).toBe(-2_000_000)
    expect(r.dailyAfter).toBe(0)
  })
})
