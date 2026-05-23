import { describe, it, expect } from 'vitest'
import type { Settings, Tagihan, Goal, Transaction } from '@/db/database'
import {
  calcDaysUntilPayday,
  calcDailyBudget,
  getDaysUntilEndOfWeek,
  calcWeeklyBudget,
  calcSisaPasGajian,
  calcSpentToday,
  calcYesterdayStats,
  isTagihanPaidThisPeriod,
  getTagihanUrgency,
  rankTagihan,
  calcUnpaidTagihanTotal,
  hasUrgentTagihan,
  calcGoalStatuses,
} from './home.utils'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Wed 2024-01-10 12:00:00 UTC → JS: getDate()=10, getDay()=3 (Wednesday)
const NOW_MS = new Date('2024-01-10T12:00:00Z').getTime()

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: 1,
    language: 'id',
    theme: 'system',
    incomeType: 'tetap',
    incomeDay: 25,
    freelanceMinBalance: null,
    primaryCurrency: 'IDR',
    secondaryCurrency: null,
    activeCurrencyMode: 'IDR',
    weekendBehavior: null,
    onboardingCompleted: true,
    lastExportedAt: null,
    ...overrides,
  }
}

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

function makeGoal(id: number, order: number, target: number): Goal {
  return { id, name: `Goal ${id}`, target, currency: 'IDR', order, createdAt: NOW_MS }
}

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 1,
    walletId: 1,
    amount: -50_000,
    type: 'keluar',
    currency: 'IDR',
    date: NOW_MS,
    isFromSavings: false,
    isEarmark: false,
    createdAt: NOW_MS,
    ...overrides,
  }
}

// ─── calcDaysUntilPayday ──────────────────────────────────────────────────────

describe('calcDaysUntilPayday', () => {
  // NOW = Jan 10 (Wed). incomeDay=25 → payday Jan 25 → 15 days away
  it('tetap — payday this month, not yet passed', () => {
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeDay: 25 }))).toBe(15)
  })

  it('tetap — payday already passed, rolls to next month', () => {
    // Jan 10, incomeDay=5 → payday already passed → Feb 5
    // Jan has 31 days, so Feb 5 - Jan 10 = 26 days
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeDay: 5 }))).toBe(26)
  })

  it('tetap — payday is today → returns 1 (not 0)', () => {
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeDay: 10 }))).toBe(1)
  })

  it('freelance — returns remaining days in month', () => {
    // Jan 10 → 31 - 10 = 21 days remaining
    const days = calcDaysUntilPayday(NOW_MS, makeSettings({ incomeType: 'freelance' }))
    expect(days).toBe(21)
  })

  it('mix — behaves like tetap', () => {
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeType: 'mix', incomeDay: 25 }))).toBe(15)
  })

  // Sat 2024-01-20, incomeDay=20 → payday IS today (Saturday)
  it('weekend — maju-jumat shifts Saturday to Friday (yesterday)', () => {
    const satNow = new Date('2024-01-20T12:00:00Z').getTime() // Saturday Jan 20
    // payday would be Jan 20 (today) but it's Saturday → maju-jumat → Jan 19 (Friday)
    // Jan 19 was yesterday → diff = -1 → clamped to 1
    const days = calcDaysUntilPayday(
      satNow,
      makeSettings({ incomeDay: 20, weekendBehavior: 'maju-jumat' }),
    )
    expect(days).toBe(1)
  })

  it('weekend — mundur-senin shifts Saturday to Monday (2 days ahead)', () => {
    const satNow = new Date('2024-01-20T12:00:00Z').getTime() // Saturday Jan 20
    // payday is Jan 20 (Saturday) → mundur-senin → Jan 22 (Monday) → 2 days
    const days = calcDaysUntilPayday(
      satNow,
      makeSettings({ incomeDay: 20, weekendBehavior: 'mundur-senin' }),
    )
    expect(days).toBe(2)
  })

  it('boundary — incomeDay=31 in leap-year February clamps to Feb 29', () => {
    // 2024 is a leap year → Feb has 29 days
    const febNow = new Date('2024-02-10T12:00:00Z').getTime()
    // today(10) <= incomeDay(31) → payday = Math.min(31, 29) = Feb 29 → 19 days
    expect(calcDaysUntilPayday(febNow, makeSettings({ incomeDay: 31 }))).toBe(19)
  })

  it('boundary — incomeDay=31 in non-leap February clamps to Feb 28', () => {
    // 2025 is not a leap year → Feb has 28 days
    const febNow = new Date('2025-02-10T12:00:00Z').getTime()
    // today(10) <= incomeDay(31) → payday = Math.min(31, 28) = Feb 28 → 18 days
    expect(calcDaysUntilPayday(febNow, makeSettings({ incomeDay: 31 }))).toBe(18)
  })
})

// ─── calcDailyBudget ──────────────────────────────────────────────────────────

