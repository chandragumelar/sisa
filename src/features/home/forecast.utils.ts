import type { Settings } from '@/db/database'

export interface ForecastMonth {
  label: string // "Jun", "Jul", "Aug" — short month name
  sisa: number
}

/**
 * Project end-of-month sisa for the current cycle + 2 future months.
 *
 * Formula:
 *   month[0] = sisaPasGajian (current cycle end-projection)
 *   month[n] = month[n-1] + monthlyIncomeAvg - tagihanTotal - monthlySpendingAvg
 *
 * monthlySpendingAvg: historical 3-month average of keluar transactions.
 * Using this (not dailyBudget × days) avoids blowing up when daysUntilPayday is 1.
 */
export function calcForecast(
  sisaPasGajian: number,
  tagihanTotal: number,
  monthlySpendingAvg: number,
  monthlyIncomeAvg: number,
  settings: Settings,
  nowMs: number,
): ForecastMonth[] {
  const now = new Date(nowMs)
  const shortMonth = (date: Date) =>
    date.toLocaleString(settings.language === 'en' ? 'en-US' : 'id-ID', { month: 'short' })

  const months: ForecastMonth[] = []

  // month 0: current projection to end of this payday cycle
  months.push({ label: shortMonth(now), sisa: sisaPasGajian })

  const monthlySurplus = monthlyIncomeAvg - tagihanTotal - monthlySpendingAvg
  let prevSisa = sisaPasGajian
  for (let i = 1; i <= 2; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    prevSisa = prevSisa + monthlySurplus
    months.push({ label: shortMonth(futureDate), sisa: prevSisa })
  }

  return months
}
