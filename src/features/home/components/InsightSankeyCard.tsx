import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/app/providers/useLanguage'
import type { Language } from '@/db/database'
import { getTransactionsByDateRange } from '@/db/transactions.repository'
import { aggregateByCategory } from '@/features/insight/insight.utils'
import { getCurrencyLabel } from '@/constants/currencies'
import { t } from '@/shared/strings/strings'
import { formatCompactCurrency } from './sankey.utils'
import homeStyles from '../HomePage.module.css'
import styles from './InsightSankeyCard.module.css'

interface Props {
  currency: string
  nowMs: number
  sisaUang: number
}

interface SankeyRow {
  name: string
  amount: number
  isSisa: boolean
}

type ValueMode = 'nominal' | 'persen'

const TOP_CATEGORY_CAP = 6
const SMALL_CATEGORY_PCT = 5
const LAINNYA_LABEL = 'Lainnya'
const MIN_HEIGHT = 220
const MAX_HEIGHT = 360
const ROW_HEIGHT = 40
const MIN_NODE_H = 16
const VB_WIDTH = 320
const NODE_WIDTH = 8
const RIGHT_LABEL_WIDTH = 140
const NODE_GAP = 8
const PAD_TOP = 12
const PAD_BOTTOM = 10

/** Merges categories < SMALL_CATEGORY_PCT% of total into 'Lainnya', then caps top N. Sum-preserving. */
function mergeSmallAndCap(map: Map<string, number>, total: number): SankeyRow[] {
  if (total === 0) return []
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  const big: [string, number][] = []
  let smallSum = 0
  for (const [name, amount] of sorted) {
    if ((amount / total) * 100 < SMALL_CATEGORY_PCT) smallSum += amount
    else big.push([name, amount])
  }
  const capped = big.slice(0, TOP_CATEGORY_CAP)
  const overflow = big.slice(TOP_CATEGORY_CAP)
  const lainnyaAmount = smallSum + overflow.reduce((s, [, v]) => s + v, 0)
  const rows: SankeyRow[] = capped.map(([name, amount]) => ({ name, amount, isSisa: false }))
  if (lainnyaAmount > 0) rows.push({ name: LAINNYA_LABEL, amount: lainnyaAmount, isSisa: false })
  return rows
}

/** Normalizes bar heights to sum to barsH while enforcing MIN_NODE_H per row. */
function buildNormalizedHeights(rows: SankeyRow[], total: number, barsH: number): number[] {
  const n = rows.length
  if (n * MIN_NODE_H >= barsH) return rows.map(() => barsH / n)

  const raw = rows.map((r) => (r.amount / total) * barsH)
  const clamped = raw.map((h) => Math.max(h, MIN_NODE_H))
  const extra = clamped.reduce((s, h) => s + h, 0) - barsH
  if (extra <= 0) return clamped

  const shrinkableIdx = raw.map((h, i) => (h > MIN_NODE_H ? i : -1)).filter((i) => i >= 0)
  const shrinkableSum = shrinkableIdx.reduce((s, i) => s + (raw[i] - MIN_NODE_H), 0)
  if (shrinkableSum <= 0) return clamped

  const result = [...clamped]
  for (const i of shrinkableIdx) {
    const share = (raw[i] - MIN_NODE_H) / shrinkableSum
    result[i] = raw[i] - extra * share
  }
  return result
}

function stackNodes(heights: number[], startY: number, gap: number) {
  let y = startY
  return heights.map((h) => {
    const node = { yStart: y, yEnd: y + h }
    y += h + gap
    return node
  })
}

function ribbonPath(
  x1: number,
  x2: number,
  left: { yStart: number; yEnd: number },
  right: { yStart: number; yEnd: number },
): string {
  const cx = (x1 + x2) / 2
  return `M${x1},${left.yStart} C${cx},${left.yStart} ${cx},${right.yStart} ${x2},${right.yStart} L${x2},${right.yEnd} C${cx},${right.yEnd} ${cx},${left.yEnd} ${x1},${left.yEnd} Z`
}

function nodeLabel(
  row: SankeyRow,
  mode: ValueMode,
  leftTotal: number,
  currency: string,
  lang: Language,
): string {
  const value =
    mode === 'persen'
      ? `${Math.round((row.amount / leftTotal) * 100)}%`
      : formatCompactCurrency(row.amount, currency, lang)
  return `${row.name} · ${value}`
}

interface SankeyChartProps {
  rows: SankeyRow[]
  leftTotal: number
  currency: string
  mode: ValueMode
  lang: Language
}

