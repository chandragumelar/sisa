import { describe, it, expect } from 'vitest'
import { calcCekDulu, fillWarnPlaceholders } from './cekDulu.utils'
import type { CekDuluInput } from './cekDulu.utils'
import { t } from '@/shared/strings/strings'

// Self-consistent baseline:
//   sisaUang=1jt (live remaining operational budget)
//   dailyBudget=50rb (= 1jt/20)
//   Row 2 (showSisaRow) threshold: nominal > 50rb
//   Row 3 (showMengendapRow) threshold: nominal > 1jt
const BASE: CekDuluInput = {
  nominal: 0,
  sisaUang: 1_000_000,
  dailyBudget: 50_000,
  daysUntilPayday: 20,
  mengendap: 3_000_000,
  jatahHarian: 50_000,
}

describe('calcCekDulu — nominal 0', () => {
  it('daily after equals daily before', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.dailyAfter).toBe(r.dailyBefore)
    expect(r.dailyDelta).toBe(0)
  })

  it('dailyBefore equals passed dailyBudget', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.dailyBefore).toBe(50_000)
  })

  it('no row 2 or row 3', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.showSisaRow).toBe(false)
    expect(r.showMengendapRow).toBe(false)
  })

  it('mengendap unchanged', () => {
    const r = calcCekDulu({ ...BASE, nominal: 0 })
    expect(r.mengendapAfter).toBe(3_000_000)
    expect(r.mengendapDrawn).toBe(0)
  })
})

describe('calcCekDulu — nominal < daily budget (small purchase)', () => {
  const input = { ...BASE, nominal: 25_000 } // 25rb < 50rb daily

  it('daily after is lower but positive', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBeGreaterThan(0)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('only row 1 — no sisa or mengendap row', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(false)
    expect(r.showMengendapRow).toBe(false)
  })

  it('mengendap untouched', () => {
    const r = calcCekDulu(input)
    expect(r.mengendapDrawn).toBe(0)
    expect(r.mengendapAfter).toBe(3_000_000)
  })
})

describe('calcCekDulu — nominal > daily budget but < sisaUang (row 2 only)', () => {
  // 50rb < nominal < 1jt → row 2 but not row 3
  const input = { ...BASE, nominal: 200_000 }

  it('shows row 2 (sisa gajian)', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(true)
  })

  it('does not show row 3 (no mengendap drawn)', () => {
    const r = calcCekDulu(input)
    expect(r.showMengendapRow).toBe(false)
    expect(r.mengendapDrawn).toBe(0)
    expect(r.mengendapAfter).toBe(3_000_000)
  })

  it('daily after is lower', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBeLessThan(r.dailyBefore)
  })

  it('sisa after = sisaUang - nominal', () => {
    const r = calcCekDulu(input)
    expect(r.sisaAfter).toBe(800_000) // 1jt - 200rb
  })
})

describe('calcCekDulu — nominal > sisaUang (rows 2 + 3, mengendap dipped)', () => {
  // 2jt > 1jt (sisaUang) → both rows show
  const input = { ...BASE, nominal: 2_000_000 }

  it('shows both row 2 and row 3', () => {
    const r = calcCekDulu(input)
    expect(r.showSisaRow).toBe(true)
    expect(r.showMengendapRow).toBe(true)
  })

  it('daily after is 0', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBe(0)
  })

  it('mengendap drawn = nominal - sisaUang, capped at mengendap', () => {
    const r = calcCekDulu(input)
    expect(r.mengendapDrawn).toBe(1_000_000) // 2jt - 1jt
    expect(r.mengendapAfter).toBe(2_000_000) // 3jt - 1jt
  })

  it('sisa after is negative', () => {
    const r = calcCekDulu(input)
    expect(r.sisaAfter).toBeLessThan(0)
  })

  it('recoveryDays = ceil(mengendapDrawn / jatahHarian)', () => {
    const r = calcCekDulu(input)
    expect(r.recoveryDays).toBe(Math.ceil(1_000_000 / 50_000)) // 20 days
  })
})

