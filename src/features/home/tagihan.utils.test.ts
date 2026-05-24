import { describe, it, expect } from 'vitest'
import type { Tagihan } from '@/db/database'
import {
  isTagihanPaidThisPeriod,
  calcNextDueDate,
  calcDaysUntilDue,
  getTagihanUrgency,
  formatTagihanMeta,
  rankTagihan,
  calcUnpaidTagihanTotal,
  hasUrgentTagihan,
} from './tagihan.utils'

// Jan 10, 2026, noon UTC  (getDate() = 10 in all but extreme UTC-offset timezones)
const NOW_MS = new Date('2026-01-10T12:00:00Z').getTime()
// Jan 28, 2026, noon UTC
const JAN28_MS = new Date('2026-01-28T12:00:00Z').getTime()
// Apr 15, 2026, noon UTC (April has 30 days)
const APR15_MS = new Date('2026-04-15T12:00:00Z').getTime()

function makeTagihan(overrides: Partial<Tagihan> = {}): Tagihan {
  return {
    id: 1,
    name: 'Tagihan Test',
    nominalType: 'tetap',
    nominalEstimate: 100_000,
    dueDay: 15,
    recurrenceType: 'rutin',
    currency: 'IDR',
    isActive: true,
    lastPaidAt: null,
    lastPaidAmount: null,
    createdAt: NOW_MS,
    ...overrides,
  }
}

// ─── isTagihanPaidThisPeriod ─────────────────────────────────────────────────

describe('isTagihanPaidThisPeriod', () => {
  it('null lastPaidAt → not paid', () => {
    expect(isTagihanPaidThisPeriod(makeTagihan(), NOW_MS)).toBe(false)
  })

  it('paid this month → paid', () => {
    const paidAt = new Date('2026-01-05T10:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(true)
  })

  it('paid last month → not paid', () => {
    const paidAt = new Date('2025-12-25T10:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(false)
  })
})

// ─── calcNextDueDate ─────────────────────────────────────────────────────────

describe('calcNextDueDate', () => {
  it('due today — returns today', () => {
    const d = calcNextDueDate(10, NOW_MS)
    expect(d.getDate()).toBe(10)
    expect(d.getMonth()).toBe(0) // January
  })

  it('due this month (not yet) — returns this month', () => {
    const d = calcNextDueDate(25, NOW_MS)
    expect(d.getDate()).toBe(25)
    expect(d.getMonth()).toBe(0) // January
  })

  it('due day already passed this month — rolls to next month', () => {
    const d = calcNextDueDate(5, NOW_MS) // today=10, dueDay=5 → Feb
    expect(d.getDate()).toBe(5)
    expect(d.getMonth()).toBe(1) // February
  })

  it('month-rollover boundary: today=28, dueDay=2 → February 2', () => {
    const d = calcNextDueDate(2, JAN28_MS)
    expect(d.getDate()).toBe(2)
    expect(d.getMonth()).toBe(1) // February
  })

  it('due day 31 in 30-day month clamps to last day', () => {
    const d = calcNextDueDate(31, APR15_MS) // April has 30 days, 31>=15 → this month → clamp to 30
    expect(d.getDate()).toBe(30)
    expect(d.getMonth()).toBe(3) // April
  })

  it('December rollover: due day passed → next month is January next year', () => {
    const dec28Ms = new Date('2026-12-28T12:00:00Z').getTime()
    const d = calcNextDueDate(5, dec28Ms) // day 5 < 28 → Jan 5 next year
    expect(d.getDate()).toBe(5)
    expect(d.getMonth()).toBe(0) // January
    expect(d.getFullYear()).toBe(2027)
  })
})

// ─── calcDaysUntilDue ────────────────────────────────────────────────────────

describe('calcDaysUntilDue', () => {
  it('due today → 0', () => {
    expect(calcDaysUntilDue(10, NOW_MS)).toBe(0)
  })

  it('due tomorrow → 1', () => {
    expect(calcDaysUntilDue(11, NOW_MS)).toBe(1)
  })

  it('due in 7 days → 7', () => {
    expect(calcDaysUntilDue(17, NOW_MS)).toBe(7)
  })

  it('due day past this month — computes against next month (never negative)', () => {
    // today=10, dueDay=5 → Feb 5 → Jan has 31 days → 31-10+5=26 days
    expect(calcDaysUntilDue(5, NOW_MS)).toBe(26)
  })

  it('month-rollover boundary: today=28, dueDay=2 → 5 days to Feb 2', () => {
    expect(calcDaysUntilDue(2, JAN28_MS)).toBe(5)
  })
})

// ─── getTagihanUrgency ───────────────────────────────────────────────────────

describe('getTagihanUrgency', () => {
  it('due today → hari-ini', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 10 }), NOW_MS)).toBe('hari-ini')
  })

  it('due tomorrow → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 11 }), NOW_MS)).toBe('dalam-7-hari')
  })

  it('due in exactly 7 days → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 17 }), NOW_MS)).toBe('dalam-7-hari')
  })

  it('due in 8 days → normal', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 18 }), NOW_MS)).toBe('normal')
  })

  it('due day past this month → normal (NOT lewat-tempo — month rollover fix)', () => {
    // TODAY=10, dueDay=5: old code showed lewat-tempo, new code shows normal (next month)
    expect(getTagihanUrgency(makeTagihan({ dueDay: 5 }), NOW_MS)).toBe('normal')
  })

  it('paid this month → normal regardless of dueDay', () => {
    const paidAt = new Date('2026-01-05T10:00:00Z').getTime()
    expect(getTagihanUrgency(makeTagihan({ dueDay: 5, lastPaidAt: paidAt }), NOW_MS)).toBe('normal')
  })

  it('month-rollover boundary: today=28, dueDay=2 → 5 days → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 2 }), JAN28_MS)).toBe('dalam-7-hari')
  })
})

