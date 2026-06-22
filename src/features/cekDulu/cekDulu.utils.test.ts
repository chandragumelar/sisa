import { describe, it, expect } from 'vitest'
import { calcCekDulu } from './cekDulu.utils'
import type { CekDuluInput } from './cekDulu.utils'

// Self-consistent baseline:
//   sisaPeriode=1jt (= anggaranOperasional − spentThisPeriode from calcBudgetPeriode)
//   dailyBudget=50rb (= 1jt/20)
//   Row 2 (showSisaRow) threshold: nominal > 50rb
//   Row 3 (showTabunganRow) threshold: nominal > 1jt
const BASE: CekDuluInput = {
  nominal: 0,
  sisaPeriode: 1_000_000,
  dailyBudget: 50_000,
  daysUntilPayday: 20,
  totalNabung: 3_000_000,
}

describe('calcCekDulu — nominal 0', () => {
  it('daily after equals daily before', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.dailyAfter).toBe(r.dailyBefore)
    expect(r.dailyDelta).toBe(0)
  })

  it('dailyBefore equals passed dailyBudget', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.dailyBefore).toBe(50_000) // 1jt / 20
  })

  it('no row 2 or row 3', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.showSisaRow).toBe(false)
    expect(r.showTabunganRow).toBe(false)
  })

  it('nabung unchanged', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.nabungAfter).toBe(3_000_000)
    expect(r.nabungDrawn).toBe(0)
  })
})

describe('calcCekDulu — nominal < daily budget (small purchase)', () => {
  const input = { ...BASE, nominal: 25_000 } // 25rb < 50rb daily

  it('daily after is lower but positive', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBeGreaterThan(0)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('only row 1 — no sisa or tabungan row', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(false)
    expect(r.showTabunganRow).toBe(false)
  })

  it('nabung untouched', () => {
    const r = calcCekDulu(input)
    expect(r.nabungDrawn).toBe(0)
    expect(r.nabungAfter).toBe(3_000_000)
  })
})

describe('calcCekDulu — nominal > daily budget but < availableOp (row 2 only)', () => {
  // 50rb < nominal < 1jt → row 2 but not row 3
  const input = { ...BASE, nominal: 200_000 }

  it('shows row 2 (sisa gajian)', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(true)
  })

  it('does not show row 3 (no tabungan drawn)', () => {
    const r = calcCekDulu(input)
    expect(r.showTabunganRow).toBe(false)
    expect(r.nabungDrawn).toBe(0)
    expect(r.nabungAfter).toBe(3_000_000)
  })

  it('daily after is lower', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('sisa after = availableOp - nominal', () => {
    const r = calcCekDulu(input)
    expect(r.sisaAfter).toBe(800_000) // 1jt - 200rb
  })
})

describe('calcCekDulu — nominal > availableOp (rows 2 + 3, tabungan dipped)', () => {
  // 2jt > 1jt (availableOp) → both rows show
  const input = { ...BASE, nominal: 2_000_000 }

  it('shows both row 2 and row 3', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(true)
    expect(r.showTabunganRow).toBe(true)
  })

  it('daily after is 0', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBe(0)
  })

  it('nabung drawn = nominal - availableOp', () => {
    const r = calcCekDulu(input)
    expect(r.nabungDrawn).toBe(1_000_000) // 2jt - 1jt
    expect(r.nabungAfter).toBe(2_000_000) // 3jt - 1jt
  })

  it('sisa after is negative', () => {
    const r = calcCekDulu(input)
    expect(r.sisaAfter).toBeLessThan(0)
  })
})

describe('calcCekDulu — nominal > totalSaldo + totalNabung (extreme)', () => {
  const input = { ...BASE, nominal: 20_000_000 }

  it('daily after is 0', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBe(0)
  })

  it('tabungan after is 0 (fully depleted)', () => {
    const r = calcCekDulu(input)
    expect(r.nabungAfter).toBe(0)
  })

  it('nabung drawn is capped at totalNabung', () => {
    const r = calcCekDulu(input)
    expect(r.nabungDrawn).toBe(BASE.totalNabung)
    expect(r.nabungDrawn).toBeLessThanOrEqual(BASE.totalNabung)
  })
})

describe('calcCekDulu — edge: daysUntilPayday = 0', () => {
  it('daily is 0 (avoid divide-by-zero)', () => {
    // On hari-gajian, caller passes dailyBudget: null → calcCekDulu treats as 0
    const r = calcCekDulu({ ...BASE, dailyBudget: null, daysUntilPayday: 0, nominal: 100_000 })
    expect(r.dailyBefore).toBe(0)
    expect(r.dailyAfter).toBe(0)
    expect(isNaN(r.dailyBefore)).toBe(false)
  })
})

describe('calcCekDulu — boundary: nominal exactly equals availableOp', () => {
  it('row 3 not shown (threshold is strict >)', () => {
    const r = calcCekDulu({ ...BASE, nominal: 1_000_000 }) // exactly availableOp
    expect(r.showTabunganRow).toBe(false)
    expect(r.nabungDrawn).toBe(0)
  })

  it('row 2 shown (nominal > dailyBudget)', () => {
    const r = calcCekDulu({ ...BASE, nominal: 1_000_000 })
    expect(r.showSisaRow).toBe(true)
  })
})

describe('calcCekDulu — edge: no tagihan and no nabung → sisa equals pemasukan', () => {
  it('availableOp equals sisaPeriode, daily reflects full period budget', () => {
    const r = calcCekDulu({
      ...BASE,
      sisaPeriode: 5_000_000,
      dailyBudget: 250_000, // 5jt / 20
      totalNabung: 0,
      nominal: 0,
    })
    expect(r.dailyBefore).toBe(250_000)
    expect(r.showSisaRow).toBe(false)
    expect(r.showTabunganRow).toBe(false)
  })
})
