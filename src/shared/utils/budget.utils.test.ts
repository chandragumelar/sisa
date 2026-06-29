import { describe, it, expect } from 'vitest'
import {
  calcBudgetPeriode,
  recomputeAlokasi,
  computeFromAllocation,
  relock,
  resolveBudgetView,
} from './budget.utils'
import type { BudgetPeriodeInput } from './budget.utils'

function makeInput(overrides: Partial<BudgetPeriodeInput> = {}): BudgetPeriodeInput {
  return {
    pemasukanPeriode: 5_000_000,
    unpaidTagihanTotal: 1_000_000,
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
    // anggaranRaw = 5_000_000 − 1_000_000 = 4_000_000
    // anggaranOp  = 4_000_000
    // jatahHarian = 4_000_000 / 30 ≈ 133_333.33
    // sisaPeriode = 4_000_000 − 1_000_000 = 3_000_000
    // sisaHariIni = 133_333.33 − 100_000 ≈ 33_333.33
    const r = calcBudgetPeriode(makeInput())
    expect(r.mode).toBe('normal')
    expect(r.anggaranRaw).toBe(4_000_000)
    expect(r.anggaranOperasional).toBe(4_000_000)
    expect(r.jatahHarian).toBeCloseTo(133_333.33, 0)
    expect(r.sisaPeriode).toBe(3_000_000)
    expect(r.sisaHariIni).toBeCloseTo(33_333.33, 0)
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
    // pemasukanPeriode = unpaid → anggaranRaw = 0
    const r = calcBudgetPeriode(
      makeInput({
        pemasukanPeriode: 1_000_000,
        unpaidTagihanTotal: 1_000_000,
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
    // pemasukanPeriode=5jt, unpaid=2jt → anggaranRaw=3_000_000
    // sisaPeriode = 3_000_000 − spentThisPeriode(500rb) = 2_500_000
    const r = calcBudgetPeriode(
      makeInput({ unpaidTagihanTotal: 2_000_000, spentThisPeriode: 500_000 }),
    )
    expect(r.anggaranOperasional).toBe(3_000_000)
    expect(r.sisaPeriode).toBe(2_500_000)
  })

  it('sisaPeriode can go negative when overspent', () => {
    const r = calcBudgetPeriode(makeInput({ spentThisPeriode: 5_000_000 }))
    expect(r.sisaPeriode).toBe(r.anggaranOperasional - 5_000_000)
    expect(r.sisaPeriode).toBeLessThan(0)
  })
})

// ─── alokasi path ─────────────────────────────────────────────────────────────

describe('calcBudgetPeriode — alokasi path (operasionalBudget != null)', () => {
  const alokasiBase: BudgetPeriodeInput = {
    pemasukanPeriode: 0, // ignored in alokasi path
    unpaidTagihanTotal: 3_000_000,
    hariPeriode: 15,
    spentThisPeriode: 2_000_000,
    spentToday: 200_000,
    totalSaldo: 20_000_000,
    useSaldoFloor: false,
    operasionalBudget: 12_000_000,
    jatahHarianLocked: 800_000,
  }

  it('anggaranOperasional = operasionalBudget', () => {
    const r = calcBudgetPeriode(alokasiBase)
    expect(r.anggaranOperasional).toBe(12_000_000)
    expect(r.anggaranRaw).toBe(12_000_000)
  })

  it('sisaPeriode = operasionalBudget − spentThisPeriode (LIVE)', () => {
    const r = calcBudgetPeriode(alokasiBase)
    expect(r.sisaPeriode).toBe(10_000_000) // 12jt − 2jt
  })

  it('jatahHarian = jatahHarianLocked (model B, NOT re-divided)', () => {
    const r = calcBudgetPeriode(alokasiBase)
    expect(r.jatahHarian).toBe(800_000)
  })

  it('jatahHarian unchanged when only spentToday increases', () => {
    const r1 = calcBudgetPeriode({ ...alokasiBase, spentToday: 0 })
    const r2 = calcBudgetPeriode({ ...alokasiBase, spentToday: 500_000 })
    expect(r1.jatahHarian).toBe(r2.jatahHarian)
  })

  it('uangMengendap = totalSaldo − unpaidTagihan − operasionalBudget, clamped ≥ 0', () => {
    // 20jt − 3jt − 12jt = 5jt
    const r = calcBudgetPeriode(alokasiBase)
    expect(r.uangMengendap).toBe(5_000_000)
  })

  it('uangMengendap clamped to 0 when operasional > totalSaldo − tagihan', () => {
    const r = calcBudgetPeriode({ ...alokasiBase, operasionalBudget: 19_000_000 })
    // 20jt − 3jt − 19jt = −2jt → clamped to 0
    expect(r.uangMengendap).toBe(0)
  })

  it('mode normal when sisaPeriode >= 0 and hariPeriode > 1', () => {
    const r = calcBudgetPeriode(alokasiBase)
    expect(r.mode).toBe('normal')
  })

  it('mode bertahan when overspent (sisaPeriode < 0)', () => {
    const r = calcBudgetPeriode({ ...alokasiBase, spentThisPeriode: 15_000_000 })
    expect(r.mode).toBe('bertahan')
    expect(r.shortfall).toBe(0) // no shortfall concept in alokasi path
  })

  it('mode hari-gajian when hariPeriode = 0', () => {
    const r = calcBudgetPeriode({ ...alokasiBase, hariPeriode: 0 })
    expect(r.mode).toBe('hari-gajian')
    expect(r.jatahHarian).toBe(800_000) // still returns locked value
  })

  it('income-based path still works when operasionalBudget is null', () => {
    const r = calcBudgetPeriode({ ...alokasiBase, operasionalBudget: null })
    // falls back to income-based: pemasukanPeriode=0 → bertahan
    expect(r.mode).toBe('bertahan')
    expect(r.anggaranOperasional).toBe(0)
  })
})

// ─── recomputeAlokasi ─────────────────────────────────────────────────────────

describe('recomputeAlokasi', () => {
  it('happy path: mengendap and jatahHarianLocked correct', () => {
    const r = recomputeAlokasi({
      totalSaldo: 20_000_000,
      unpaidTagihanTotal: 3_000_000,
      operasionalBudget: 12_000_000,
      sisaHari: 15,
    })
    expect(r.mengendap).toBe(5_000_000) // 20 − 3 − 12
    expect(r.jatahHarianLocked).toBe(800_000) // 12jt / 15
  })

  it('mengendap clamped to 0 when operasional exhausts bisaDialokasi', () => {
    const r = recomputeAlokasi({
      totalSaldo: 10_000_000,
      unpaidTagihanTotal: 3_000_000,
      operasionalBudget: 10_000_000, // exceeds bisa
      sisaHari: 10,
    })
    expect(r.mengendap).toBe(0)
  })

  it('mengendap can equal bisaDialokasi when operasional = 0', () => {
    const r = recomputeAlokasi({
      totalSaldo: 10_000_000,
      unpaidTagihanTotal: 3_000_000,
      operasionalBudget: 0,
      sisaHari: 10,
    })
    expect(r.mengendap).toBe(7_000_000)
    expect(r.jatahHarianLocked).toBe(0)
  })

  it('jatahHarianLocked = 0 when sisaHari = 0 (hari-gajian guard)', () => {
    const r = recomputeAlokasi({
      totalSaldo: 20_000_000,
      unpaidTagihanTotal: 3_000_000,
      operasionalBudget: 12_000_000,
      sisaHari: 0,
    })
    expect(r.jatahHarianLocked).toBe(0)
  })
})

// ─── freelance saldo floor ────────────────────────────────────────────────────

describe('calcBudgetPeriode — freelance useSaldoFloor', () => {
  it('caps jatahHarian at totalSaldo / hariPeriode when saldo is lower', () => {
    // anggaranOp / hari = 4_000_000 / 30 ≈ 133_333
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

// ─── computeFromAllocation ────────────────────────────────────────────────────

describe('computeFromAllocation', () => {
  const base = {
    id: 1 as const,
    jatahHarian: 100_000,
    daysAtLock: 10,
    lockedAt: 0,
    periodEndDate: null,
    buatDipakai: 1_000_000,
  }

  it('sisaUang decreases as spentSinceLock increases', () => {
    const r1 = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    const r2 = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 200_000,
      spentToday: 0,
    })
    expect(r1.sisaUang).toBe(1_000_000) // 100k × 10
    expect(r2.sisaUang).toBe(800_000) // 1M - 200k
  })

  it('jatahHariIni unchanged when only spentToday changes', () => {
    const r1 = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    const r2 = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 50_000,
    })
    expect(r1.jatahHariIni).toBe(100_000)
    expect(r2.jatahHariIni).toBe(100_000)
  })

  it('totalSaldo - tagihanUnpaid - mengendap === sisaUang (invariant)', () => {
    const r = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 500_000,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(5_000_000 - 500_000 - r.mengendap).toBe(r.sisaUang)
  })

  it('sisaUang floored at 0 when overspent', () => {
    const r = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 2_000_000,
      spentToday: 0,
    })
    expect(r.sisaUang).toBe(0) // 1M - 2M floored at 0
  })
})

