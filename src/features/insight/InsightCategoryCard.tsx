import { useState, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { getCategoryDisplayName } from '../category/category-display'
import type { CategoryRow, CategoryMonthBar } from './insight.utils'
import { formatMonthShort } from './insight.utils'
import styles from './InsightPage.module.css'

const STEP = 32
const PAD_X = 14
const PAD_T = 20
const H = 96
const BASELINE_Y = PAD_T + H
const AXIS_LABEL_Y = BASELINE_Y + 16
const SVG_H = AXIS_LABEL_Y + 6
const EDGE_MARGIN = 24

interface Props {
  rows: CategoryRow[]
  selected: string
  onSelect: (cat: string) => void
  trend: CategoryMonthBar[]
  prevMonthShort: string
  currency: string
  lang: Language
}

function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max)
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function InsightCategoryCard({
  rows,
  selected,
  onSelect,
  trend,
  prevMonthShort,
  currency,
  lang,
}: Props) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const gradientId = `insight-cat-grad-${useId()}`

  useEffect(() => {
    setSelectedPoint(null)
  }, [selected])

  if (rows.length === 0) {
    return (
      <div className={styles.card}>
        <span className={styles.cardLabel}>{t('insight.card_category', lang)}</span>
        <div className={styles.cardHeaderDivider} />
        <div className={styles.emptyBlock}>
          <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.cat_empty', lang)}
          </p>
          <p className={styles.emptySub}>{t('insight.cat_empty_sub', lang)}</p>
        </div>
      </div>
    )
  }

  const row = rows.find((r) => r.name === selected) ?? rows[0]

  let deltaText = ''
  let deltaClass = styles.deltaMute
  if (row.deltaPct === null) {
    deltaText = t('insight.cat_no_prev', lang)
  } else if (row.deltaPct > 0) {
    deltaText = t('insight.cat_delta_up', lang)
      .replace('{pct}', String(row.deltaPct))
      .replace('{month}', prevMonthShort)
    deltaClass = row.highlighted ? styles.deltaAlert : styles.deltaMute
  } else if (row.deltaPct < 0) {
    deltaText = t('insight.cat_delta_down', lang)
      .replace('{pct}', String(Math.abs(row.deltaPct)))
      .replace('{month}', prevMonthShort)
    deltaClass = styles.deltaPos
  } else {
    deltaText = `— ${prevMonthShort}`
    deltaClass = styles.deltaMute
  }

  const n = trend.length
  const lastIdx = n - 1
  const svgW = PAD_X * 2 + STEP * lastIdx
  const maxAmt = Math.max(...trend.map((b) => b.amount), 1)

  const points = trend.map((bar, i) => ({
    x: PAD_X + i * STEP,
    y: PAD_T + H - (bar.amount / maxAmt) * H,
  }))
  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points[lastIdx].x} ${BASELINE_Y} L ${points[0].x} ${BASELINE_Y} Z`

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderRow}>
        <span className={styles.cardLabel}>{t('insight.card_category', lang)}</span>
        <button
          type="button"
          className={styles.catSelect}
          onClick={() => setSheetOpen(true)}
          aria-label={t('insight.card_category', lang)}
        >
          <span>{getCategoryDisplayName(row.name, lang)}</span>
          <ChevronDown size={14} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.cardHeaderDivider} />

      <div className={styles.bigNum} style={{ marginTop: 8 }}>
        {formatCurrency(row.amount, currency)}
      </div>
      <p className={`${deltaClass}`} style={{ marginTop: 4 }}>
        {deltaText}
      </p>
      <p className={styles.catPctLabel}>
        {t('insight.cat_pct_of_total', lang).replace('{pct}', String(row.pctOfTotal))}
      </p>

      <div className={styles.barsWrap}>
        <svg viewBox={`0 0 ${svgW} ${SVG_H}`} width="100%" height={SVG_H} role="img">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line
            x1={0}
            y1={BASELINE_Y}
            x2={svgW}
            y2={BASELINE_Y}
            stroke="var(--border-hair)"
            strokeWidth={1}
          />

          <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} />

          {points.map((p, i) => {
            const isLast = i === lastIdx
            if (!isLast && selectedPoint !== i) return null
            const labelX = clamp(p.x, EDGE_MARGIN, svgW - EDGE_MARGIN)
            const labelY = clamp(p.y - 8, 12, PAD_T + H)
            return (
              <g key={`active-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill="var(--accent)"
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={600}
                  fill="var(--ink-primary)"
                  fontFamily="var(--font-sans)"
                >
                  {formatCurrency(trend[i].amount, currency)}
                </text>
              </g>
            )
          })}

          {points.map((p, i) => (
            <circle
              key={`hit-${i}`}
              cx={p.x}
              cy={p.y}
              r={12}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPoint(selectedPoint === i ? null : i)}
            />
          ))}

          {trend.map((bar, i) => {
            if (i % 3 !== 0 && i !== lastIdx) return null
            const labelX = clamp(points[i].x, EDGE_MARGIN, svgW - EDGE_MARGIN)
            return (
              <text
                key={`lbl-${i}`}
                x={labelX}
                y={AXIS_LABEL_Y}
                textAnchor="middle"
                fontSize="9"
                fill="var(--ink-tertiary)"
                fontFamily="var(--font-sans)"
              >
                {formatMonthShort(bar.year, bar.month, lang)}
              </text>
            )
          })}
        </svg>
      </div>

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('insight.cat_select_title', lang)}
      >
        <div className={styles.catSheetList}>
          {rows.map((r) => (
            <button
              key={r.name}
              type="button"
              className={styles.catSheetItem}
              onClick={() => {
                onSelect(r.name)
                setSheetOpen(false)
              }}
            >
              <span>{getCategoryDisplayName(r.name, lang)}</span>
              {r.name === selected && <Check size={16} strokeWidth={2} color="var(--accent)" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
