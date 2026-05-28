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
  getOccurrencesInWindow,
  isOccurrencePaid,
  calcNextOccurrence,
} from './tagihan.utils'

// Jan 10, 2026, noon UTC  (getDate() = 10 in all but extreme UTC-offset timezones)
const NOW_MS = new Date('2026-01-10T12:00:00Z').getTime()
// Jan 28, 2026, noon UTC
const JAN28_MS = new Date('2026-01-28T12:00:00Z').getTime()
// Dec 1, 2025 — used as createdAt "well before any Jan occurrence"
const DEC1_2025_MS = new Date(2025, 11, 1).getTime()
// Apr 15, 2026, noon UTC (April has 30 days)
const APR15_MS = new Date('2026-04-15T12:00:00Z').getTime()

// Feb 10, 2026 — used as nextPaydayMs in calcUnpaidTagihanTotal tests
const FEB10_MS = new Date(2026, 1, 10).getTime()

// Helpers for common lastPaidAt dates
const JAN9_MIDNIGHT = new Date(2026, 0, 9).getTime()
const JAN15_MIDNIGHT = new Date(2026, 0, 15).getTime()

function makeTagihan(overrides: Partial<Tagihan> = {}): Tagihan {
  return {
    id: 1,
    name: 'Tagihan Test',
    nominalType: 'tetap',
    nominalEstimate: 100_000,
    dueDay: 15,
    frequency: 'bulanan',
    anchorDate: new Date(2026, 0, 1).getTime(), // Jan 1, 2026 local
    currency: 'IDR',
    isActive: true,
    lastPaidAt: null,
    lastPaidAmount: null,
    createdAt: NOW_MS,
    ...overrides,
  }
}

// ─── isOccurrencePaid ────────────────────────────────────────────────────────

describe('isOccurrencePaid', () => {
  it('null lastPaidAt → false', () => {
    expect(isOccurrencePaid(makeTagihan(), new Date(2026, 0, 15).getTime())).toBe(false)
  })

  it('lastPaidAt === occurrenceMs → true (paid on due day)', () => {
    const occ = new Date(2026, 0, 15).getTime()
    expect(isOccurrencePaid(makeTagihan({ lastPaidAt: occ }), occ)).toBe(true)
  })

  it('lastPaidAt > occurrenceMs → true (paid after due day)', () => {
    const occ = new Date(2026, 0, 15).getTime()
    const later = new Date(2026, 0, 20).getTime()
    expect(isOccurrencePaid(makeTagihan({ lastPaidAt: later }), occ)).toBe(true)
  })

  it('lastPaidAt < occurrenceMs → false (paid before due day)', () => {
    const occ = new Date(2026, 0, 15).getTime()
    const earlier = new Date(2026, 0, 5).getTime()
    expect(isOccurrencePaid(makeTagihan({ lastPaidAt: earlier }), occ)).toBe(false)
  })
})

// ─── getOccurrencesInWindow ──────────────────────────────────────────────────

