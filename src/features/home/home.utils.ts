import type { Settings, Goal, Transaction } from '@/db/database'

// ─── Payday ──────────────────────────────────────────────────────────────────

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

// ─── Budget ───────────────────────────────────────────────────────────────────

export function calcDailyBudget(
  totalSaldo: number,
  unpaidTagihanTotal: number,
  totalNabung: number,
  daysUntilPayday: number,
): number {
  const available = totalSaldo - unpaidTagihanTotal - totalNabung
  if (available <= 0 || daysUntilPayday <= 0) return 0
  return available / daysUntilPayday
}

export function getDaysUntilEndOfWeek(nowMs: number): number {
  const dow = new Date(nowMs).getDay() // 0=Sun; week = Mon–Sun
  return dow === 0 ? 1 : 8 - dow
}

export function calcWeeklyBudget(
  dailyBudget: number,
  daysUntilWeekEnd: number,
  daysUntilPayday: number,
): number {
  return dailyBudget * Math.min(daysUntilWeekEnd, daysUntilPayday)
}

export function calcSisaPasGajian(
  totalSaldo: number,
  dailyBudget: number,
  daysUntilPayday: number,
  unpaidTagihanTotal: number,
): number {
  return totalSaldo - dailyBudget * daysUntilPayday - unpaidTagihanTotal
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
