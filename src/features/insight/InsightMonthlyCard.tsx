import { useState, useEffect } from 'react'
import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { formatMonthShort } from './insight.utils'
import type { MonthBar, ChartMetric } from './insight.utils'
import styles from './InsightPage.module.css'

interface Props {
  currExpense: number
  currIncome: number
  prevExpense: number
  prevIncome: number
  prevMonthShort: string
  chartData: MonthBar[]
  metric: ChartMetric
  onMetricChange: (m: ChartMetric) => void
  currency: string
  lang: Language
}

const METRICS: ChartMetric[] = ['net', 'keluar', 'masuk']
const BAR_W = 10
const GAP = 6
const BAR_RX = 2
const H = 96
const PAD_T = 8
const LABEL_H = 18
const SVG_H = PAD_T + H + LABEL_H
const MIN_BAR_H = 2
const MIDDLE_LABEL_THRESHOLD = 6

interface BarGeometry {
  y: number
  height: number
  isTick: boolean
}

function BarChart({
  data,
  metric,
  currency,
  lang,
}: {
  data: MonthBar[]
  metric: ChartMetric
  currency: string
  lang: Language
}) {
  const [selectedBar, setSelectedBar] = useState<number | null>(null)

  useEffect(() => {
    setSelectedBar(null)
  }, [metric])

  const n = data.length
  const svgW = n * (BAR_W + GAP) - GAP
  const values = data.map((d) => d[metric])
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1)
  const midY = PAD_T + H / 2
  const baselineY = metric === 'net' ? midY : PAD_T + H
  const labelY = PAD_T + H + 8

  function barGeometry(val: number): BarGeometry {
    if (metric === 'net') {
      const raw = (Math.abs(val) / maxAbs) * (H * 0.9)
      const height = Math.max(raw, MIN_BAR_H)
      const negative = val < 0
      return { y: negative ? midY : midY - height, height, isTick: raw < MIN_BAR_H }
    }
    const raw = (val / maxAbs) * H
    const height = Math.max(raw, MIN_BAR_H)
    return { y: PAD_T + H - height, height, isTick: raw < MIN_BAR_H }
  }

  function barFill(i: number, val: number, isTick: boolean): string {
    if (isTick) return 'var(--border-hair)'
    if (i !== n - 1) return 'var(--border-hair)'
    if (metric !== 'net') return 'var(--accent)'
    return val >= 0 ? 'var(--signal-safe)' : 'var(--signal-caution)'
  }

  const labelIndices = new Set<number>([0, n - 1])
  if (n > MIDDLE_LABEL_THRESHOLD) labelIndices.add(Math.floor((n - 1) / 2))
  if (selectedBar !== null) labelIndices.add(selectedBar)

  return (
    <svg viewBox={`0 0 ${svgW} ${SVG_H}`} width={svgW} height={SVG_H} role="img">
      <line
        x1="0"
        y1={baselineY}
        x2={svgW}
        y2={baselineY}
        stroke="var(--ink-tertiary)"
        strokeWidth="1"
        opacity="0.5"
      />
      {data.map((bar, i) => {
        const val = bar[metric]
        const { y, height, isTick } = barGeometry(val)
        const sel = selectedBar === i
        return (
          <rect
            key={i}
            x={i * (BAR_W + GAP)}
            y={y}
            width={BAR_W}
            height={height}
            fill={barFill(i, val, isTick)}
            stroke={sel ? 'var(--accent)' : undefined}
            strokeWidth={sel ? 1.5 : undefined}
            rx={BAR_RX}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedBar(sel ? null : i)}
          />
        )
      })}
      {selectedBar !== null &&
        (() => {
          const bar = data[selectedBar]
          const i = selectedBar
          const val = bar[metric]
          const { y } = barGeometry(val)
          const barX = i * (BAR_W + GAP) + BAR_W / 2
          const nomY = Math.max(y - 4, 10)
          return (
            <text
              x={barX}
              y={nomY}
              textAnchor="middle"
              fontSize="10"
              fontWeight={600}
              fill="var(--ink-primary)"
              fontFamily="var(--font-sans)"
            >
              {formatCurrency(val, currency)}
            </text>
          )
        })()}
      {data.map((bar, i) => {
        if (!labelIndices.has(i)) return null
        const cx = i * (BAR_W + GAP) + BAR_W / 2
        return (
          <text
            key={`lbl-${i}`}
            x={cx}
            y={labelY}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-tertiary)"
            fontFamily="var(--font-sans)"
          >
            {formatMonthShort(bar.year, bar.month, lang)}
          </text>
        )
      })}
    </svg>
  )
}