describe('getOccurrencesInWindow — bulanan', () => {
  it('includes occurrence in window', () => {
    const t = makeTagihan({ dueDay: 15, anchorDate: new Date(2026, 0, 1).getTime() })
    const jan10 = new Date(2026, 0, 10).getTime()
    const feb10 = new Date(2026, 1, 10).getTime()
    const occs = getOccurrencesInWindow(t, jan10, feb10)
    expect(occs).toHaveLength(1)
    expect(occs[0].getDate()).toBe(15)
    expect(occs[0].getMonth()).toBe(0) // January
  })

  it('window spanning 2 months gets 2 occurrences', () => {
    const t = makeTagihan({ dueDay: 5, anchorDate: new Date(2026, 0, 1).getTime() })
    const dec1 = new Date(2025, 11, 1).getTime() // before Dec 5
    const jan6 = new Date(2026, 0, 6).getTime() // after Jan 5, before Feb 5
    const occs = getOccurrencesInWindow(t, dec1, jan6)
    expect(occs).toHaveLength(2)
    expect(occs[0].getMonth()).toBe(11) // December
    expect(occs[1].getMonth()).toBe(0) // January
  })

  it('sekali: occurrence in window', () => {
    const t = makeTagihan({
      frequency: 'sekali',
      dueDay: 20,
      anchorDate: new Date(2026, 0, 1).getTime(),
    })
    const jan10 = new Date(2026, 0, 10).getTime()
    const feb1 = new Date(2026, 1, 1).getTime()
    const occs = getOccurrencesInWindow(t, jan10, feb1)
    expect(occs).toHaveLength(1)
    expect(occs[0].getDate()).toBe(20)
  })

  it('sekali: occurrence outside window → empty', () => {
    const t = makeTagihan({
      frequency: 'sekali',
      dueDay: 5,
      anchorDate: new Date(2026, 0, 1).getTime(),
    })
    const jan10 = new Date(2026, 0, 10).getTime()
    const feb1 = new Date(2026, 1, 1).getTime()
    expect(getOccurrencesInWindow(t, jan10, feb1)).toHaveLength(0)
  })

  it('mingguan: 4 weekly occurrences in 28-day window', () => {
    const anchor = new Date(2026, 0, 1).getTime() // Thu Jan 1
    const t = makeTagihan({ frequency: 'mingguan', anchorDate: anchor })
    const jan1 = new Date(2026, 0, 1).getTime()
    const jan29 = new Date(2026, 0, 29).getTime()
    const occs = getOccurrencesInWindow(t, jan1, jan29)
    expect(occs).toHaveLength(4) // Jan 1, 8, 15, 22
  })

  it('3bulanan: only every-3-month occurrences included', () => {
    const t = makeTagihan({
      frequency: '3bulanan',
      dueDay: 1,
      anchorDate: new Date(2026, 0, 1).getTime(), // Jan 2026 anchor
    })
    const oct2025 = new Date(2025, 9, 1).getTime()
    const jul2026 = new Date(2026, 6, 2).getTime()
    const occs = getOccurrencesInWindow(t, oct2025, jul2026)
    // Oct 1 2025, Jan 1 2026, Apr 1 2026, Jul 1 2026
    expect(occs).toHaveLength(4)
    expect(occs[0].getMonth()).toBe(9) // October
    expect(occs[1].getMonth()).toBe(0) // January
    expect(occs[2].getMonth()).toBe(3) // April
    expect(occs[3].getMonth()).toBe(6) // July
  })
})

// ─── calcNextOccurrence ──────────────────────────────────────────────────────

describe('calcNextOccurrence', () => {
  it('upcoming occurrence → returns it', () => {
    const t = makeTagihan({ dueDay: 15, lastPaidAt: JAN9_MIDNIGHT })
    const occ = calcNextOccurrence(t, NOW_MS) // today=Jan10
    expect(occ).not.toBeNull()
    expect(occ!.getDate()).toBe(15) // Jan 15
  })

  it('past unpaid occurrence → returns most recent overdue', () => {
    // createdAt=Dec1 ensures Jan 5 is after createdAt and counts as overdue
    const t = makeTagihan({ dueDay: 5, lastPaidAt: null, createdAt: DEC1_2025_MS })
    const occ = calcNextOccurrence(t, NOW_MS)
    expect(occ).not.toBeNull()
    expect(occ!.getDate()).toBe(5) // Jan 5 (most recent overdue, not Dec 5)
  })

  it('all past occurrences paid → returns next future', () => {
    // lastPaidAt = Jan 5 noon; marks Dec 5 + Jan 5 as paid; next = Feb 5
    const t = makeTagihan({
      dueDay: 5,
      lastPaidAt: new Date(2026, 0, 5, 12).getTime(),
    })
    const occ = calcNextOccurrence(t, NOW_MS)
    expect(occ).not.toBeNull()
    expect(occ!.getMonth()).toBe(1) // February
    expect(occ!.getDate()).toBe(5)
  })
})

// ─── isTagihanPaidThisPeriod ─────────────────────────────────────────────────

