import { describe, it, expect } from 'vitest'
import { calcBudgetPeriode } from './budget.utils'
import type { BudgetPeriodeInput } from './budget.utils'

function makeInput(overrides: Partial<BudgetPeriodeInput> = {}): BudgetPeriodeInput {
  return {
    pemasukanPeriode: 5_000_000,
    unpaidTagihanTotal: 1_000_000,
    targetTabungan: 500_000,
    hariPeriode: 30,
    spentThisPeriode: 1_000_000,
    spentToday: 100_000,
    totalSaldo: 8_000_000,
    useSaldoFloor: false,
    ...overrides,
  }
}

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('calcBudgetPeriode — normal mode', () => {
  it('computes all fields correctly', () => {
    // anggaranRaw = 5_000_000 − 1_000_000 − 500_000 = 3_500_000
    // anggaranOp  = 3_500_000
    // jatahHarian = 3_500_000 / 30 ≈ 116_666.67
    // sisaPeriode = 3_500_000 − 1_000_000 = 2_500_000
    // sisaHariIni = 116_666.67 − 100_000 ≈ 16_666.67
    const r = calcBudgetPeriode(makeInput())
    expect(r.mode).toBe('normal')
    expect(r.anggaranRaw).toBe(3_500_000)
    expect(r.anggaranOperasional).toBe(3_500_000)
    expect(r.jatahHarian).toBeCloseTo(116_666.67, 0)
    expect(r.sisaPeriode).toBe(2_500_000)
    expect(r.sisaHariIni).toBeCloseTo(16_666.67, 0)
    expect(r.shortfall).toBe(0)
  })

  it('uangMengendap = totalSaldo − pemasukanPeriode − unpaidTagihanTotal', () => {
    // 8_000_000 − 5_000_000 − 1_000_000 = 2_000_000
    const r = calcBudgetPeriode(makeInput())
    expect(r.uangMengendap).toBe(2_000_000)
  })
})

// ─── mode: hari-gajian ────────────────────────────────────────────────────────

describe('calcBudgetPeriode — hari-gajian mode', () => {
  it('hariPeriode=0 → mode hari-gajian, jatahHarian=null', () => {
    const r = calcBudgetPeriode(makeInput({ hariPeriode: 0 }))
    expect(r.mode).toBe('hari-gajian')
    expect(r.jatahHarian).toBeNull()
    expect(r.sisaHariIni).toBe(0) // null guard
  })
})

// ─── mode: bertahan ───────────────────────────────────────────────────────────

describe('calcBudgetPeriode — bertahan mode', () => {
  it('pemasukanPeriode=0 → anggaranRaw negative → bertahan', () => {
    const r = calcBudgetPeriode(
      makeInput({
        pemasukanPeriode: 0,
        unpaidTagihanTotal: 1_000_000,
        targetTabungan: 0,
        spentThisPeriode: 0,
      }),
    )
    expect(r.mode).toBe('bertahan')
    expect(r.jatahHarian).toBe(0)
    expect(r.anggaranOperasional).toBe(0)
    expect(r.shortfall).toBe(1_000_000)
    expect(r.sisaPeriode).toBe(0) // anggaranOp(0) − spent(0)
  })

  it('boundary: anggaranRaw exactly 0 → bertahan (not normal)', () => {
    // pemasukanPeriode = unpaid + target → anggaranRaw = 0
    const r = calcBudgetPeriode(
      makeInput({
        pemasukanPeriode: 1_500_000,
        unpaidTagihanTotal: 1_000_000,
        targetTabungan: 500_000,
      }),
    )
    expect(r.mode).toBe('bertahan')
    expect(r.shortfall).toBe(0) // exactly 0, no shortfall magnitude
    expect(r.jatahHarian).toBe(0)
  })
})

// ─── mode: hari-terakhir ──────────────────────────────────────────────────────

describe('calcBudgetPeriode — hari-terakhir mode', () => {
  it('hariPeriode=1 → mode hari-terakhir, jatahHarian=anggaranOp', () => {
    const r = calcBudgetPeriode(makeInput({ hariPeriode: 1 }))
    expect(r.mode).toBe('hari-terakhir')
    expect(r.jatahHarian).toBe(r.anggaranOperasional)
  })
})

// ─── guard precedence ─────────────────────────────────────────────────────────

describe('calcBudgetPeriode — guard precedence', () => {
  it('hariPeriode=0 beats bertahan: even if anggaranRaw<=0, mode is hari-gajian', () => {
    const r = calcBudgetPeriode(
      makeInput({ hariPeriode: 0, pemasukanPeriode: 0, unpaidTagihanTotal: 500_000 }),
    )
    expect(r.mode).toBe('hari-gajian')
  })
})

// ─── anti double-count ────────────────────────────────────────────────────────

describe('calcBudgetPeriode — anti double-count', () => {
  it('higher unpaid deducts from anggaranOperasional, not from sisaPeriode directly', () => {
    // pemasukanPeriode=5jt, unpaid=2jt, targetTabungan=500rb → anggaranRaw=2_500_000
    // sisaPeriode = 2_500_000 − spentThisPeriode(500rb) = 2_000_000
    const r = calcBudgetPeriode(
      makeInput({ unpaidTagihanTotal: 2_000_000, spentThisPeriode: 500_000 }),
    )
    expect(r.anggaranOperasional).toBe(2_500_000)
    expect(r.sisaPeriode).toBe(2_000_000)
  })

  it('sisaPeriode can go negative when overspent', () => {
    const r = calcBudgetPeriode(makeInput({ spentThisPeriode: 4_000_000 }))
    expect(r.sisaPeriode).toBe(r.anggaranOperasional - 4_000_000)
    expect(r.sisaPeriode).toBeLessThan(0)
  })
})

// ─── freelance saldo floor ────────────────────────────────────────────────────

describe('calcBudgetPeriode — freelance useSaldoFloor', () => {
  it('caps jatahHarian at totalSaldo / hariPeriode when saldo is lower', () => {
    // anggaranOp / hari = 3_500_000 / 30 ≈ 116_666
    // totalSaldo / hari = 2_000_000 / 30 ≈ 66_666 → floor applies
    const r = calcBudgetPeriode(makeInput({ useSaldoFloor: true, totalSaldo: 2_000_000 }))
    expect(r.jatahHarian).toBeCloseTo(2_000_000 / 30, 0)
  })

  it('no floor when saldo exceeds anggaran/hari', () => {
    // totalSaldo / hari = 8_000_000 / 30 > anggaran/hari → no cap
    const noFloor = calcBudgetPeriode(makeInput({ useSaldoFloor: false }))
    const withFloor = calcBudgetPeriode(makeInput({ useSaldoFloor: true }))
    expect(withFloor.jatahHarian).toBeCloseTo(noFloor.jatahHarian as number, 0)
  })
})