describe('calcDailyBudget', () => {
  it('normal case', () => {
    // saldo 4.730.000, tagihan 1.000.000, savings 500.000, days 15
    // (4730000 - 1000000 - 500000) / 15 = 215.333...
    expect(calcDailyBudget(4_730_000, 1_000_000, 500_000, 15)).toBeCloseTo(215_333, -1)
  })

  it('saldo 0 → returns 0', () => {
    expect(calcDailyBudget(0, 0, 0, 15)).toBe(0)
  })

  it('tagihan > saldo → returns 0 (no negative budget)', () => {
    expect(calcDailyBudget(100_000, 500_000, 0, 10)).toBe(0)
  })

  it('daysUntilPayday = 0 → returns 0 (guards division by zero)', () => {
    expect(calcDailyBudget(1_000_000, 0, 0, 0)).toBe(0)
  })

  it('no tagihan, no savings → saldo / days', () => {
    expect(calcDailyBudget(3_000_000, 0, 0, 10)).toBe(300_000)
  })
})

// ─── getDaysUntilEndOfWeek ────────────────────────────────────────────────────

describe('getDaysUntilEndOfWeek', () => {
  it('Wednesday → 4 days until Sunday', () => {
    expect(getDaysUntilEndOfWeek(NOW_MS)).toBe(4) // Jan 10 = Wednesday
  })

  it('Sunday → 7 (next full week)', () => {
    const sun = new Date('2024-01-07T12:00:00Z').getTime() // Sunday
    expect(getDaysUntilEndOfWeek(sun)).toBe(7)
  })

  it('Saturday → 1', () => {
    const sat = new Date('2024-01-13T12:00:00Z').getTime()
    expect(getDaysUntilEndOfWeek(sat)).toBe(1)
  })
})

// ─── calcWeeklyBudget ─────────────────────────────────────────────────────────

describe('calcWeeklyBudget', () => {
  it('dailyBudget × daysUntilWeekEnd', () => {
    expect(calcWeeklyBudget(200_000, 4)).toBe(800_000)
  })

  it('dailyBudget 0 → 0', () => {
    expect(calcWeeklyBudget(0, 4)).toBe(0)
  })
})

// ─── calcSisaPasGajian ────────────────────────────────────────────────────────

describe('calcSisaPasGajian', () => {
  it('normal — positive remainder', () => {
    // 4.730.000 - (178.000 × 15) - 1.000.000 = 1.060.000
    expect(calcSisaPasGajian(4_730_000, 178_000, 15, 1_000_000)).toBe(1_060_000)
  })

  it('tagihan > saldo → negative (ketat)', () => {
    expect(calcSisaPasGajian(500_000, 50_000, 10, 1_000_000)).toBe(-1_000_000)
  })

  it('saldo 0 → deeply negative', () => {
    expect(calcSisaPasGajian(0, 100_000, 10, 200_000)).toBe(-1_200_000)
  })
})

// ─── calcSpentToday ───────────────────────────────────────────────────────────

describe('calcSpentToday', () => {
  it('sums keluar transactions from today', () => {
    const todayTx = makeTx({ amount: -30_000, type: 'keluar', date: NOW_MS })
    const yesterdayTx = makeTx({ amount: -50_000, type: 'keluar', date: NOW_MS - 86_400_000 })
    expect(calcSpentToday([todayTx, yesterdayTx], NOW_MS)).toBe(30_000)
  })

  it('excludes masuk transactions', () => {
    const income = makeTx({ amount: 500_000, type: 'masuk', date: NOW_MS })
    expect(calcSpentToday([income], NOW_MS)).toBe(0)
  })

  it('empty transactions → 0', () => {
    expect(calcSpentToday([], NOW_MS)).toBe(0)
  })
})

// ─── calcYesterdayStats ───────────────────────────────────────────────────────

describe('calcYesterdayStats', () => {
  const yesterdayMs = NOW_MS - 86_400_000

  it('sums spent and earned from yesterday', () => {
    const txs = [
      makeTx({ amount: -20_000, type: 'keluar', date: yesterdayMs }),
      makeTx({ amount: 500_000, type: 'masuk', date: yesterdayMs }),
      makeTx({ amount: -10_000, type: 'keluar', date: NOW_MS }), // today — excluded
    ]
    const { spent, earned } = calcYesterdayStats(txs, NOW_MS)
    expect(spent).toBe(20_000)
    expect(earned).toBe(500_000)
  })

  it('empty → both 0', () => {
    expect(calcYesterdayStats([], NOW_MS)).toEqual({ spent: 0, earned: 0 })
  })
})

// ─── Tagihan utils ────────────────────────────────────────────────────────────

