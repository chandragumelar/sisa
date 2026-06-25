import { describe, it, expect } from 'vitest'
import type { Settings, Transaction, Allocation } from '@/db/database'
import {
  calcDaysUntilPayday,
  getPaydayDate,
  getPeriodStartDate,
  calcHariPeriode,
  calcSpentToday,
  calcYesterdayStats,
  needsPaydayConfirmation,
  isHariPertamaMode,
  calcPemasukanFromAvg,
} from './home.utils'

const DAY_MS = 86_400_000

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Wed 2024-01-10 12:00:00 UTC → JS: getDate()=10, getDay()=3 (Wednesday)
const NOW_MS = new Date('2024-01-10T12:00:00Z').getTime()

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: 1,
    language: 'id',
    theme: 'system',
    incomeType: 'tetap',
    incomeFrequency: 'bulanan',
    incomeAnchorDate: null,
    incomeDay: 25,
    freelanceMinBalance: null,
    avgIncome: null,
    avgIncomeBasis: null,
    lastPaydayConfirmed: null,
    fixedIncome: null,
    primaryCurrency: 'IDR',
    weekendBehavior: null,
    onboardingCompleted: true,
    lastExportedAt: null,
    ...overrides,
  }
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

  it('tetap — payday is today → rolls to next month', () => {
    // Jan 10, incomeDay=10 → today IS payday → next cycle is Feb 10 → 31 days
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeDay: 10 }))).toBe(31)
  })

  it('tetap — one day before payday', () => {
    const dayBefore = new Date('2024-01-09T12:00:00Z').getTime() // Jan 9
    expect(calcDaysUntilPayday(dayBefore, makeSettings({ incomeDay: 10 }))).toBe(1)
  })

  it('freelance — returns remaining days in month', () => {
    // Jan 10 → 31 - 10 = 21 days remaining
    const days = calcDaysUntilPayday(NOW_MS, makeSettings({ incomeType: 'freelance' }))
    expect(days).toBe(21)
  })

  it('mix — behaves like tetap', () => {
    expect(calcDaysUntilPayday(NOW_MS, makeSettings({ incomeType: 'mix', incomeDay: 25 }))).toBe(15)
  })

  // Thu 2024-01-18, incomeDay=20 → payday is Jan 20 (Saturday)
  it('weekend — maju-jumat shifts Saturday payday to Friday', () => {
    const thuNow = new Date('2024-01-18T12:00:00Z').getTime() // Thursday Jan 18
    // payday = Jan 20 (Sat) → maju-jumat → Jan 19 (Fri) → 1 day away
    const days = calcDaysUntilPayday(
      thuNow,
      makeSettings({ incomeDay: 20, weekendBehavior: 'maju-jumat' }),
    )
    expect(days).toBe(1)
  })

  it('weekend — mundur-senin shifts Saturday payday to Monday', () => {
    const thuNow = new Date('2024-01-18T12:00:00Z').getTime() // Thursday Jan 18
    // payday = Jan 20 (Sat) → mundur-senin → Jan 22 (Mon) → 4 days away
    const days = calcDaysUntilPayday(
      thuNow,
      makeSettings({ incomeDay: 20, weekendBehavior: 'mundur-senin' }),
    )
    expect(days).toBe(4)
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

// ─── calcDaysUntilPayday — mingguan ───────────────────────────────────────────

describe('calcDaysUntilPayday — mingguan', () => {
  // NOW = Jan 10 (Wed). anchor = Jan 7 (Sun) → diffDays=3, mod=3, daysToNext=4 → payday Jan 14
  const anchor7 = new Date('2024-01-07T12:00:00Z').getTime()

  it('anchor 3 days ago → 4 days to next payday', () => {
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: anchor7 }),
      ),
    ).toBe(4)
  })

  it('today is exactly the cycle day (mod=0) → jumps full cycle (7 days)', () => {
    // anchor = Jan 10 = today → mod=0 → daysToNext=7 → payday Jan 17
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: NOW_MS }),
      ),
    ).toBe(7)
  })

  it('anchor in the future → payday is anchor day itself', () => {
    // anchor = Jan 13 (Sat), today = Jan 10 (Wed)
    // diffDays = -3, mod = ((-3%7)+7)%7 = 4, daysToNext = 7-4 = 3 → payday Jan 13
    const anchor13 = new Date('2024-01-13T12:00:00Z').getTime()
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: anchor13 }),
      ),
    ).toBe(3)
  })

  it('weekend behavior applies to weekly payday', () => {
    // anchor=Jan 7 (Sun), payday=Jan 14 (Sun) → maju-jumat → Jan 12 (Fri) → 2 days
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({
          incomeFrequency: 'mingguan',
          incomeAnchorDate: anchor7,
          weekendBehavior: 'maju-jumat',
        }),
      ),
    ).toBe(2)
  })
})

