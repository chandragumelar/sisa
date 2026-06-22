import type { Settings, Goal, Transaction } from '@/db/database'

// ─── Shared ───────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function applyWeekendBehavior(payday: Date, behavior: Settings['weekendBehavior']): void {
  const dow = payday.getDay()
  if (dow === 6) {
    if (behavior === 'maju-jumat') payday.setDate(payday.getDate() - 1)
    else if (behavior === 'mundur-senin') payday.setDate(payday.getDate() + 2)
  } else if (dow === 0) {
    if (behavior === 'maju-jumat') payday.setDate(payday.getDate() - 2)
    else if (behavior === 'mundur-senin') payday.setDate(payday.getDate() + 1)
  }
}

export function getPaydayDate(nowMs: number, settings: Settings): Date {
  const now = new Date(nowMs)
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  if (settings.incomeType === 'freelance') {
    return new Date(year, month + 1, 0) // last day of month; no weekend adjustment
  }

  const frequency = settings.incomeFrequency ?? 'bulanan'

  if (frequency === 'mingguan' || frequency === '2mingguan') {
    const cycle = frequency === 'mingguan' ? 7 : 14
    const anchor = settings.incomeAnchorDate ?? nowMs
    const todayStart = startOfDay(now).getTime()
    const anchorStart = startOfDay(new Date(anchor)).getTime()
    const diffDays = Math.round((todayStart - anchorStart) / DAY_MS)
    const mod = ((diffDays % cycle) + cycle) % cycle
    const daysToNext = mod === 0 ? cycle : cycle - mod
    const payday = new Date(year, month, today + daysToNext)
    applyWeekendBehavior(payday, settings.weekendBehavior)
    return payday
  }

  // Monthly
  const incomeDay = settings.incomeDay ?? 25
  let payday: Date
  if (today < incomeDay) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    payday = new Date(year, month, Math.min(incomeDay, lastDay))
  } else {
    const nm = month + 1
    const ny = nm > 11 ? year + 1 : year
    const nm12 = nm % 12
    const lastDay = new Date(ny, nm12 + 1, 0).getDate()
    payday = new Date(ny, nm12, Math.min(incomeDay, lastDay))
  }
  applyWeekendBehavior(payday, settings.weekendBehavior)
  return payday
}

export function calcDaysUntilPayday(nowMs: number, settings: Settings): number {
  const payday = getPaydayDate(nowMs, settings)
  const now = new Date(nowMs)
  const todayStart = startOfDay(now).getTime()
  return Math.max(1, Math.round((startOfDay(payday).getTime() - todayStart) / DAY_MS))
}

// ─── Period ───────────────────────────────────────────────────────────────────

/**
 * Returns the date the current pay period started (the most recent payday).
 * Weekend adjustment is intentionally skipped — this is a window boundary for
 * transaction aggregation, not a displayed payday date.
 */
export function getPeriodStartDate(nowMs: number, settings: Settings): Date {
  const now = new Date(nowMs)
  const today = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()

  if (settings.incomeType === 'freelance') {
    return new Date(year, month, 1)
  }

  const frequency = settings.incomeFrequency ?? 'bulanan'

  if (frequency === 'mingguan' || frequency === '2mingguan') {
    const cycle = frequency === 'mingguan' ? 7 : 14
    const anchor = settings.incomeAnchorDate ?? nowMs
    const nowMidnight = startOfDay(now).getTime()
    const anchorMidnight = startOfDay(new Date(anchor)).getTime()
    const diffDays = Math.round((nowMidnight - anchorMidnight) / DAY_MS)
    const daysIntoCycle = ((diffDays % cycle) + cycle) % cycle
    return new Date(nowMidnight - daysIntoCycle * DAY_MS)
  }

  // Monthly
  const incomeDay = settings.incomeDay ?? 25
  if (today >= incomeDay) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return new Date(year, month, Math.min(incomeDay, lastDay))
  }
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const lastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
  return new Date(prevYear, prevMonth, Math.min(incomeDay, lastDay))
}

/**
 * Total calendar days in the current pay period.
 * For monthly this equals (next payday − period start) in days.
 */
export function calcHariPeriode(nowMs: number, settings: Settings): number {
  if (settings.incomeType === 'freelance') {
    const now = new Date(nowMs)
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  }

  const frequency = settings.incomeFrequency ?? 'bulanan'
  if (frequency === 'mingguan') return 7
  if (frequency === '2mingguan') return 14

  const periodStart = getPeriodStartDate(nowMs, settings)
  const nextPayday = getPaydayDate(nowMs, settings)
  return Math.round((nextPayday.getTime() - periodStart.getTime()) / DAY_MS)
}

export function calcSpentToday(transactions: Transaction[], nowMs: number): number {
  const now = new Date(nowMs)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const tomorrowStart = todayStart + 86_400_000
  return transactions
    .filter((t) => t.type === 'keluar' && t.date >= todayStart && t.date < tomorrowStart)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
}

export function calcYesterdayStats(
  transactions: Transaction[],
  nowMs: number,
): { spent: number; earned: number } {
  const now = new Date(nowMs)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000

  const yesterday = transactions.filter((t) => t.date >= yesterdayStart && t.date < todayStart)
  const spent = yesterday
    .filter((t) => t.type === 'keluar')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const earned = yesterday.filter((t) => t.type === 'masuk').reduce((sum, t) => sum + t.amount, 0)
  return { spent, earned }
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalStatus = 'aktif' | 'antri' | 'tercapai'

export interface GoalWithStatus {
  goal: Goal
  saved: number
  pct: number
  status: GoalStatus
}

export function calcGoalStatuses(goals: Goal[], totalNabung: number): GoalWithStatus[] {
  let remaining = totalNabung
  let activeAssigned = false

  return goals.map((goal) => {
    const saved = Math.min(remaining, goal.target)
    remaining = Math.max(0, remaining - saved)
    const isFull = saved >= goal.target && goal.target > 0
    const isActive = !activeAssigned && !isFull
    if (isActive) activeAssigned = true
    const pct = goal.target > 0 ? Math.min(100, Math.round((saved / goal.target) * 100)) : 0
    const status: GoalStatus = isFull ? 'tercapai' : isActive ? 'aktif' : 'antri'
    return { goal, saved, pct, status }
  })
}