describe('isTagihanPaidThisPeriod', () => {
  it('null lastPaidAt → not paid', () => {
    expect(isTagihanPaidThisPeriod(makeTagihan(), NOW_MS)).toBe(false)
  })

  it('paid this month → paid', () => {
    const paidAt = new Date('2024-01-05T10:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(true)
  })

  it('paid last month → not paid', () => {
    const paidAt = new Date('2023-12-25T10:00:00Z').getTime()
    expect(isTagihanPaidThisPeriod(makeTagihan({ lastPaidAt: paidAt }), NOW_MS)).toBe(false)
  })
})

describe('getTagihanUrgency', () => {
  // NOW = Jan 10

  it('dueDay in past, unpaid → lewat-tempo', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 5 }), NOW_MS)).toBe('lewat-tempo')
  })

  it('dueDay today, unpaid → hari-ini', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 10 }), NOW_MS)).toBe('hari-ini')
  })

  it('dueDay in 7 days → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 17 }), NOW_MS)).toBe('dalam-7-hari')
  })

  it('dueDay in 7 days exactly (boundary) → dalam-7-hari', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 17 }), NOW_MS)).toBe('dalam-7-hari')
  })

  it('dueDay in 8 days → normal', () => {
    expect(getTagihanUrgency(makeTagihan({ dueDay: 18 }), NOW_MS)).toBe('normal')
  })

  it('paid this month → normal regardless of dueDay', () => {
    const paidAt = new Date('2024-01-05T10:00:00Z').getTime()
    expect(getTagihanUrgency(makeTagihan({ dueDay: 5, lastPaidAt: paidAt }), NOW_MS)).toBe('normal')
  })
})

describe('rankTagihan', () => {
  it('sorts by urgency: lewat-tempo → hari-ini → dalam-7-hari → normal', () => {
    const tagihan = [
      makeTagihan({ id: 4, dueDay: 20 }), // normal
      makeTagihan({ id: 3, dueDay: 17 }), // dalam-7-hari
      makeTagihan({ id: 1, dueDay: 5 }), // lewat-tempo
      makeTagihan({ id: 2, dueDay: 10 }), // hari-ini
    ]
    const ranked = rankTagihan(tagihan, NOW_MS)
    expect(ranked.map((t) => t.id)).toEqual([1, 2, 3, 4])
  })

  it('empty list → empty', () => {
    expect(rankTagihan([], NOW_MS)).toEqual([])
  })
})

describe('calcUnpaidTagihanTotal', () => {
  it('sums unpaid active tagihan estimates', () => {
    const tagihan = [
      makeTagihan({ id: 1, dueDay: 5, nominalEstimate: 100_000 }), // lewat-tempo
      makeTagihan({ id: 2, dueDay: 15, nominalEstimate: 200_000 }), // dalam-7-hari
      makeTagihan({
        id: 3,
        dueDay: 20,
        nominalEstimate: 300_000,
        lastPaidAt: new Date('2024-01-02').getTime(),
      }), // paid
    ]
    expect(calcUnpaidTagihanTotal(tagihan, NOW_MS)).toBe(300_000)
  })

  it('all paid → 0', () => {
    const paid = new Date('2024-01-02').getTime()
    expect(calcUnpaidTagihanTotal([makeTagihan({ lastPaidAt: paid })], NOW_MS)).toBe(0)
  })

  it('empty → 0', () => {
    expect(calcUnpaidTagihanTotal([], NOW_MS)).toBe(0)
  })
})

describe('hasUrgentTagihan', () => {
  it('lewat-tempo → urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 5 })], NOW_MS)).toBe(true)
  })

  it('hari-ini → urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 10 })], NOW_MS)).toBe(true)
  })

  it('dalam-7-hari only → not urgent', () => {
    expect(hasUrgentTagihan([makeTagihan({ dueDay: 17 })], NOW_MS)).toBe(false)
  })

  it('empty → false', () => {
    expect(hasUrgentTagihan([], NOW_MS)).toBe(false)
  })
})

// ─── calcGoalStatuses ─────────────────────────────────────────────────────────

describe('calcGoalStatuses', () => {
  it('first goal is aktif when nabung is partial', () => {
    const goals = [makeGoal(1, 0, 1_000_000), makeGoal(2, 1, 500_000)]
    const statuses = calcGoalStatuses(goals, 300_000)
    expect(statuses[0].status).toBe('aktif')
    expect(statuses[0].saved).toBe(300_000)
    expect(statuses[1].status).toBe('antri')
    expect(statuses[1].saved).toBe(0)
  })

  it('first goal tercapai, second becomes aktif', () => {
    const goals = [makeGoal(1, 0, 500_000), makeGoal(2, 1, 1_000_000)]
    const statuses = calcGoalStatuses(goals, 600_000)
    expect(statuses[0].status).toBe('tercapai')
    expect(statuses[0].pct).toBe(100)
    expect(statuses[1].status).toBe('aktif')
    expect(statuses[1].saved).toBe(100_000)
  })

  it('no nabung → all antri except first which is aktif', () => {
    const goals = [makeGoal(1, 0, 1_000_000), makeGoal(2, 1, 500_000)]
    const statuses = calcGoalStatuses(goals, 0)
    expect(statuses[0].status).toBe('aktif')
    expect(statuses[1].status).toBe('antri')
  })

  it('empty goals → empty result', () => {
    expect(calcGoalStatuses([], 500_000)).toEqual([])
  })

  it('pct calculation', () => {
    const goals = [makeGoal(1, 0, 1_000_000)]
    expect(calcGoalStatuses(goals, 250_000)[0].pct).toBe(25)
  })
})