function SankeyChart({ rows, leftTotal, currency, mode, lang }: SankeyChartProps) {
  const vbHeight = Math.min(
    MAX_HEIGHT,
    Math.max(MIN_HEIGHT, rows.length * ROW_HEIGHT + PAD_TOP + PAD_BOTTOM),
  )
  const usableH = vbHeight - PAD_TOP - PAD_BOTTOM
  const gapTotal = (rows.length - 1) * NODE_GAP
  const barsH = Math.max(usableH - gapTotal, rows.length * MIN_NODE_H)
  const rightX = VB_WIDTH - RIGHT_LABEL_WIDTH
  const leftX = 10

  const heights = buildNormalizedHeights(rows, leftTotal, barsH)
  const rightNodes = stackNodes(heights, PAD_TOP, NODE_GAP)
  const leftSegments = stackNodes(heights, PAD_TOP, 0)
  const leftBarHeight = heights.reduce((s, h) => s + h, 0)

  return (
    <svg viewBox={`0 0 ${VB_WIDTH} ${vbHeight}`} width="100%" height={vbHeight} role="img">
      <rect
        x={leftX}
        y={PAD_TOP}
        width={NODE_WIDTH}
        height={leftBarHeight}
        fill="var(--accent)"
        rx="1.5"
      />
      {rows.map((row, i) => {
        const opacity = row.isSisa ? 0.28 : Math.max(0.16, 0.4 - i * 0.05)
        return (
          <path
            key={`ribbon-${row.name}-${row.isSisa}`}
            d={ribbonPath(leftX + NODE_WIDTH, rightX, leftSegments[i], rightNodes[i])}
            fill={row.isSisa ? 'var(--signal-safe)' : 'var(--accent)'}
            opacity={opacity}
          />
        )
      })}
      {rows.map((row, i) => {
        const node = rightNodes[i]
        const midY = (node.yStart + node.yEnd) / 2
        return (
          <g key={`node-${row.name}-${row.isSisa}`}>
            <rect
              x={rightX}
              y={node.yStart}
              width={NODE_WIDTH}
              height={Math.max(node.yEnd - node.yStart, 1)}
              fill={row.isSisa ? 'var(--signal-safe)' : 'var(--accent)'}
              rx="1.5"
            />
            <text
              x={rightX + NODE_WIDTH + 6}
              y={midY + 3.5}
              fontSize="10.5"
              fontWeight={600}
              fill="var(--ink-primary)"
              fontFamily="var(--font-sans)"
            >
              {nodeLabel(row, mode, leftTotal, currency, lang)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function InsightSankeyCard({ currency, nowMs, sisaUang }: Props) {
  const lang = useLanguage()
  const navigate = useNavigate()
  const [categoryRows, setCategoryRows] = useState<SankeyRow[]>([])
  const [mode, setMode] = useState<ValueMode>('nominal')

  useEffect(() => {
    let cancelled = false
    const now = new Date(nowMs)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
    getTransactionsByDateRange(monthStart, monthEnd)
      .then((txs) => {
        if (cancelled) return
        const primaryTxs = txs.filter((tx) => tx.currency === currency)
        const map = aggregateByCategory(primaryTxs)
        const expenseTotal = [...map.values()].reduce((s, v) => s + v, 0)
        setCategoryRows(mergeSmallAndCap(map, expenseTotal))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [nowMs, currency])

  const expenseTotal = categoryRows.reduce((s, r) => s + r.amount, 0)
  const isOverspend = sisaUang <= 0
  const leftTotal = isOverspend ? expenseTotal : expenseTotal + sisaUang
  const chartRows: SankeyRow[] = isOverspend
    ? categoryRows
    : [...categoryRows, { name: t('home.sankey_node_sisa', lang), amount: sisaUang, isSisa: true }]
  const hasData = chartRows.length > 0 && leftTotal > 0

  const breakdownText = isOverspend
    ? t('home.sankey_breakdown_overspend', lang).replace(
        '{out}',
        formatCompactCurrency(expenseTotal, currency, lang),
      )
    : t('home.sankey_breakdown', lang)
        .replace('{out}', formatCompactCurrency(expenseTotal, currency, lang))
        .replace('{left}', formatCompactCurrency(sisaUang, currency, lang))
        .replace('{total}', formatCompactCurrency(leftTotal, currency, lang))

  return (
    <button className={homeStyles.insightCard} onClick={() => navigate('/insight')}>
      <span className={styles.title}>
        {t('home.sankey_title', lang).replace('{cur}', getCurrencyLabel(currency, lang))}
      </span>

      <div className={styles.headerDivider} />

      {hasData && (
        <div className={styles.subRow}>
          <p className={styles.subtext}>{breakdownText}</p>
          <div className={styles.toggle} onClick={(e) => e.stopPropagation()}>
            <button
              className={`${styles.toggleBtn} ${mode === 'nominal' ? styles.toggleBtnActive : ''}`}
              onClick={() => setMode('nominal')}
            >
              {t('home.sankey_toggle_nominal', lang)}
            </button>
            <button
              className={`${styles.toggleBtn} ${mode === 'persen' ? styles.toggleBtnActive : ''}`}
              onClick={() => setMode('persen')}
            >
              {t('home.sankey_toggle_persen', lang)}
            </button>
          </div>
        </div>
      )}

      {!hasData ? (
        <span className={homeStyles.insightCardText}>{t('home.insight_teaser_generic', lang)}</span>
      ) : (
        <div className={styles.chartWrap}>
          <SankeyChart
            rows={chartRows}
            leftTotal={leftTotal}
            currency={currency}
            mode={mode}
            lang={lang}
          />
        </div>
      )}

      {isOverspend && (
        <span className={styles.overspendBadge}>
          {t('home.sankey_overspend_badge', lang).replace(
            '{amount}',
            formatCompactCurrency(Math.abs(sisaUang), currency, lang),
          )}
        </span>
      )}

      <span className={homeStyles.insightCardCta}>{t('home.insight_card_cta', lang)}</span>
    </button>
  )
}