describe('calcCekDulu — nominal > mengendap (extreme overdraw)', () => {
  const input = { ...BASE, nominal: 20_000_000 }

  it('daily after is 0', () => {
    const r = calcCekDulu(input)
    expect(r.dailyAfter).toBe(0)
  })

  it('mengendap after is 0 (fully depleted)', () => {
    const r = calcCekDulu(input)
    expect(r.mengendapAfter).toBe(0)
  })

  it('mengendapDrawn capped at mengendap', () => {
    const r = calcCekDulu(input)
    expect(r.mengendapDrawn).toBe(BASE.mengendap)
    expect(r.mengendapDrawn).toBeLessThanOrEqual(BASE.mengendap)
  })
})

describe('calcCekDulu — edge: daysUntilPayday = 0', () => {
  it('daily is 0 (avoid divide-by-zero)', () => {
    const r = calcCekDulu({ ...BASE, dailyBudget: null, daysUntilPayday: 0, nominal: 100_000 })
    expect(r.dailyBefore).toBe(0)
    expect(r.dailyAfter).toBe(0)
    expect(isNaN(r.dailyBefore)).toBe(false)
  })
})

describe('calcCekDulu — boundary: nominal exactly equals sisaUang', () => {
  it('row 3 not shown (threshold is strict >)', () => {
    const r = calcCekDulu({ ...BASE, nominal: 1_000_000 }) // exactly sisaUang
    expect(r.showMengendapRow).toBe(false)
    expect(r.mengendapDrawn).toBe(0)
  })

  it('row 2 shown (nominal > dailyBudget)', () => {
    const r = calcCekDulu({ ...BASE, nominal: 1_000_000 })
    expect(r.showSisaRow).toBe(true)
  })
})

describe('calcCekDulu — edge: no mengendap → recoveryDays always 0', () => {
  it('mengendap=0: no row 3, recoveryDays=0', () => {
    const r = calcCekDulu({ ...BASE, mengendap: 0, nominal: 2_000_000 })
    expect(r.showMengendapRow).toBe(true) // nominal > sisaUang
    expect(r.mengendapDrawn).toBe(0) // nothing to draw from
    expect(r.recoveryDays).toBe(0)
  })
})

describe('calcCekDulu — edge: no tagihan and no mengendap → sisa equals pemasukan', () => {
  it('availableOp equals sisaUang, daily reflects full period budget', () => {
    const r = calcCekDulu({
      ...BASE,
      sisaUang: 5_000_000,
      dailyBudget: 250_000, // 5jt / 20
      mengendap: 0,
      nominal: 0,
    })
    expect(r.dailyBefore).toBe(250_000)
    expect(r.showSisaRow).toBe(false)
    expect(r.showMengendapRow).toBe(false)
  })
})

describe('fillWarnPlaceholders', () => {
  it('happy: replaces every occurrence of a repeated token, not just the first', () => {
    const template = t('cek_dulu.warn_t2_10', 'id')
    const result = fillWarnPlaceholders(template, {
      dropPct: 22,
      fundPct: 0,
      daysUntilPayday: 0,
    })
    expect(result).not.toContain('{dropPct}')
    expect(result).toContain('22%')
  })

  it('empty: template with no tokens returns unchanged', () => {
    const result = fillWarnPlaceholders('teks tanpa token', {
      dropPct: 10,
      fundPct: 20,
      daysUntilPayday: 3,
    })
    expect(result).toBe('teks tanpa token')
  })

  it('boundary: all three tokens present and repeated resolve fully', () => {
    const template =
      '{dropPct}% turun, {fundPct}% sisa, {daysUntilPayday} hari lagi, {dropPct}% lagi'
    const result = fillWarnPlaceholders(template, {
      dropPct: 15,
      fundPct: 40,
      daysUntilPayday: 5,
    })
    expect(result).toBe('15% turun, 40% sisa, 5 hari lagi, 15% lagi')
  })
})
