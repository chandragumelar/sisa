import type { Settings, Tagihan, Goal, Transaction } from '@/db/database'

// ─── Payday ──────────────────────────────────────────────────────────────────

export function calcDaysUntilPayday(nowMs: number, settings: Settings): number {
  const now = new Date(nowMs)
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  if (settings.incomeType === 'freelance') {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
    return Math.max(1, lastDayOfMonth - today)
  }

  const incomeDay = settings.incomeDay ?? 25

  let payday: Date
  if (today <= incomeDay) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    payday = new Date(year, month, Math.min(incomeDay, lastDay))
  } else {
    const nm = month + 1
    const ny = nm > 11 ? year + 1 : year
    const nm12 = nm % 12
    const lastDay = new Date(ny, nm12 + 1, 0).getDate()
    payday = new Date(ny, nm12, Math.min(incomeDay, lastDay))
  }

  const dow = payday.getDay()
  if (dow === 6) {
    // Saturday
    if (settings.weekendBehavior === 'maju-jumat') payday.setDate(payday.getDate() - 1)
    else if (settings.weekendBehavior === 'mundur-senin') payday.setDate(payday.getDate() + 2)
  } else if (dow === 0) {
    // Sunday
    if (settings.weekendBehavior === 'maju-jumat') payday.setDate(payday.getDate() - 2)
    else if (settings.weekendBehavior === 'mundur-senin') payday.setDate(payday.getDate() + 1)
  }

  const todayStart = new Date(year, month, today).getTime()
  const diff = Math.round((payday.getTime() - todayStart) / 86_400_000)
  return Math.max(1, diff)
}

export function getPaydayDate(nowMs: number, settings: Settings): Date {
  const now = new Date(nowMs)
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const incomeDay = settings.incomeDay ?? 25

  if (settings.incomeType === 'freelance') {
    return new Date(year, month + 1, 0) // last day of month
  }

  if (today <= incomeDay) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return new Date(year, month, Math.min(incomeDay, lastDay))
  }

  const nm = month + 1
  const ny = nm > 11 ? year + 1 : year
  const nm12 = nm % 12
  const lastDay = new Date(ny, nm12 + 1, 0).getDate()
  return new Date(ny, nm12, Math.min(incomeDay, lastDay))
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
  const dow = new Date(nowMs).getDay() // 0=Sun
  return dow === 0 ? 7 : 7 - dow
}

export function calcWeeklyBudget(dailyBudget: number, daysUntilWeekEnd: number): number {
  return dailyBudget * daysUntilWeekEnd
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

// ─── Tagihan ─────────────────────────────────────────────────────────────────

export type TagihanUrgency = 'lewat-tempo' | 'hari-ini' | 'dalam-7-hari' | 'normal'

export function isTagihanPaidThisPeriod(tagihan: Tagihan, nowMs: number): boolean {
  if (tagihan.lastPaidAt === null) return false
  const paid = new Date(tagihan.lastPaidAt)
  const now = new Date(nowMs)
  return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()
}

export function getTagihanUrgency(tagihan: Tagihan, nowMs: number): TagihanUrgency {
  if (isTagihanPaidThisPeriod(tagihan, nowMs)) return 'normal'
  const today = new Date(nowMs).getDate()
  const due = tagihan.dueDay
  if (today > due) return 'lewat-tempo'
  if (today === due) return 'hari-ini'
  if (due - today <= 7) return 'dalam-7-hari'
  return 'normal'
}

const URGENCY_ORDER: Record<TagihanUrgency, number> = {
  'lewat-tempo': 0,
  'hari-ini': 1,
  'dalam-7-hari': 2,
  normal: 3,
}

export function rankTagihan(tagihan: Tagihan[], nowMs: number): Tagihan[] {
  return [...tagihan].sort((a, b) => {
    const ua = URGENCY_ORDER[getTagihanUrgency(a, nowMs)]
    const ub = URGENCY_ORDER[getTagihanUrgency(b, nowMs)]
    if (ua !== ub) return ua - ub
    return a.dueDay - b.dueDay
  })
}

export function calcUnpaidTagihanTotal(tagihan: Tagihan[], nowMs: number): number {
  return tagihan
    .filter((t) => t.isActive && !isTagihanPaidThisPeriod(t, nowMs))
    .reduce((sum, t) => sum + t.nominalEstimate, 0)
}

export function hasUrgentTagihan(tagihan: Tagihan[], nowMs: number): boolean {
  return tagihan.some((t) => {
    const u = getTagihanUrgency(t, nowMs)
    return u === 'lewat-tempo' || u === 'hari-ini'
  })
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