describe('isTagihanPaidThisPeriod', () => {
  it('null lastPaidAt → not paid', () => {
    expect(isTagihanPaidThisPeriod(makeTagihan(), NOW_MS)).toBe(false)
  })

  it('paid on due day → paid', () => {
    // dueDay=15, today=Jan10 → calcNextOccurrence=Jan15; lastPaidAt=Jan15midnight → paid
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: JAN15_MIDNIGHT }), NOW_MS)).toBe(true)
  })

  it('paid before due day this month → not yet paid', () => {
    // Jan 5 payment for Jan 15 occurrence: Jan5 < Jan15midnight → not paid
    const paidAt = new Date(2026, 0, 5).getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(false)
  })

  it('paid last month → not paid for this month', () => {
    const paidAt = new Date('2025-12-25T10:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(false)
  })

  it('bulanan Dec→Jan: paid Dec 15, nowMs=Jan 1 → Jan 15 not yet paid', () => {
    const paidAt = new Date(2025, 11, 15).getTime() // Dec 15 midnight
    const janMs = new Date('2026-01-01T12:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), janMs)).toBe(false)
  })

  it('sekali: stays paid in a later month', () => {
    const paidAt = new Date('2025-11-01T12:00:00Z').getTime()
    expect(
      isTagihanPaidThisPeriod(makeTagihan({ frequency: 'sekali', lastPaidAt: paidAt }), NOW_MS),
    ).toBe(true)
  })

  it('sekali: paid Dec stays paid in Jan', () => {
    const paidAt = new Date('2025-12-20T12:00:00Z').getTime()
    const janMs = new Date('2026-01-10T12:00:00Z').getTime()
    expect(
      isTagihanPaidThisPeriod(makeTagihan({ frequency: 'sekali', lastPaidAt: paidAt }), janMs),
    ).toBe(true)
  })

  it('sekali: null lastPaidAt → not paid', () => {
    expect(
      isTagihanPaidThisPeriod(makeTagihan({ frequency: 'sekali', lastPaidAt: null }), NOW_MS),
    ).toBe(false)
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
  it('due today → hari-ini (prev occurrence paid)', () => {
    // lastPaidAt=Jan9midnight marks Dec 10 as paid; Jan 10 (today) is upcoming+unpaid
    expect(getTagihanUrgency(makeTagihan({ dueDay: 10, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)).toBe(
      'hari-ini',
    )
  })

  it('due tomorrow → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 11, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)).toBe(
      'dalam-7-hari',
    )
  })

  it('due in exactly 7 days → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 17, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)).toBe(
      'dalam-7-hari',
    )
  })

  it('due in 8 days → normal', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 18, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)).toBe(
      'normal',
    )
  })

  it('past due day, unpaid, created before → lewat-tempo', () => {
    // createdAt=Dec1 → Jan 5 is after createdAt → counts as overdue
    expect(
      getTagihanUrgency(
        makeTagihan({ dueDay: 5, lastPaidAt: null, createdAt: DEC1_2025_MS }),
        NOW_MS,
      ),
    ).toBe('lewat-tempo')
  })

  it('paid on due day → normal', () => {
    // lastPaidAt=Jan5noon marks Dec5+Jan5 as paid; next=Feb5 (26 days)
    const paidAt = new Date(2026, 0, 5, 12).getTime()
    expect(getTagihanUrgency(makeTagihan({ dueDay: 5, lastPaidAt: paidAt }), NOW_MS)).toBe('normal')
  })

  it('month-rollover: today=28, dueDay=2, Jan2 paid → Feb2 is 5 days → dalam-7-hari', () => {
    // Jan 2 midnight paid; Feb 2 is 5 days away
    const paidAt = new Date(2026, 0, 2).getTime()
    expect(getTagihanUrgency(makeTagihan({ dueDay: 2, lastPaidAt: paidAt }), JAN28_MS)).toBe(
      'dalam-7-hari',
    )
  })

  it('month-rollover: today=28, dueDay=2, created before → lewat-tempo', () => {
    // createdAt=Dec1 → Jan 2 is after createdAt → counts as overdue
    expect(
      getTagihanUrgency(
        makeTagihan({ dueDay: 2, lastPaidAt: null, createdAt: DEC1_2025_MS }),
        JAN28_MS,
      ),
    ).toBe('lewat-tempo')
  })
})

// ─── formatTagihanMeta ───────────────────────────────────────────────────────

