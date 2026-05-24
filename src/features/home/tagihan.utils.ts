import type { Tagihan } from '@/db/database'

export type TagihanUrgency = 'lewat-tempo' | 'hari-ini' | 'dalam-7-hari' | 'normal'

export function isTagihanPaidThisPeriod(tagihan: Tagihan, nowMs: number): boolean {
  if (tagihan.lastPaidAt === null) return false
  if (tagihan.recurrenceType === 'sekali') return true
  const paid = new Date(tagihan.lastPaidAt)
  const now = new Date(nowMs)
  return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()
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

export function getTagihanUrgency(tagihan: Tagihan, nowMs: number): TagihanUrgency {
  if (isTagihanPaidThisPeriod(tagihan, nowMs)) return 'normal'
  const days = calcDaysUntilDue(tagihan.dueDay, nowMs)
  if (days < 0) return 'lewat-tempo'
  if (days === 0) return 'hari-ini'
  if (days <= 7) return 'dalam-7-hari'
  return 'normal'
}

export function formatTagihanMeta(t: Tagihan, nowMs: number): { text: string; urgent: boolean } {
  const urgency = getTagihanUrgency(t, nowMs)
  const days = calcDaysUntilDue(t.dueDay, nowMs)
  switch (urgency) {
    case 'lewat-tempo':
      return { text: `lewat ${Math.abs(days)} hari · belum dibayar`, urgent: true }
    case 'hari-ini':
      return { text: 'jatuh tempo hari ini · belum dibayar', urgent: true }
    case 'dalam-7-hari':
      if (days === 1) return { text: 'jatuh tempo besok', urgent: false }
      return { text: `jatuh tempo ${days} hari lagi`, urgent: false }
    default:
      return { text: `tgl ${t.dueDay}`, urgent: false }
  }
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
