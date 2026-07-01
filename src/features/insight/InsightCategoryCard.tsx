import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { CategoryRow } from './insight.utils'
import styles from './InsightPage.module.css'

const CX = 55
const CY = 55
const R = 42
const CIRCUMFERENCE = 2 * Math.PI * R // ≈ 263.9

function arcDash(proportion: number): string {
  const fill = Math.max(0, Math.min(proportion, 1)) * CIRCUMFERENCE
  return `${fill} ${CIRCUMFERENCE}`
}

interface Props {
  rows: CategoryRow[]
  selected: string
  onSelect: (cat: string) => void
  currExpense: number
  prevMonthShort: string
  currency: string
  lang: Language
}

export function InsightCategoryCard({
  rows,
  selected,
  onSelect,
  currExpense,
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

  const currProportion = currExpense > 0 ? row.amount / currExpense : 0
  const prevProportion = currExpense > 0 && row.prevAmount > 0 ? row.prevAmount / currExpense : 0
  const currPct = Math.round(currProportion * 100)

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

      <div className={styles.ringWrap}>
        <svg
          width="110"
          height="110"
          viewBox="0 0 110 110"
          className={styles.ringsvg}
          aria-hidden="true"
        >
          {/* Full track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border-hair)" strokeWidth="10" />
          {/* Prev month arc (redup reference) */}
          {prevProportion > 0 && (
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="var(--ink-tertiary)"
              strokeWidth="10"
              strokeOpacity="0.35"
              strokeDasharray={arcDash(prevProportion)}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          )}
          {/* Curr month arc */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeDasharray={arcDash(currProportion)}
            strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        </svg>

        <div className={styles.ringCenter}>
          <div className={styles.ringAmount}>{formatCurrency(row.amount, currency)}</div>
        </div>
      </div>

      <p className={styles.catPctLabel}>
        {t('insight.cat_pct_of_total', lang).replace('{pct}', String(currPct))}
      </p>
      <p className={`${deltaClass}`} style={{ marginTop: 4 }}>
        {deltaText}
      </p>
    </div>
  )
}
