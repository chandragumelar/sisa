import type { Transaction } from '@/db/database'
import type { Language } from '@/db/database'

export type ChartMetric = 'net' | 'keluar' | 'masuk'

export interface CategoryRow {
  name: string
  amount: number
  prevAmount: number
  deltaPct: number | null
  highlighted: boolean // delta >= 30% upward spike
  pctOfTotal: number // 0–100, rounded, share of total curr expense
}

export interface TopTx {
  label: string
  category: string
  date: number
  amount: number
}

export interface MonthBar {
  year: number
  month: number // 0-indexed
  net: number
  keluar: number
  masuk: number
}

export type HeroVariant =
  | { kind: 'comparative'; hemat: boolean; deltaPct: number; deltaAmount: number }
  | { kind: 'ratio'; pct: number; remaining: number; income: number }
  | { kind: 'neutral'; hasExpense: boolean }

export interface InsightData {
  currTxs: Transaction[]
  prevTxs: Transaction[]
  allTxs: Transaction[]
  jatahHarian: number | null
}

/** month is 0-indexed */
export function getMonthBounds(year: number, month: number): { startMs: number; endMs: number } {
  return {
    startMs: new Date(year, month, 1).getTime(),
    endMs: new Date(year, month + 1, 1).getTime(),
  }
}

function isOpEx(t: Transaction): boolean {
  return (t.type === 'keluar' || t.type === 'tagihan') && !t.isFromSavings && !t.isEarmark
}

function isIncome(t: Transaction): boolean {
  return t.type === 'masuk' && !t.isEarmark
}

export function sumExpense(txs: Transaction[]): number {
  return txs.filter(isOpEx).reduce((s, t) => s + Math.abs(t.amount), 0)
}

export function sumIncome(txs: Transaction[]): number {
  return txs.filter(isIncome).reduce((s, t) => s + t.amount, 0)
}

export function spendPct(expense: number, income: number): number | null {
  if (income <= 0) return null
  return Math.round((expense / income) * 100)
}

export function dailyAvg(expense: number, daysElapsed: number): number {
  if (daysElapsed <= 0) return 0
  return Math.round(expense / daysElapsed)
}

export function buildHeroVariant(
  currExpense: number,
  currIncome: number,
  prevExpense: number | null,
): HeroVariant {
  if (prevExpense !== null && prevExpense > 0) {
    const delta = prevExpense - currExpense
    const deltaPct = Math.abs(Math.round((delta / prevExpense) * 100))
    return { kind: 'comparative', hemat: delta >= 0, deltaPct, deltaAmount: Math.abs(delta) }
  }
  if (currIncome > 0) {
    const pct = spendPct(currExpense, currIncome) ?? 0
    return { kind: 'ratio', pct, remaining: currIncome - currExpense, income: currIncome }
  }
  return { kind: 'neutral', hasExpense: currExpense > 0 }
}

export function aggregateByCategory(txs: Transaction[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (!isOpEx(t)) continue
    const cat = t.category ?? 'Lainnya'
    map.set(cat, (map.get(cat) ?? 0) + Math.abs(t.amount))
  }
  return map
}

const CATEGORY_CAP = 15
const HIGHLIGHT_THRESHOLD = 30

export function buildCategoryRanking(
  curr: Map<string, number>,
  prev: Map<string, number>,
): CategoryRow[] {
  const sorted = [...curr.entries()].sort((a, b) => b[1] - a[1])
  const capped = sorted.slice(0, CATEGORY_CAP)
  const rest = sorted.slice(CATEGORY_CAP)

  // Total across ALL categories (before cap) — pct denominator
  const total = sorted.reduce((s, [, v]) => s + v, 0)

  const rows: CategoryRow[] = capped.map(([name, amount]) => {
    const prevAmount = prev.get(name) ?? 0
    const deltaPct = prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : null
    return {
      name,
      amount,
      prevAmount,
      deltaPct,
      highlighted: deltaPct !== null && deltaPct >= HIGHLIGHT_THRESHOLD,
      pctOfTotal: total > 0 ? Math.round((amount / total) * 100) : 0,
    }
  })

  if (rest.length > 0) {
    const restAmount = rest.reduce((s, [, v]) => s + v, 0)
    rows.push({
      name: 'Lainnya',
      amount: restAmount,
      prevAmount: 0,
      deltaPct: null,
      highlighted: false,
      pctOfTotal: total > 0 ? Math.round((restAmount / total) * 100) : 0,
    })
  }

  return rows
}

