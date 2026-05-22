import { describe, it, expect } from 'vitest'
import { calcAndai } from './andai.utils'
import type { AndaiBaseline, AndaiItem } from './andai.utils'

// Self-consistent baseline:
//   totalSaldo=5jt, unpaidTagihan=1jt → availableOp=4jt
//   dailyBudget = 4jt / 20 = 200rb
//   sisaPasGajian = 4jt - 200rb×20 = 0 (with reservedSavings=0)
const BASELINE: AndaiBaseline = {
  totalSaldo: 5_000_000,
  unpaidTagihanTotal: 1_000_000,
  dailyBudget: 200_000,
  daysUntilPayday: 20,
  totalNabung: 3_000_000,
  sisaPasGajian: 0,
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

  it('nabung unchanged', () => {
    const r = calcAndai([], BASELINE)
    expect(r.nabungAfter).toBe(r.nabungBefore)
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

  it('does not affect tabungan', () => {
    const r = calcAndai([item('beli', 1_000_000)], BASELINE)
    expect(r.nabungAfter).toBe(r.nabungBefore)
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

  it('does not affect tabungan', () => {
    const r = calcAndai([item('income', 3_000_000)], BASELINE)
    expect(r.nabungAfter).toBe(r.nabungBefore)
  })
})

describe('calcAndai — tagihan (new commitment)', () => {
  it('reduces daily budget', () => {
    const r = calcAndai([item('tagihan', 500_000)], BASELINE)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('does not affect tabungan', () => {
    const r = calcAndai([item('tagihan', 500_000)], BASELINE)
    expect(r.nabungAfter).toBe(r.nabungBefore)
  })

  it('reduces sisa', () => {
    const r = calcAndai([item('tagihan', 500_000)], BASELINE)
    expect(r.sisaAfter).toBeLessThan(r.sisaBefore)
  })
})

describe('calcAndai — target nabung', () => {
  it('increases tabungan', () => {
    const r = calcAndai([item('target-nabung', 1_000_000)], BASELINE)
    expect(r.nabungAfter).toBe(BASELINE.totalNabung + 1_000_000)
  })

  it('reduces daily budget (earmark reduces operational budget)', () => {
    const r = calcAndai([item('target-nabung', 1_000_000)], BASELINE)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('reduces sisa', () => {
    const r = calcAndai([item('target-nabung', 1_000_000)], BASELINE)
    expect(r.sisaAfter).toBeLessThan(r.sisaBefore)
  })
})

describe('calcAndai — combined variables', () => {
  it('beli + income of equal amounts: daily returns to baseline', () => {
    const r = calcAndai([item('beli', 2_000_000), item('income', 2_000_000)], BASELINE)
    expect(r.dailyAfter).toBeCloseTo(r.dailyBefore, 0)
    expect(r.nabungAfter).toBe(r.nabungBefore)
  })

  it('beli + target-nabung: daily drops, nabung rises', () => {
    const r = calcAndai([item('beli', 1_000_000), item('target-nabung', 500_000)], BASELINE)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
    expect(r.nabungAfter).toBe(BASELINE.totalNabung + 500_000)
  })

  it('two beli sum correctly', () => {
    const r1 = calcAndai([item('beli', 3_000_000)], BASELINE)
    const r2 = calcAndai([item('beli', 1_500_000), item('beli', 1_500_000)], BASELINE)
    expect(r1.dailyAfter).toBeCloseTo(r2.dailyAfter, 0)
  })

  it('tagihan + income: can offset each other on daily budget', () => {
    const r = calcAndai([item('tagihan', 1_000_000), item('income', 2_000_000)], BASELINE)
    // income 2jt, tagihan reduces ops by 1jt (saldo -1jt, tagihan +1jt)
    // net saldo delta = +2jt - 1jt = +1jt; afterSaldo=6jt, afterTagihan=2jt, afterAvailable=4jt
    // afterDailyBudget = 4jt / 20 = 200rb = baseline (neutral)
    expect(r.dailyAfter).toBeCloseTo(r.dailyBefore, 0)
  })
})

describe('calcAndai — daily never negative', () => {
  it('daily after is clamped at 0', () => {
    const r = calcAndai([item('beli', 50_000_000)], BASELINE)
    expect(r.dailyAfter).toBe(0)
    expect(r.dailyAfter).toBeGreaterThanOrEqual(0)
  })
})
