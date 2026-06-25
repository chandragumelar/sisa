import { db } from '@/db/database'
import type { RateRecord } from '@/db/database'

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest'

/**
 * Fetch latest rates from Frankfurter API and persist to local cache.
 * Throws on network/HTTP error — caller decides how to handle offline.
 */
export async function fetchRates(base: string, targets: string[]): Promise<void> {
  if (targets.length === 0) return
  const symbols = targets.join(',')
  const res = await fetch(`${FRANKFURTER_URL}?base=${encodeURIComponent(base)}&symbols=${symbols}`)
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`)
  const json = (await res.json()) as { rates: Record<string, number> }
  const fetchedAt = Date.now()
  await db.rates.bulkPut(
    Object.entries(json.rates).map(([target, rate]) => ({ base, target, rate, fetchedAt })),
  )
}

/** Returns cached rate, 1 if base===target, or null if not cached. */
export async function getRate(base: string, target: string): Promise<number | null> {
  if (base === target) return 1
  const record = await db.rates.get({ base, target })
  return record?.rate ?? null
}

/** Returns amount converted to `to` currency, or null if rate not cached. */
export async function convert(amount: number, from: string, to: string): Promise<number | null> {
  const rate = await getRate(from, to)
  return rate === null ? null : amount * rate
}

/** Returns full rate record (with fetchedAt), or null if base===target or not cached. */
export async function getRateAsOf(base: string, target: string): Promise<RateRecord | null> {
  if (base === target) return null
  return (await db.rates.get({ base, target })) ?? null
}

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Formats a fetchedAt epoch ms to "25 Jun" (day + month abbreviated). */
export function formatRateDate(fetchedAt: number): string {
  const d = new Date(fetchedAt)
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`
}

/**
 * Triggers a background rate fetch if no rate for this base was fetched today.
 * Offline-safe: catches network errors and falls back to stale cache.
 * Non-throwing.
 */
export async function refreshRatesIfStale(base: string, targets: string[]): Promise<void> {
  if (targets.length === 0) return
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const fresh = await db.rates
    .where('base')
    .equals(base)
    .filter((r) => r.fetchedAt >= todayMs)
    .first()
  if (fresh) return
  try {
    await fetchRates(base, targets)
  } catch {
    // offline or network error — stale cache remains usable
  }
}