export function buildTop5(txs: Transaction[]): TopTx[] {
  return txs
    .filter(isOpEx)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((t) => ({
      label: t.label ?? t.category ?? 'Transaksi',
      category: t.category ?? 'Lainnya',
      date: t.date,
      amount: Math.abs(t.amount),
    }))
}

export function buildChartData(
  allTxs: Transaction[],
  endYear: number,
  endMonth: number, // 0-indexed, inclusive
): MonthBar[] {
  const WINDOW = 12
  const all = Array.from({ length: WINDOW }, (_, i) => {
    const d = new Date(endYear, endMonth - 11 + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const { startMs, endMs } = getMonthBounds(y, m)
    const monthTxs = allTxs.filter((t) => t.date >= startMs && t.date < endMs)
    const keluar = sumExpense(monthTxs)
    const masuk = sumIncome(monthTxs)
    return { year: y, month: m, net: masuk - keluar, keluar, masuk }
  })
  // Strip leading empty months (no activity). Gaps in the middle are kept.
  // Current month (last) is always retained even if empty.
  const firstActive = all.findIndex((b) => b.keluar > 0 || b.masuk > 0)
  return all.slice(firstActive === -1 ? all.length - 1 : firstActive)
}

export function formatTxDate(dateMs: number, lang: Language): string {
  return new Date(dateMs).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatMonthShort(year: number, month: number, lang: Language): string {
  const date = new Date(year, month, 1)
  const name = date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' })
  const yy = String(year).slice(-2)
  return `${name}-${yy}`.toLowerCase()
}

export interface CategoryMonthBar {
  year: number
  month: number // 0-indexed
  amount: number
}

export function buildCategoryTrend(
  allTxs: Transaction[],
  category: string,
  endYear: number,
  endMonth: number,
): CategoryMonthBar[] {
  const WINDOW = 12
  const all = Array.from({ length: WINDOW }, (_, i) => {
    const d = new Date(endYear, endMonth - 11 + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const { startMs, endMs } = getMonthBounds(y, m)
    const amount = allTxs
      .filter(
        (t) =>
          isOpEx(t) &&
          t.date >= startMs &&
          t.date < endMs &&
          (t.category ?? 'Lainnya') === category,
      )
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    return { year: y, month: m, amount }
  })
  const firstActive = all.findIndex((b) => b.amount > 0)
  return all.slice(firstActive === -1 ? all.length - 1 : firstActive)
}

export interface DayCell {
  day: number
  total: number
  txs: { label: string; category: string; amount: number }[]
}

export function buildDailyHeatmap(txs: Transaction[], year: number, month: number): DayCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: DayCell[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    total: 0,
    txs: [],
  }))

  for (const tx of txs) {
    if (!isOpEx(tx)) continue
    const d = new Date(tx.date)
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    const idx = d.getDate() - 1
    const amt = Math.abs(tx.amount)
    cells[idx].total += amt
    cells[idx].txs.push({
      label: tx.label ?? '',
      category: tx.category ?? '',
      amount: amt,
    })
  }

  return cells
}

export function heatBucket(total: number, maxDay: number): number {
  if (total === 0 || maxDay === 0) return 0
  const ratio = total / maxDay
  if (ratio <= 0.2) return 1
  if (ratio <= 0.4) return 2
  if (ratio <= 0.6) return 3
  if (ratio <= 0.8) return 4
  return 5
}

export function formatMonthLong(year: number, month: number, lang: Language): string {
  return new Date(year, month, 1).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}