export function InsightMonthlyCard({
  currExpense,
  currIncome,
  prevExpense,
  prevIncome,
  prevMonthShort,
  chartData,
  metric,
  onMetricChange,
  currency,
  lang,
}: Props) {
  const net = currIncome - currExpense
  const prevNet = prevIncome - prevExpense

  let bigNum = ''
  let deltaLine: { text: string; positive: boolean } | null = null

  if (metric === 'keluar') {
    bigNum = formatCurrency(currExpense, currency)
    if (prevExpense > 0) {
      const deltaPct = Math.round(Math.abs((currExpense - prevExpense) / prevExpense) * 100)
      const less = currExpense <= prevExpense
      deltaLine = {
        text: t(less ? 'insight.monthly_delta_less' : 'insight.monthly_delta_more', lang)
          .replace('{pct}', String(deltaPct))
          .replace('{month}', prevMonthShort),
        positive: less,
      }
    }
  } else if (metric === 'masuk') {
    bigNum = formatCurrency(currIncome, currency)
    if (prevIncome > 0) {
      const deltaPct = Math.round(Math.abs((currIncome - prevIncome) / prevIncome) * 100)
      const up = currIncome >= prevIncome
      deltaLine = {
        text: t(up ? 'insight.monthly_delta_income_up' : 'insight.monthly_delta_income_down', lang)
          .replace('{pct}', String(deltaPct))
          .replace('{month}', prevMonthShort),
        positive: up,
      }
    }
  } else {
    // net
    bigNum = (net >= 0 ? '+' : '') + formatCurrency(net, currency)
    if (prevExpense > 0 || prevIncome > 0) {
      const diff = net - prevNet
      deltaLine = {
        text: t(diff >= 0 ? 'insight.monthly_delta_net_up' : 'insight.monthly_delta_net_down', lang)
          .replace('{amount}', formatCurrency(Math.abs(diff), currency))
          .replace('{month}', prevMonthShort),
        positive: diff >= 0,
      }
    }
  }

  const isEmpty = currExpense === 0 && currIncome === 0

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderRow}>
        <span className={styles.cardLabel}>{t('insight.card_monthly', lang)}</span>
        <div className={styles.metricPills}>
          {METRICS.map((m) => (
            <button
              key={m}
              className={`${styles.pill} ${metric === m ? styles.pillActive : ''}`}
              onClick={() => onMetricChange(m)}
            >
              {t(`insight.metric_${m}` as Parameters<typeof t>[0], lang)}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.monthly_empty', lang)}
          </p>
          <p className={styles.emptySub}>{t('insight.monthly_empty_sub', lang)}</p>
        </div>
      ) : (
        <>
          <div className={styles.bigNum}>{bigNum}</div>
          {deltaLine && (
            <p
              className={deltaLine.positive ? styles.deltaPos : styles.deltaAlert}
              style={{ marginTop: 7 }}
            >
              {deltaLine.text}
            </p>
          )}
          <div className={styles.barsWrap}>
            <BarChart data={chartData} metric={metric} currency={currency} lang={lang} />
          </div>
          <div className={styles.hdiv} />
          <div className={styles.monthlyFooter}>
            <div>
              <div className={styles.footerLabel}>{t('insight.monthly_label_expense', lang)}</div>
              <div className={styles.footerNum}>{formatCurrency(currExpense, currency)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.footerLabel}>{t('insight.monthly_label_income', lang)}</div>
              <div className={styles.footerNum}>{formatCurrency(currIncome, currency)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
