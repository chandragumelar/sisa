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
    const result = calcForecast(1_000_000, 500_000, 30_000, 3_000_000, baseSettings, NOW)
    expect(result).toHaveLength(3)
  })

  it('month 0 equals sisaPasGajian', () => {
    const result = calcForecast(1_000_000, 500_000, 30_000, 3_000_000, baseSettings, NOW)
    expect(result[0].sisa).toBe(1_000_000)
  })

  it('month 1+ reflects income surplus correctly', () => {
    // income 3M, tagihan 500K, daily 30K × ~31 days = 930K → surplus ≈ 1.57M
    const result = calcForecast(1_000_000, 500_000, 30_000, 3_000_000, baseSettings, NOW)
    const month1 = result[1].sisa
    expect(month1).toBeGreaterThan(result[0].sisa) // positive surplus
  })

  it('shows negative when income is insufficient', () => {
    // income 100K, tagihan 500K, daily 30K × 31 = 930K → big deficit
    const result = calcForecast(500_000, 500_000, 30_000, 100_000, baseSettings, NOW)
    expect(result[1].sisa).toBeLessThan(result[0].sisa)
  })

  it('month labels are non-empty strings', () => {
    const result = calcForecast(0, 0, 0, 0, baseSettings, NOW)
    result.forEach((m) => expect(m.label.length).toBeGreaterThan(0))
  })
})
