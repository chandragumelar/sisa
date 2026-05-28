import type { Tagihan, TagihanFrequency } from '@/db/database'

export type TagihanUrgency = 'lewat-tempo' | 'hari-ini' | 'dalam-7-hari' | 'normal'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clampDay(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function startOfDayMs(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function getMonthlyOccurrences(
  dueDay: number,
  intervalMonths: number,
  anchor: Date,
  windowStartMs: number,
  windowEndMs: number,
): Date[] {
  const results: Date[] = []
  const anchorIdx = anchor.getFullYear() * 12 + anchor.getMonth()
  const startDate = new Date(windowStartMs)
  const endDate = new Date(windowEndMs)
  const startIdx = startDate.getFullYear() * 12 + startDate.getMonth()
  const endIdx = endDate.getFullYear() * 12 + endDate.getMonth()

  for (let idx = startIdx; idx <= endIdx; idx++) {
    // JS remainder preserves sign, so negative offsets that are multiples still pass
    if ((idx - anchorIdx) % intervalMonths !== 0) continue
    const year = Math.floor(idx / 12)
    const month = idx % 12
    const d = clampDay(year, month, dueDay)
    if (d.getTime() >= windowStartMs && d.getTime() < windowEndMs) {
      results.push(d)
    }
  }
  return results
}

function getWeeklyOccurrences(
  anchorMs: number,
  intervalDays: number,
  windowStartMs: number,
  windowEndMs: number,
): Date[] {
  const results: Date[] = []
  const anchorMidnight = startOfDayMs(new Date(anchorMs))
  if (anchorMidnight >= windowEndMs) return []

  const intervalMs = intervalDays * 86_400_000
  const effectiveStart = Math.max(anchorMidnight, windowStartMs)
  const diffFromAnchor = effectiveStart - anchorMidnight
  const periods = Math.floor(diffFromAnchor / intervalMs)
  let current = anchorMidnight + periods * intervalMs

  while (current < effectiveStart) current += intervalMs

  while (current < windowEndMs) {
    results.push(new Date(current))
    current += intervalMs
  }
  return results
}

const FREQ_INTERVAL_MONTHS: Partial<Record<TagihanFrequency, number>> = {
  bulanan: 1,
  '2bulanan': 2,
  '3bulanan': 3,
  tahunan: 12,
}

export function getOccurrencesInWindow(
  tagihan: Tagihan,
  windowStartMs: number,
  windowEndMs: number,
): Date[] {
  const anchor = new Date(tagihan.anchorDate)

  if (tagihan.frequency === 'sekali') {
    const d = clampDay(anchor.getFullYear(), anchor.getMonth(), tagihan.dueDay)
    return d.getTime() >= windowStartMs && d.getTime() < windowEndMs ? [d] : []
  }

  if (tagihan.frequency === 'mingguan') {
    return getWeeklyOccurrences(tagihan.anchorDate, 7, windowStartMs, windowEndMs)
  }

  if (tagihan.frequency === '2mingguan') {
    return getWeeklyOccurrences(tagihan.anchorDate, 14, windowStartMs, windowEndMs)
  }

  const intervalMonths = FREQ_INTERVAL_MONTHS[tagihan.frequency]
  if (intervalMonths == null) return []
  return getMonthlyOccurrences(tagihan.dueDay, intervalMonths, anchor, windowStartMs, windowEndMs)
}

export function isOccurrencePaid(tagihan: Tagihan, occurrenceMs: number): boolean {
  return tagihan.lastPaidAt !== null && tagihan.lastPaidAt >= occurrenceMs
}

// ---------------------------------------------------------------------------
// Next occurrence — earliest unpaid past (overdue) or earliest upcoming
// ---------------------------------------------------------------------------

export function calcNextOccurrence(tagihan: Tagihan, nowMs: number): Date | null {
  const todayMidnight = startOfDayMs(new Date(nowMs))
  const createdMidnight = startOfDayMs(new Date(tagihan.createdAt))
  const lookbackMs = todayMidnight - 60 * 86_400_000
  const lookaheadMs = todayMidnight + 60 * 86_400_000

  const all = getOccurrencesInWindow(tagihan, lookbackMs, lookaheadMs)
  if (all.length === 0) return null

  // Most recent overdue: past occurrence on/after createdAt that is unpaid.
  // Occurrences before createdAt are skipped — tagihan didn't exist yet.
  const overdue = all.filter(
    (d) =>
      d.getTime() >= createdMidnight &&
      d.getTime() < todayMidnight &&
      !isOccurrencePaid(tagihan, d.getTime()),
  )
  if (overdue.length > 0) return overdue[overdue.length - 1]

  // Earliest upcoming (today or future)
  const upcoming = all.filter((d) => d.getTime() >= todayMidnight)
  if (upcoming.length > 0) return upcoming[0]

  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isTagihanPaidThisPeriod(tagihan: Tagihan, nowMs: number): boolean {
  if (tagihan.lastPaidAt === null) return false
  if (tagihan.frequency === 'sekali') return true
  const occ = calcNextOccurrence(tagihan, nowMs)
  if (occ === null) return false
  return isOccurrencePaid(tagihan, occ.getTime())
}

/** Returns the next calendar date on which this tagihan is due, respecting month rollover. */
export function calcNextDueDate(dueDay: number, nowMs: number): Date {
  const now = new Date(nowMs)
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  if (dueDay >= today) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return new Date(year, month, Math.min(dueDay, lastDay))
  }

  const nm = month + 1
  const ny = nm > 11 ? year + 1 : year
  const nm12 = nm % 12
  const lastDay = new Date(ny, nm12 + 1, 0).getDate()
  return new Date(ny, nm12, Math.min(dueDay, lastDay))
}

/** Days from today midnight until the next due date. Always ≥ 0 due to month rollover. */
export function calcDaysUntilDue(dueDay: number, nowMs: number): number {
  const now = new Date(nowMs)
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((calcNextDueDate(dueDay, nowMs).getTime() - todayMidnight) / 86_400_000)
}

function daysFromTodayMidnight(occ: Date, nowMs: number): number {
  const todayMidnight = startOfDayMs(new Date(nowMs))
  return Math.round((occ.getTime() - todayMidnight) / 86_400_000)
}

export function getTagihanUrgency(tagihan: Tagihan, nowMs: number): TagihanUrgency {
  const occ = calcNextOccurrence(tagihan, nowMs)
  if (occ === null) return 'normal'
  if (isOccurrencePaid(tagihan, occ.getTime())) return 'normal'
  const days = daysFromTodayMidnight(occ, nowMs)
  if (days < 0) return 'lewat-tempo'
  if (days === 0) return 'hari-ini'
  if (days <= 7) return 'dalam-7-hari'
  return 'normal'
}

export function formatTagihanMeta(t: Tagihan, nowMs: number): { text: string; urgent: boolean } {
  const occ = calcNextOccurrence(t, nowMs)
  if (occ === null) return { text: `tgl ${t.dueDay}`, urgent: false }

  if (isOccurrencePaid(t, occ.getTime())) return { text: `tgl ${t.dueDay}`, urgent: false }

  const days = daysFromTodayMidnight(occ, nowMs)
  if (days < 0) return { text: `lewat ${Math.abs(days)} hari · belum dibayar`, urgent: true }
  if (days === 0) return { text: 'jatuh tempo hari ini · belum dibayar', urgent: true }
  if (days === 1) return { text: 'jatuh tempo besok', urgent: false }
  if (days <= 7) return { text: `jatuh tempo ${days} hari lagi`, urgent: false }
  return { text: `tgl ${t.dueDay}`, urgent: false }
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

/**
 * Sum of nominalEstimate for each unpaid occurrence falling in [todayMidnight, nextPaydayMs).
 * A weekly tagihan may contribute multiple occurrences.
 */
export function calcUnpaidTagihanTotal(
  tagihan: Tagihan[],
  nowMs: number,
  nextPaydayMs: number,
): number {
  const todayMidnight = startOfDayMs(new Date(nowMs))
  return tagihan
    .filter((t) => t.isActive)
    .flatMap((t) =>
      getOccurrencesInWindow(t, todayMidnight, nextPaydayMs).map((occ) => ({ t, occ })),
    )
    .filter(({ t, occ }) => !isOccurrencePaid(t, occ.getTime()))
    .reduce((sum, { t }) => sum + t.nominalEstimate, 0)
}

export function hasUrgentTagihan(tagihan: Tagihan[], nowMs: number): boolean {
  return tagihan.some((t) => {
    const u = getTagihanUrgency(t, nowMs)
    return u === 'lewat-tempo' || u === 'hari-ini'
  })
}