// ─── relock ───────────────────────────────────────────────────────────────────

describe('relock', () => {
  it('computes jatahHarian from buatDipakai / sisaHari', () => {
    const a = relock({
      totalSaldo: 0,
      tagihanUnpaid: 0,
      buatDipakai: 1_000_000,
      sisaHari: 10,
      now: 1000,
    })
    expect(a.jatahHarian).toBe(100_000)
    expect(a.daysAtLock).toBe(10)
    expect(a.lockedAt).toBe(1000)
  })

  it('jatahHarian = 0 when sisaHari = 0', () => {
    const a = relock({
      totalSaldo: 0,
      tagihanUnpaid: 0,
      buatDipakai: 500_000,
      sisaHari: 0,
      now: 999,
    })
    expect(a.jatahHarian).toBe(0)
  })

  it('stores periodEndDate for freelance', () => {
    const a = relock({
      totalSaldo: 0,
      tagihanUnpaid: 0,
      buatDipakai: 300_000,
      sisaHari: 7,
      now: 1000,
      periodEndDate: 9999,
    })
    expect(a.periodEndDate).toBe(9999)
  })

  it('periodEndDate null by default', () => {
    const a = relock({
      totalSaldo: 0,
      tagihanUnpaid: 0,
      buatDipakai: 300_000,
      sisaHari: 7,
      now: 1000,
    })
    expect(a.periodEndDate).toBeNull()
  })
})