// ─── formatTagihanMeta ───────────────────────────────────────────────────────

describe('formatTagihanMeta', () => {
  it('due today → "jatuh tempo hari ini · belum dibayar" (urgent)', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 10 }), NOW_MS)
    expect(result.text).toBe('jatuh tempo hari ini · belum dibayar')
    expect(result.urgent).toBe(true)
  })

  it('due tomorrow → "jatuh tempo besok" (not urgent)', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 11 }), NOW_MS)
    expect(result.text).toBe('jatuh tempo besok')
    expect(result.urgent).toBe(false)
  })

  it('due in N days → "jatuh tempo N hari lagi"', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 16 }), NOW_MS)
    expect(result.text).toBe('jatuh tempo 6 hari lagi')
    expect(result.urgent).toBe(false)
  })

  it('due day past this month → shows "tgl X" (normal, not overdue)', () => {
    // KEY FIX: dueDay=5, today=10 — old code showed "lewat 5 hari", new shows "tgl 5"
    const result = formatTagihanMeta(makeTagihan({ dueDay: 5 }), NOW_MS)
    expect(result.text).toBe('tgl 5')
    expect(result.urgent).toBe(false)
  })

  it('month-rollover: today=28, dueDay=2 → "jatuh tempo 5 hari lagi"', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 2 }), JAN28_MS)
    expect(result.text).toBe('jatuh tempo 5 hari lagi')
    expect(result.urgent).toBe(false)
  })

  it('paid this month → "tgl X" (normal)', () => {
    const paidAt = new Date('2026-01-05T10:00:00Z').getTime()
    const result = formatTagihanMeta(makeTagihan({ dueDay: 10, lastPaidAt: paidAt }), NOW_MS)
    expect(result.text).toBe('tgl 10')
    expect(result.urgent).toBe(false)
  })
})

// ─── rankTagihan ─────────────────────────────────────────────────────────────

describe('rankTagihan', () => {
  it('sorts by urgency: hari-ini → dalam-7-hari → normal', () => {
    const tagihan = [
      makeTagihan({ id: 3, dueDay: 17 }), // dalam-7-hari (7 days)
      makeTagihan({ id: 1, dueDay: 5 }), // normal (26 days — month rollover)
      makeTagihan({ id: 2, dueDay: 10 }), // hari-ini
      makeTagihan({ id: 4, dueDay: 20 }), // normal (10 days)
    ]
    const ranked = rankTagihan(tagihan, NOW_MS)
    expect(ranked[0].id).toBe(2) // hari-ini
    expect(ranked[1].id).toBe(3) // dalam-7-hari
    // both id=1 (dueDay=5) and id=4 (dueDay=20) are normal; sorted by dueDay ascending
    expect(ranked[2].id).toBe(1) // normal, dueDay=5
    expect(ranked[3].id).toBe(4) // normal, dueDay=20
  })

  it('empty list → empty', () => {
    expect(rankTagihan([], NOW_MS)).toEqual([])
  })
})

// ─── calcUnpaidTagihanTotal ──────────────────────────────────────────────────

describe('calcUnpaidTagihanTotal', () => {
  it('sums unpaid active tagihan estimates', () => {
    const tagihan = [
      makeTagihan({ id: 1, dueDay: 15, nominalEstimate: 100_000 }), // unpaid
      makeTagihan({ id: 2, dueDay: 20, nominalEstimate: 200_000 }), // unpaid
      makeTagihan({
        id: 3,
        dueDay: 20,
        nominalEstimate: 300_000,
        lastPaidAt: new Date('2026-01-02').getTime(),
      }), // paid this month
    ]
    expect(calcUnpaidTagihanTotal(tagihan, NOW_MS)).toBe(300_000)
  })

  it('all paid → 0', () => {
    const paid = new Date('2026-01-02').getTime()
    expect(calcUnpaidTagihanTotal([makeTagihan({ lastPaidAt: paid })], NOW_MS)).toBe(0)
  })

  it('empty → 0', () => {
    expect(calcUnpaidTagihanTotal([], NOW_MS)).toBe(0)
  })
})

// ─── hasUrgentTagihan ────────────────────────────────────────────────────────

describe('hasUrgentTagihan', () => {
  it('hari-ini → urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 10 })], NOW_MS)).toBe(true)
  })

  it('dalam-7-hari only → not urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 17 })], NOW_MS)).toBe(false)
  })

  it('past due day (month rolled over) → not urgent', () => {
    // dueDay=5, today=10 → next occurrence Feb 5 (normal) → NOT urgent
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 5 })], NOW_MS)).toBe(false)
  })

  it('empty → false', () => {
    expect(hasUrgentTagihan([], NOW_MS)).toBe(false)
  })
})