// ─── calcDaysUntilPayday — 2mingguan ──────────────────────────────────────────

describe('calcDaysUntilPayday — 2mingguan', () => {
  // NOW = Jan 10 (Wed). anchor+N means today is N days after anchor.

  it('anchor+0 (today=cycle day) → 14 (full cycle, not 0)', () => {
    // anchor=Jan 10, diffDays=0, mod=0 → daysToNext=14
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: NOW_MS }),
      ),
    ).toBe(14)
  })

  it('anchor+5 → 9 days', () => {
    // anchor=Jan 5, diffDays=5, mod=5, daysToNext=9
    const anchor = new Date('2024-01-05T12:00:00Z').getTime()
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor }),
      ),
    ).toBe(9)
  })

  it('anchor+13 → 1 day', () => {
    // anchor=Dec 28 2023, diffDays=13, mod=13, daysToNext=1
    const anchor = new Date('2023-12-28T12:00:00Z').getTime()
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor }),
      ),
    ).toBe(1)
  })

  it('anchor+14 → 14 (full cycle again, not 0)', () => {
    // anchor=Dec 27 2023, diffDays=14, mod=14%14=0 → daysToNext=14
    const anchor = new Date('2023-12-27T12:00:00Z').getTime()
    expect(
      calcDaysUntilPayday(
        NOW_MS,
        makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor }),
      ),
    ).toBe(14)
  })
})

// ─── getPaydayDate + calcDaysUntilPayday consistency ──────────────────────────

describe('getPaydayDate + calcDaysUntilPayday consistency', () => {
  it('monthly + weekend: both agree on adjusted date', () => {
    // Jan 18 (Thu), incomeDay=20 → Jan 20 (Sat) → maju-jumat → Jan 19 (Fri)
    const thuNow = new Date('2024-01-18T12:00:00Z').getTime()
    const settings = makeSettings({ incomeDay: 20, weekendBehavior: 'maju-jumat' })
    const payday = getPaydayDate(thuNow, settings)
    const days = calcDaysUntilPayday(thuNow, settings)
    expect(payday.getDate()).toBe(19)
    expect(days).toBe(1)
  })

  it('weekly: getPaydayDate and calcDaysUntilPayday agree', () => {
    const anchor = new Date('2024-01-07T12:00:00Z').getTime()
    const settings = makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: anchor })
    const payday = getPaydayDate(NOW_MS, settings)
    const days = calcDaysUntilPayday(NOW_MS, settings)
    const todayStart = new Date(2024, 0, 10).getTime()
    const paydayStart = new Date(
      payday.getFullYear(),
      payday.getMonth(),
      payday.getDate(),
    ).getTime()
    expect(Math.max(1, Math.round((paydayStart - todayStart) / DAY_MS))).toBe(days)
  })

  it('biweekly: getPaydayDate and calcDaysUntilPayday agree', () => {
    const anchor = new Date('2024-01-05T12:00:00Z').getTime()
    const settings = makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor })
    const payday = getPaydayDate(NOW_MS, settings)
    const days = calcDaysUntilPayday(NOW_MS, settings)
    const todayStart = new Date(2024, 0, 10).getTime()
    const paydayStart = new Date(
      payday.getFullYear(),
      payday.getMonth(),
      payday.getDate(),
    ).getTime()
    expect(Math.max(1, Math.round((paydayStart - todayStart) / DAY_MS))).toBe(days)
  })
})

