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
  prevMonthShort: string
  chartData: MonthBar[]
  metric: ChartMetric
  onMetricChange: (m: ChartMetric) => void
  currency: string
  lang: Language
}

const METRICS: ChartMetric[] = ['net', 'keluar', 'masuk']
const BAR_W = 20
const GAP = 4
const H = 54
const PAD_T = 6
const LABEL_H = 18
const SVG_H = PAD_T + H + LABEL_H

function BarChart({
  data,
  metric,
  lang,
}: {
  data: MonthBar[]
  metric: ChartMetric
  lang: Language
}) {
  const n = data.length
  const svgW = n * (BAR_W + GAP) - GAP
  const values = data.map((d) => d[metric])
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1)
  const midY = PAD_T + H / 2
  const labelY = PAD_T + H + 4

  return (
    <svg viewBox={`0 0 ${svgW} ${SVG_H}`} width="100%" height={SVG_H} aria-hidden>
      {metric === 'net' && (
        <line x1="0" y1={midY} x2={svgW} y2={midY} stroke="var(--border-soft)" strokeWidth="1" />
      )}
      {data.map((bar, i) => {
        const val = bar[metric]
        const isLast = i === n - 1
        const fill = isLast ? 'var(--accent)' : 'var(--border-hair)'
        if (metric === 'net') {
          const barH = Math.max((Math.abs(val) / maxAbs) * (H / 2), 1)
          const negative = val < 0
          return (
            <rect
              key={i}
              x={i * (BAR_W + GAP)}
              y={negative ? midY : midY - barH}
              width={BAR_W}
              height={barH}
              fill={negative && isLast ? 'var(--signal-caution)' : fill}
              rx="2"
            />
          )
        }
        const barH = Math.max((val / maxAbs) * H, 1)
        return (
          <rect
            key={i}
            x={i * (BAR_W + GAP)}
            y={PAD_T + H - barH}
            width={BAR_W}
            height={barH}
            fill={fill}
            rx="2"
          />
        )
      })}
      {data.map((bar, i) => {
        const cx = i * (BAR_W + GAP) + BAR_W / 2
        return (
          <text
            key={`lbl-${i}`}
            x={cx}
            y={labelY}
            textAnchor="end"
            fontSize="8"
            fill="var(--ink-tertiary)"
            fontFamily="var(--font-sans)"
            transform={`rotate(-40, ${cx}, ${labelY})`}
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
  prevMonthShort,
  chartData,
  metric,
  onMetricChange,
  currency,
  lang,
}: Props) {
  const net = currIncome - currExpense
  const hasPrev = prevExpense > 0

  let bigNum = ''
  let deltaLine: { text: string; positive: boolean } | null = null

  if (metric === 'net') {
    bigNum = (net >= 0 ? '+' : '') + formatCurrency(net, currency)
    if (hasPrev) {
      const prevNet = 0 // prev income unknown here; compare expense only
      void prevNet
      const deltaPct = Math.round(Math.abs((currExpense - prevExpense) / prevExpense) * 100)
      const less = currExpense <= prevExpense
      const key = less ? 'insight.monthly_delta_less' : 'insight.monthly_delta_more'
      deltaLine = {
        text: t(key, lang).replace('{pct}', String(deltaPct)).replace('{month}', prevMonthShort),
        positive: less,
      }
    }
  } else if (metric === 'keluar') {
    bigNum = formatCurrency(currExpense, currency)
  } else {
    bigNum = formatCurrency(currIncome, currency)
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
            <BarChart data={chartData} metric={metric} lang={lang} />
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