describe('formatTagihanMeta', () => {
  it('due today, prev paid → "jatuh tempo hari ini · belum dibayar" (urgent)', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 10, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)
    expect(result.text).toBe('jatuh tempo hari ini · belum dibayar')
    expect(result.urgent).toBe(true)
  })

  it('due tomorrow → "jatuh tempo besok" (not urgent)', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 11, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)
    expect(result.text).toBe('jatuh tempo besok')
    expect(result.urgent).toBe(false)
  })

  it('due in N days → "jatuh tempo N hari lagi"', () => {
    const result = formatTagihanMeta(makeTagihan({ dueDay: 16, lastPaidAt: JAN9_MIDNIGHT }), NOW_MS)
    expect(result.text).toBe('jatuh tempo 6 hari lagi')
    expect(result.urgent).toBe(false)
  })

  it('past due day, unpaid, created before → overdue text (urgent)', () => {
    // createdAt=Dec1 → Jan 5 counts as overdue (5 days past)
    const result = formatTagihanMeta(
      makeTagihan({ dueDay: 5, lastPaidAt: null, createdAt: DEC1_2025_MS }),
      NOW_MS,
    )
    expect(result.text).toBe('lewat 5 hari · belum dibayar')
    expect(result.urgent).toBe(true)
  })

  it('month-rollover: today=28, dueDay=2, Jan2 paid → "jatuh tempo 5 hari lagi"', () => {
    const paidAt = new Date(2026, 0, 2).getTime()
    const result = formatTagihanMeta(makeTagihan({ dueDay: 2, lastPaidAt: paidAt }), JAN28_MS)
    expect(result.text).toBe('jatuh tempo 5 hari lagi')
    expect(result.urgent).toBe(false)
  })

  it('paid on due day → "tgl X" (normal)', () => {
    const paidAt = new Date(2026, 0, 10).getTime() // Jan 10 midnight (= today)
    const result = formatTagihanMeta(makeTagihan({ dueDay: 10, lastPaidAt: paidAt }), NOW_MS)
    expect(result.text).toBe('tgl 10')
    expect(result.urgent).toBe(false)
  })
})

// ─── rankTagihan ─────────────────────────────────────────────────────────────

describe('rankTagihan', () => {
  // Use JAN9_MIDNIGHT as lastPaidAt for all — marks all past occurrences as paid,
  // leaving each tagihan's urgency determined solely by its dueDay relative to today (Jan 10).
  it('sorts by urgency: hari-ini → dalam-7-hari → normal', () => {
    const tagihan = [
      makeTagihan({ id: 3, dueDay: 17, lastPaidAt: JAN9_MIDNIGHT }), // dalam-7-hari (7 days)
      makeTagihan({ id: 1, dueDay: 5, lastPaidAt: JAN9_MIDNIGHT }), // normal (Feb 5, 26 days)
      makeTagihan({ id: 2, dueDay: 10, lastPaidAt: JAN9_MIDNIGHT }), // hari-ini
      makeTagihan({ id: 4, dueDay: 20, lastPaidAt: JAN9_MIDNIGHT }), // normal (10 days)
    ]
    const ranked = rankTagihan(tagihan, NOW_MS)
    expect(ranked[0].id).toBe(2) // hari-ini
    expect(ranked[1].id).toBe(3) // dalam-7-hari
    // both id=1 (dueDay=5, normal) and id=4 (dueDay=20, normal) — sorted by dueDay
    expect(ranked[2].id).toBe(1) // normal, dueDay=5
    expect(ranked[3].id).toBe(4) // normal, dueDay=20
  })

  it('empty list → empty', () => {
    expect(rankTagihan([], NOW_MS)).toEqual([])
  })
})

// ─── calcUnpaidTagihanTotal ──────────────────────────────────────────────────

describe('calcUnpaidTagihanTotal', () => {
  it('sums unpaid active tagihan occurrences in window', () => {
    const tagihan = [
      makeTagihan({ id: 1, dueDay: 15, nominalEstimate: 100_000 }), // Jan 15 in [Jan10, Feb10)
      makeTagihan({ id: 2, dueDay: 20, nominalEstimate: 200_000 }), // Jan 20 in window
      makeTagihan({
        id: 3,
        dueDay: 20,
        nominalEstimate: 300_000,
        lastPaidAt: new Date(2026, 0, 20).getTime(), // paid on Jan 20 → isOccurrencePaid=true
      }),
    ]
    expect(calcUnpaidTagihanTotal(tagihan, NOW_MS, FEB10_MS)).toBe(300_000)
  })

  it('all occurrences paid → 0', () => {
    const paid = new Date(2026, 0, 15).getTime() // Jan 15 midnight
    expect(calcUnpaidTagihanTotal([makeTagihan({ lastPaidAt: paid })], NOW_MS, FEB10_MS)).toBe(0)
  })

  it('empty → 0', () => {
    expect(calcUnpaidTagihanTotal([], NOW_MS, FEB10_MS)).toBe(0)
  })

  it('inactive tagihan excluded', () => {
    const inactive = makeTagihan({ isActive: false, nominalEstimate: 500_000 })
    expect(calcUnpaidTagihanTotal([inactive], NOW_MS, FEB10_MS)).toBe(0)
  })

  it('weekly tagihan with 2 occurrences in window counted twice', () => {
    // anchor = Jan 1 (Thu), weekly → Jan 1, Jan 8, Jan 15, Jan 22, Jan 29
    // window = [Jan 10 midnight, Jan 24 midnight): Jan 15, Jan 22
    const t = makeTagihan({
      frequency: 'mingguan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      nominalEstimate: 50_000,
      lastPaidAt: null,
    })
    const jan24 = new Date(2026, 0, 24).getTime()
    expect(calcUnpaidTagihanTotal([t], NOW_MS, jan24)).toBe(100_000)
  })
})