// ─── getPeriodStartDate ───────────────────────────────────────────────────────

describe('getPeriodStartDate', () => {
  // NOW_MS = Jan 10 2024 (Wednesday)

  it('freelance → 1st of current month', () => {
    const d = getPeriodStartDate(NOW_MS, makeSettings({ incomeType: 'freelance' }))
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(0) // January
    expect(d.getDate()).toBe(1)
  })

  it('monthly tetap, today < incomeDay → last month incomeDay', () => {
    // today=10, incomeDay=25 → period started Dec 25
    const d = getPeriodStartDate(NOW_MS, makeSettings({ incomeDay: 25 }))
    expect(d.getFullYear()).toBe(2023)
    expect(d.getMonth()).toBe(11) // December
    expect(d.getDate()).toBe(25)
  })

  it('monthly tetap, today >= incomeDay → this month incomeDay', () => {
    // today=10, incomeDay=5 → period started Jan 5
    const d = getPeriodStartDate(NOW_MS, makeSettings({ incomeDay: 5 }))
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(5)
  })

  it('monthly tetap, today === incomeDay → today is period start', () => {
    // today=10, incomeDay=10 → period started Jan 10 (today)
    const d = getPeriodStartDate(NOW_MS, makeSettings({ incomeDay: 10 }))
    expect(d.getDate()).toBe(10)
    expect(d.getMonth()).toBe(0)
  })

  it('weekly, 3 days into cycle → start is 3 days ago', () => {
    // anchor=Jan 7 (Sun), today=Jan 10 → diffDays=3, daysIntoCycle=3 → start=Jan 7
    const anchor = new Date('2024-01-07T12:00:00Z').getTime()
    const d = getPeriodStartDate(
      NOW_MS,
      makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: anchor }),
    )
    expect(d.getDate()).toBe(7)
  })

  it('biweekly, 5 days into cycle → start is 5 days ago', () => {
    // anchor=Jan 5, today=Jan 10 → diffDays=5, daysIntoCycle=5 → start=Jan 5
    const anchor = new Date('2024-01-05T12:00:00Z').getTime()
    const d = getPeriodStartDate(
      NOW_MS,
      makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor }),
    )
    expect(d.getDate()).toBe(5)
  })
})

// ─── getPeriodStartDate — lastPaydayConfirmed override ────────────────────────

describe('getPeriodStartDate — lastPaydayConfirmed', () => {
  it('lastPaydayConfirmed within current calendar period → used as period start', () => {
    // today=Jan 10, incomeDay=25 → calendarPeriodStart=Dec 25
    // lastPaydayConfirmed=Jan 5 → Jan 5 >= Dec 25 → use Jan 5
    const confirmedMs = new Date('2024-01-05T12:00:00Z').getTime()
    const d = getPeriodStartDate(
      NOW_MS,
      makeSettings({ incomeDay: 25, lastPaydayConfirmed: confirmedMs }),
    )
    expect(d.getDate()).toBe(5)
    expect(d.getMonth()).toBe(0)
    expect(d.getFullYear()).toBe(2024)
  })

  it('lastPaydayConfirmed from previous calendar period → falls back to calendar start', () => {
    // today=Jan 10, incomeDay=25 → calendarPeriodStart=Dec 25
    // lastPaydayConfirmed=Dec 1 → Dec 1 < Dec 25 → ignore, use Dec 25
    const oldConfirm = new Date('2023-12-01T12:00:00Z').getTime()
    const d = getPeriodStartDate(
      NOW_MS,
      makeSettings({ incomeDay: 25, lastPaydayConfirmed: oldConfirm }),
    )
    expect(d.getDate()).toBe(25)
    expect(d.getMonth()).toBe(11) // December
  })

  it('lastPaydayConfirmed = null → uses calendar period start', () => {
    const d = getPeriodStartDate(NOW_MS, makeSettings({ incomeDay: 25, lastPaydayConfirmed: null }))
    expect(d.getDate()).toBe(25)
    expect(d.getMonth()).toBe(11) // December
  })
})

