import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { CategoryRow, CategoryMonthBar } from './insight.utils'
import { formatMonthShort } from './insight.utils'
import styles from './InsightPage.module.css'

const BAR_W = 20
const GAP = 4
const H = 54
const PAD_T = 6
const LABEL_H = 18
const SVG_H = PAD_T + H + LABEL_H

interface Props {
  rows: CategoryRow[]
  selected: string
  onSelect: (cat: string) => void
  trend: CategoryMonthBar[]
  prevMonthShort: string
  currency: string
  lang: Language
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
  if (rows.length === 0) {
    return (
      <div className={styles.card}>
        <span className={styles.cardLabel}>{t('insight.card_category', lang)}</span>
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
  const svgW = n * (BAR_W + GAP) - GAP
  const maxAmt = Math.max(...trend.map((b) => b.amount), 1)
  const labelY = PAD_T + H + 4

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderRow}>
        <span className={styles.cardLabel}>{t('insight.card_category', lang)}</span>
        <select
          className={styles.catSelect}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          aria-label={t('insight.card_category', lang)}
        >
          {rows.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

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
        <svg viewBox={`0 0 ${svgW} ${SVG_H}`} width="100%" height={SVG_H} aria-hidden>
          {trend.map((bar, i) => {
            const isLast = i === n - 1
            const fill = isLast ? 'var(--accent)' : 'var(--border-hair)'
            const barH = Math.max((bar.amount / maxAmt) * H, 1)
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
          {trend.map((bar, i) => {
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
      </div>
    </div>
  )
}
