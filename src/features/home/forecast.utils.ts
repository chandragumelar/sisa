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
 *   month[n] = month[n-1] + monthlyIncome - tagihanTotal - dailyBudget × daysInMonth(n)
 *
 * monthlyIncome is derived from past transactions; 0 if no history.
 */
export function calcForecast(
  sisaPasGajian: number,
  tagihanTotal: number,
  dailyBudget: number,
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

  let prevSisa = sisaPasGajian
  for (let i = 1; i <= 2; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const daysInFutureMonth = new Date(
      futureDate.getFullYear(),
      futureDate.getMonth() + 1,
      0,
    ).getDate()
    const monthlySurplus = monthlyIncomeAvg - tagihanTotal - dailyBudget * daysInFutureMonth
    prevSisa = prevSisa + monthlySurplus
    months.push({ label: shortMonth(futureDate), sisa: prevSisa })
  }

  return months
}