// ─── needsPaydayConfirmation ──────────────────────────────────────────────────

describe('needsPaydayConfirmation', () => {
  // NOW_MS = Jan 10 2024, incomeDay=25 → calendarPeriodStart = Dec 25

  it('tetap with no confirmed payday this period → true', () => {
    expect(
      needsPaydayConfirmation(
        NOW_MS,
        makeSettings({ incomeType: 'tetap', lastPaydayConfirmed: null }),
      ),
    ).toBe(true)
  })

  it('tetap with old confirmation (prev period) → true', () => {
    const oldConfirm = new Date('2023-12-01T12:00:00Z').getTime()
    expect(
      needsPaydayConfirmation(
        NOW_MS,
        makeSettings({ incomeType: 'tetap', lastPaydayConfirmed: oldConfirm }),
      ),
    ).toBe(true)
  })

  it('tetap with confirmation this period → false', () => {
    const confirmedMs = new Date('2024-01-05T12:00:00Z').getTime()
    expect(
      needsPaydayConfirmation(
        NOW_MS,
        makeSettings({ incomeType: 'tetap', lastPaydayConfirmed: confirmedMs }),
      ),
    ).toBe(false)
  })

  it('mix same as tetap — no confirmation → true', () => {
    expect(
      needsPaydayConfirmation(
        NOW_MS,
        makeSettings({ incomeType: 'mix', lastPaydayConfirmed: null }),
      ),
    ).toBe(true)
  })

  it('freelance → always false (no payday to confirm)', () => {
    expect(
      needsPaydayConfirmation(
        NOW_MS,
        makeSettings({ incomeType: 'freelance', lastPaydayConfirmed: null }),
      ),
    ).toBe(false)
  })
})

// ─── isHariPertamaMode ────────────────────────────────────────────────────────

describe('isHariPertamaMode', () => {
  it('lastPaydayConfirmed=null and income=0 → true', () => {
    expect(isHariPertamaMode(null, 0)).toBe(true)
  })

  it('lastPaydayConfirmed=null but income>0 → false', () => {
    expect(isHariPertamaMode(null, 100_000)).toBe(false)
  })

  it('lastPaydayConfirmed set and income=0 → false', () => {
    expect(isHariPertamaMode(NOW_MS, 0)).toBe(false)
  })

  it('lastPaydayConfirmed set and income>0 → false', () => {
    expect(isHariPertamaMode(NOW_MS, 500_000)).toBe(false)
  })
})

// ─── calcPemasukanFromAvg ─────────────────────────────────────────────────────

describe('calcPemasukanFromAvg', () => {
  it('bulanan 30-day basis, 15 hari period → half', () => {
    // avg=3_000_000/month, hariPeriode=15 → 3_000_000/30*15 = 1_500_000
    expect(calcPemasukanFromAvg(3_000_000, 'bulanan', 15)).toBe(1_500_000)
  })

  it('mingguan 7-day basis, 7 hari period → exact avg', () => {
    expect(calcPemasukanFromAvg(700_000, 'mingguan', 7)).toBe(700_000)
  })

  it('2mingguan 14-day basis, 14 hari period → exact avg', () => {
    expect(calcPemasukanFromAvg(1_400_000, '2mingguan', 14)).toBe(1_400_000)
  })

  it('bulanan, full 31-day period → slightly over avg', () => {
    // 3_000_000/30*31 = 3_100_000
    expect(calcPemasukanFromAvg(3_000_000, 'bulanan', 31)).toBeCloseTo(3_100_000)
  })

  it('zero avgIncome → 0', () => {
    expect(calcPemasukanFromAvg(0, 'bulanan', 30)).toBe(0)
  })
})

// ─── calcHariPeriode ──────────────────────────────────────────────────────────