// ─── allocation invariants: masuk vs keluar ───────────────────────────────────

describe('allocation invariants: masuk does not change sisaUang', () => {
  const base = {
    id: 1 as const,
    jatahHarian: 100_000,
    daysAtLock: 10,
    lockedAt: 0,
    periodEndDate: null,
    buatDipakai: 1_000_000,
  }

  it('masuk Rp1jt: sisaUang unchanged, mengendap +1jt, jatahHarian tetap', () => {
    const before = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    // simulate masuk: totalSaldo increases, spentSinceLock unchanged
    const after = computeFromAllocation(base, {
      totalSaldo: 6_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(after.sisaUang).toBe(before.sisaUang)
    expect(after.mengendap).toBe(before.mengendap + 1_000_000)
    expect(after.jatahHariIni).toBe(before.jatahHariIni)
  })

  it('keluar Rp200k: sisaUang turun, mengendap stabil, jatahHarian tetap', () => {
    const before = computeFromAllocation(base, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    // simulate keluar: totalSaldo decreases by same amount as spentSinceLock increases
    const after = computeFromAllocation(base, {
      totalSaldo: 4_800_000,
      tagihanUnpaid: 0,
      spentSinceLock: 200_000,
      spentToday: 200_000,
    })
    expect(after.sisaUang).toBe(before.sisaUang - 200_000)
    // mengendap stays stable: both totalSaldo and sisaUang dropped by same 200k
    expect(after.mengendap).toBe(before.mengendap)
    expect(after.jatahHariIni).toBe(before.jatahHariIni)
  })

  it('invariant: totalSaldo − tagihanUnpaid − mengendap === sisaUang after masuk', () => {
    const r = computeFromAllocation(base, {
      totalSaldo: 6_000_000,
      tagihanUnpaid: 500_000,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(6_000_000 - 500_000 - r.mengendap).toBe(r.sisaUang)
  })
})

// ─── resolveBudgetView ────────────────────────────────────────────────────────

describe('resolveBudgetView', () => {
  const alloc = {
    id: 1 as const,
    jatahHarian: 57_692,
    daysAtLock: 26,
    lockedAt: 0,
    periodEndDate: null,
    buatDipakai: 1_500_000,
  }

  const budgetBase = calcBudgetPeriode(
    makeInput({ pemasukanPeriode: 5_000_000, unpaidTagihanTotal: 200_000, totalSaldo: 2_000_000 }),
  )

  it('allocation path: sisaUang = buatDipakai − spentSinceLock', () => {
    const view = resolveBudgetView(alloc, budgetBase, {
      totalSaldo: 2_000_000,
      tagihanUnpaid: 200_000,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(view.sisaUang).toBe(1_500_000)
    expect(view.mengendap).toBe(300_000) // 2_000_000 − 200_000 − 1_500_000
    expect(view.jatahHariIni).toBe(57_692)
  })

  it('allocation path: sisaUang decreases by spentSinceLock', () => {
    const view = resolveBudgetView(alloc, budgetBase, {
      totalSaldo: 2_000_000,
      tagihanUnpaid: 200_000,
      spentSinceLock: 500_000,
      spentToday: 0,
    })
    expect(view.sisaUang).toBe(1_000_000) // 1_500_000 − 500_000
  })

  it('null allocation → income-based path uses budget.sisaPeriode', () => {
    const budget = calcBudgetPeriode(
      makeInput({
        pemasukanPeriode: 3_000_000,
        unpaidTagihanTotal: 500_000,
        spentThisPeriode: 200_000,
      }),
    )
    const view = resolveBudgetView(null, budget, {
      totalSaldo: 5_000_000,
      tagihanUnpaid: 500_000,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(view.sisaUang).toBe(budget.sisaPeriode)
    expect(view.jatahHariIni).toBe(budget.jatahHarian ?? 0)
  })

  it('edge: budget.uangMengendap negative → mengendap clamped to 0', () => {
    // totalSaldo 500k < pemasukanPeriode 3jt → uangMengendap deeply negative
    const budget = calcBudgetPeriode(
      makeInput({ pemasukanPeriode: 3_000_000, totalSaldo: 500_000 }),
    )
    expect(budget.uangMengendap).toBeLessThan(0)
    const view = resolveBudgetView(null, budget, {
      totalSaldo: 500_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(view.mengendap).toBe(0)
  })

  it('edge: budget.jatahHarian null (hari-gajian) → jatahHariIni = 0', () => {
    const budget = calcBudgetPeriode(makeInput({ hariPeriode: 0 }))
    expect(budget.jatahHarian).toBeNull()
    const view = resolveBudgetView(null, budget, {
      totalSaldo: 8_000_000,
      tagihanUnpaid: 0,
      spentSinceLock: 0,
      spentToday: 0,
    })
    expect(view.jatahHariIni).toBe(0)
  })
})