// ─── hasUrgentTagihan ────────────────────────────────────────────────────────

describe('hasUrgentTagihan', () => {
  it('hari-ini → urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 10, lastPaidAt: JAN9_MIDNIGHT })], NOW_MS)).toBe(
      true,
    )
  })

  it('lewat-tempo (past due unpaid, created before) → urgent', () => {
    expect(
      hasUrgentTagihan(
        [makeTagihan({ dueDay: 5, lastPaidAt: null, createdAt: DEC1_2025_MS })],
        NOW_MS,
      ),
    ).toBe(true)
  })

  it('dalam-7-hari only → not urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 17, lastPaidAt: JAN9_MIDNIGHT })], NOW_MS)).toBe(
      false,
    )
  })

  it('normal → not urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 20, lastPaidAt: JAN9_MIDNIGHT })], NOW_MS)).toBe(
      false,
    )
  })

  it('empty → false', () => {
    expect(hasUrgentTagihan([], NOW_MS)).toBe(false)
  })
})

// ─── calcNextOccurrence — createdAt boundary per frequency ───────────────────

describe('calcNextOccurrence — createdAt boundary', () => {
  // NOW_MS = Jan 10, 2026 noon

  // ── bulanan ────────────────────────────────────────────────────────────────

  it('bulanan: created AFTER dueDay → shows next month (not overdue this month)', () => {
    // dueDay=5, createdAt=Jan10 → Jan 5 occurrence is before createdAt → skip
    // next: Feb 5
    const tag = makeTagihan({
      dueDay: 5,
      frequency: 'bulanan',
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 1, 5))
  })

  it('bulanan: created BEFORE dueDay → shows overdue occurrence', () => {
    // dueDay=5, createdAt=Dec1 → Jan 5 occurrence is after createdAt and before today → overdue
    const tag = makeTagihan({
      dueDay: 5,
      frequency: 'bulanan',
      lastPaidAt: null,
      createdAt: DEC1_2025_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 5))
  })

  it('bulanan: created ON dueDay → shows today as upcoming (not overdue)', () => {
    // dueDay=10, createdAt=Jan10 noon → today midnight = Jan 10 → upcoming
    const jan10Noon = NOW_MS
    const tag = makeTagihan({
      dueDay: 10,
      frequency: 'bulanan',
      lastPaidAt: null,
      createdAt: jan10Noon,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 10))
  })

  it('bulanan: dueDay=31 clamps to Feb 28 when upcoming occurrence is in February', () => {
    // nowMs=Feb 10; Jan 31 paid → no overdue; next occurrence is Feb 28 (31→28 clamp)
    const feb10 = new Date('2026-02-10T12:00:00Z').getTime()
    const jan31Midnight = new Date(2026, 0, 31).getTime()
    const tag = makeTagihan({
      dueDay: 31,
      frequency: 'bulanan',
      lastPaidAt: jan31Midnight,
      createdAt: DEC1_2025_MS,
    })
    const result = calcNextOccurrence(tag, feb10)
    expect(result).toEqual(new Date(2026, 1, 28))
  })

  // ── sekali ─────────────────────────────────────────────────────────────────

  it('sekali: created AFTER dueDay in anchor month → returns null (occurrence before createdAt)', () => {
    // anchorDate=Jan1, dueDay=5 → occurrence=Jan5; createdAt=Jan10 → Jan5 < createdAt → null
    const tag = makeTagihan({
      dueDay: 5,
      frequency: 'sekali',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toBeNull()
  })

  it('sekali: created BEFORE dueDay → shows occurrence as overdue', () => {
    // anchorDate=Jan1, dueDay=5 → occurrence=Jan5; createdAt=Dec1 → overdue
    const tag = makeTagihan({
      dueDay: 5,
      frequency: 'sekali',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: DEC1_2025_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 5))
  })

  it('sekali: created ON dueDay → shows today as upcoming', () => {
    // anchorDate=Jan10, dueDay=10 → occurrence=Jan10; createdAt=Jan10 noon
    const tag = makeTagihan({
      dueDay: 10,
      frequency: 'sekali',
      anchorDate: new Date(2026, 0, 10).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 10))
  })

  // ── mingguan ───────────────────────────────────────────────────────────────

  it('mingguan: created AFTER anchor occurrence → shows next weekly occurrence', () => {
    // anchor=Jan1 (Thu), interval=7 → occurrences: Jan1, Jan8, Jan15, ...
    // createdAt=Jan10 (noon) → Jan1 and Jan8 before createdAt → skip; Jan15 is upcoming
    const tag = makeTagihan({
      frequency: 'mingguan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 15))
  })

  it('mingguan: created BEFORE recent occurrence → shows overdue', () => {
    // anchor=Jan1, interval=7 → Jan8 occurrence; createdAt=Dec1 → Jan8 is overdue
    const tag = makeTagihan({
      frequency: 'mingguan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: DEC1_2025_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 8))
  })

  // ── 2mingguan ──────────────────────────────────────────────────────────────

  it('2mingguan: created AFTER anchor occurrence → shows next bi-weekly', () => {
    // anchor=Jan1, interval=14 → occurrences: Jan1, Jan15, Jan29, ...
    // createdAt=Jan10 → Jan1 before createdAt → skip; Jan15 is upcoming
    const tag = makeTagihan({
      frequency: '2mingguan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 15))
  })

  it('2mingguan: created BEFORE anchor → shows latest overdue bi-weekly', () => {
    // anchor=Jan1, interval=14 → Jan1 overdue; createdAt=Dec1 → overdue
    const tag = makeTagihan({
      frequency: '2mingguan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: DEC1_2025_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    // Jan 1 is the most recent overdue (Jan 15 is upcoming)
    expect(result).toEqual(new Date(2026, 0, 1))
  })

  // ── 2bulanan ───────────────────────────────────────────────────────────────

  it('2bulanan: created AFTER dueDay → next occurrence skips to +2 months', () => {
    // anchor=Jan1, dueDay=5, interval=2 → occurrences: Jan5, Mar5, May5, ...
    // createdAt=Jan10 → Jan5 before createdAt → skip; Mar5 is next
    const tag = makeTagihan({
      dueDay: 5,
      frequency: '2bulanan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 2, 5))
  })

  // ── 3bulanan ───────────────────────────────────────────────────────────────

  it('3bulanan: created AFTER dueDay → shows next interval occurrence', () => {
    // anchor=Jan1, dueDay=5, interval=3 → occurrences: Jan5, Apr5, Jul5, ...
    // createdAt=Jan10 → Jan5 before createdAt → skip
    // nowMs=Mar15 → Apr5 is 21 days away, within 60-day lookahead
    const mar15 = new Date('2026-03-15T12:00:00Z').getTime()
    const tag = makeTagihan({
      dueDay: 5,
      frequency: '3bulanan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, mar15)
    expect(result).toEqual(new Date(2026, 3, 5))
  })

  // ── tahunan ────────────────────────────────────────────────────────────────

  it('tahunan: created AFTER dueDay → next occurrence is +12 months (outside 60-day window → null)', () => {
    // anchor=Jan1, dueDay=5, interval=12 → occurrences: Jan5 2026, Jan5 2027, ...
    // createdAt=Jan10 → Jan5 2026 before createdAt → skip; Jan5 2027 outside 60-day window → null
    const tag = makeTagihan({
      dueDay: 5,
      frequency: 'tahunan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toBeNull()
  })

  it('tahunan: created BEFORE dueDay in same month → shows upcoming occurrence', () => {
    // anchor=Jan1, dueDay=15, interval=12 → Jan15 upcoming (createdAt=Jan10)
    const tag = makeTagihan({
      dueDay: 15,
      frequency: 'tahunan',
      anchorDate: new Date(2026, 0, 1).getTime(),
      lastPaidAt: null,
      createdAt: NOW_MS,
    })
    const result = calcNextOccurrence(tag, NOW_MS)
    expect(result).toEqual(new Date(2026, 0, 15))
  })
})
