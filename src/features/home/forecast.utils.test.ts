import { describe, it, expect } from 'vitest'
import { calcForecast } from './forecast.utils'
import type { Settings } from '@/db/database'

const baseSettings: Settings = {
  id: 1,
  language: 'id',
  theme: 'light',
  incomeType: 'tetap',
  incomeDay: 25,
  freelanceMinBalance: null,
  primaryCurrency: 'IDR',
  secondaryCurrency: null,
  activeCurrencyMode: 'IDR',
  weekendBehavior: null,
  onboardingCompleted: true,
  lastExportedAt: null,
}

// 2026-05-10 → steady mid-month
const NOW = new Date('2026-05-10').getTime()

describe('calcForecast', () => {
  it('returns 3 months', () => {
    const result = calcForecast(1_000_000, 500_000, 2_000_000, 3_000_000, baseSettings, NOW)
    expect(result).toHaveLength(3)
  })

  it('month 0 equals sisaPasGajian', () => {
    const result = calcForecast(1_000_000, 500_000, 2_000_000, 3_000_000, baseSettings, NOW)
    expect(result[0].sisa).toBe(1_000_000)
  })

  it('month 1+ reflects income surplus correctly', () => {
    // income 3M, tagihan 500K, spending 2M → surplus 500K/month
    const result = calcForecast(1_000_000, 500_000, 2_000_000, 3_000_000, baseSettings, NOW)
    expect(result[1].sisa).toBe(1_500_000)
    expect(result[2].sisa).toBe(2_000_000)
  })

  it('shows negative when income is insufficient', () => {
    // income 100K, tagihan 500K, spending 2M → big deficit
    const result = calcForecast(500_000, 500_000, 2_000_000, 100_000, baseSettings, NOW)
    expect(result[1].sisa).toBeLessThan(result[0].sisa)
  })

  it('zero history → all months equal sisaPasGajian (flat projection)', () => {
    // monthlySpendingAvg=0, monthlyIncomeAvg=0, tagihanTotal=0 → surplus=0
    const result = calcForecast(5_000_000, 0, 0, 0, baseSettings, NOW)
    expect(result[0].sisa).toBe(5_000_000)
    expect(result[1].sisa).toBe(5_000_000)
    expect(result[2].sisa).toBe(5_000_000)
  })

  it('payday-eve edge: large dailyBudget does NOT affect future-month projection', () => {
    // Scenario: 10jt wallet, payday tomorrow (dailyBudget would be 10M/day in old code)
    // With new formula, monthlySpendingAvg drives future months, not dailyBudget
    const sisaPasGajian = 0 // balance consumed by current cycle
    const monthlySpendingAvg = 2_000_000 // historical avg
    const monthlyIncomeAvg = 3_000_000
    const result = calcForecast(
      sisaPasGajian,
      0,
      monthlySpendingAvg,
      monthlyIncomeAvg,
      baseSettings,
      NOW,
    )
    // month1 = 0 + (3M - 0 - 2M) = 1M — not -300M
    expect(result[1].sisa).toBe(1_000_000)
    expect(result[2].sisa).toBe(2_000_000)
  })

  it('month labels are non-empty strings', () => {
    const result = calcForecast(0, 0, 0, 0, baseSettings, NOW)
    result.forEach((m) => expect(m.label.length).toBeGreaterThan(0))
  })
})