describe('calcHariPeriode', () => {
  it('freelance January → 31', () => {
    expect(calcHariPeriode(NOW_MS, makeSettings({ incomeType: 'freelance' }))).toBe(31)
  })

  it('freelance February 2024 (leap year) → 29', () => {
    const febMs = new Date('2024-02-10T12:00:00Z').getTime()
    expect(calcHariPeriode(febMs, makeSettings({ incomeType: 'freelance' }))).toBe(29)
  })

  it('freelance February 2025 (non-leap) → 28', () => {
    const febMs = new Date('2025-02-10T12:00:00Z').getTime()
    expect(calcHariPeriode(febMs, makeSettings({ incomeType: 'freelance' }))).toBe(28)
  })

  it('weekly → always 7', () => {
    const anchor = new Date('2024-01-07T12:00:00Z').getTime()
    expect(
      calcHariPeriode(
        NOW_MS,
        makeSettings({ incomeFrequency: 'mingguan', incomeAnchorDate: anchor }),
      ),
    ).toBe(7)
  })

  it('biweekly → always 14', () => {
    const anchor = new Date('2024-01-05T12:00:00Z').getTime()
    expect(
      calcHariPeriode(
        NOW_MS,
        makeSettings({ incomeFrequency: '2mingguan', incomeAnchorDate: anchor }),
      ),
    ).toBe(14)
  })

  it('monthly tetap, incomeDay=25, today=Jan 10 → periodStart=Dec 25, nextPayday=Jan 25 → 31 days', () => {
    // Dec 25 to Jan 25 = 31 days
    expect(calcHariPeriode(NOW_MS, makeSettings({ incomeDay: 25 }))).toBe(31)
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

// ─── needsPaydayConfirmation with allocation ──────────────────────────────────

describe('needsPaydayConfirmation with allocation', () => {
  const NOW = NOW_MS
  const baseFreelance = makeSettings({ incomeType: 'freelance', lastPaydayConfirmed: null })

  it('freelance: false when allocation is null', () => {
    expect(needsPaydayConfirmation(NOW, baseFreelance, null)).toBe(false)
  })

  it('freelance: false when now < periodEndDate', () => {
    const alloc: import('@/db/database').Allocation = {
      id: 1,
      jatahHarian: 100_000,
      daysAtLock: 10,
      lockedAt: 0,
      periodEndDate: NOW + 86_400_000,
    }
    expect(needsPaydayConfirmation(NOW, baseFreelance, alloc)).toBe(false)
  })

  it('freelance: true when now > periodEndDate', () => {
    const alloc: import('@/db/database').Allocation = {
      id: 1,
      jatahHarian: 100_000,
      daysAtLock: 10,
      lockedAt: 0,
      periodEndDate: NOW - 1,
    }
    expect(needsPaydayConfirmation(NOW, baseFreelance, alloc)).toBe(true)
  })

  it('mix: follows getPaydayDate cycle, not periodEndDate', () => {
    const mix = makeSettings({ incomeType: 'mix', incomeDay: 25, lastPaydayConfirmed: NOW })
    const alloc: import('@/db/database').Allocation = {
      id: 1,
      jatahHarian: 100_000,
      daysAtLock: 10,
      lockedAt: 0,
      periodEndDate: NOW - 1,
    }
    expect(needsPaydayConfirmation(NOW, mix, alloc)).toBe(false)
  })
})

// ─── getPaydayDate / calcDaysUntilPayday — freelance allocation ───────────────

function makeAlloc(periodEndDate: number): Allocation {
  return { id: 1, jatahHarian: 100_000, daysAtLock: 10, lockedAt: 0, periodEndDate }
}

describe('getPaydayDate — freelance with allocation', () => {
  // NOW_MS = Jan 10 2024 12:00 UTC. periodEndDate = Jan 20 2024 12:00 UTC (10 days ahead).
  const PERIOD_END_MS = new Date('2024-01-20T12:00:00Z').getTime()
  const freelance = makeSettings({ incomeType: 'freelance' })

  it('returns allocation.periodEndDate as Date when set', () => {
    const result = getPaydayDate(NOW_MS, freelance, makeAlloc(PERIOD_END_MS))
    expect(result.getTime()).toBe(PERIOD_END_MS)
  })

  it('fallback to end-of-month when allocation is null', () => {
    // Jan 2024 has 31 days → fallback payday = Jan 31
    const result = getPaydayDate(NOW_MS, freelance, null)
    expect(result.getDate()).toBe(31)
    expect(result.getMonth()).toBe(0) // January
  })

  it('fallback to end-of-month when allocation has periodEndDate null', () => {
    const noEnd: Allocation = {
      id: 1,
      jatahHarian: 0,
      daysAtLock: 0,
      lockedAt: 0,
      periodEndDate: null,
    }
    const result = getPaydayDate(NOW_MS, freelance, noEnd)
    expect(result.getDate()).toBe(31)
  })

  it('fallback to end-of-month when no allocation arg (regression guard)', () => {
    const result = getPaydayDate(NOW_MS, freelance)
    expect(result.getDate()).toBe(31)
  })
})

describe('calcDaysUntilPayday — freelance with allocation', () => {
  // NOW_MS = Jan 10 12:00 UTC. Period end = Jan 20 12:00 UTC → 10 calendar days.
  const PERIOD_END_MS = new Date('2024-01-20T12:00:00Z').getTime()
  const freelance = makeSettings({ incomeType: 'freelance' })

  it('returns days to periodEndDate when allocation set', () => {
    const days = calcDaysUntilPayday(NOW_MS, freelance, makeAlloc(PERIOD_END_MS))
    expect(days).toBe(10)
  })

  it('consistent: equals round((periodEndDate_dayStart - today_dayStart) / DAY_MS)', () => {
    const alloc = makeAlloc(PERIOD_END_MS)
    const days = calcDaysUntilPayday(NOW_MS, freelance, alloc)
    const todayStart = new Date(
      new Date(NOW_MS).getFullYear(),
      new Date(NOW_MS).getMonth(),
      new Date(NOW_MS).getDate(),
    ).getTime()
    const endStart = new Date(
      new Date(PERIOD_END_MS).getFullYear(),
      new Date(PERIOD_END_MS).getMonth(),
      new Date(PERIOD_END_MS).getDate(),
    ).getTime()
    expect(days).toBe(Math.max(1, Math.round((endStart - todayStart) / DAY_MS)))
  })

  it('fallback to end-of-month (21 days) when no allocation', () => {
    // Jan 10 → Jan 31 = 21 days
    const days = calcDaysUntilPayday(NOW_MS, freelance, null)
    expect(days).toBe(21)
  })
})

describe('getPaydayDate / calcDaysUntilPayday — tetap/mix ignore allocation', () => {
  // Regression guard: passing allocation to tetap/mix must not change output.
  const alloc = makeAlloc(new Date('2024-01-15T12:00:00Z').getTime()) // mid-month period end

  it('tetap: getPaydayDate ignores allocation', () => {
    const tetap = makeSettings({ incomeType: 'tetap', incomeDay: 25 })
    expect(getPaydayDate(NOW_MS, tetap, alloc).getTime()).toBe(
      getPaydayDate(NOW_MS, tetap).getTime(),
    )
  })

  it('tetap: calcDaysUntilPayday ignores allocation', () => {
    const tetap = makeSettings({ incomeType: 'tetap', incomeDay: 25 })
    expect(calcDaysUntilPayday(NOW_MS, tetap, alloc)).toBe(calcDaysUntilPayday(NOW_MS, tetap))
  })

  it('mix: getPaydayDate ignores allocation', () => {
    const mix = makeSettings({ incomeType: 'mix', incomeDay: 25 })
    expect(getPaydayDate(NOW_MS, mix, alloc).getTime()).toBe(getPaydayDate(NOW_MS, mix).getTime())
  })

  it('mix: calcDaysUntilPayday ignores allocation', () => {
    const mix = makeSettings({ incomeType: 'mix', incomeDay: 25 })
    expect(calcDaysUntilPayday(NOW_MS, mix, alloc)).toBe(calcDaysUntilPayday(NOW_MS, mix))
  })
})
