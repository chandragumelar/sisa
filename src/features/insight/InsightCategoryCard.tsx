import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { CategoryRow } from './insight.utils'
import styles from './InsightPage.module.css'

interface Props {
  rows: CategoryRow[]
  selected: string
  onSelect: (cat: string) => void
  currMonthShort: string
  prevMonthShort: string
  currency: string
  lang: Language
}

export function InsightCategoryCard({
  rows,
  selected,
  onSelect,
  currMonthShort,
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
  const maxAmount = rows[0].amount // already sorted desc

  const currWidth = maxAmount > 0 ? Math.round((row.amount / maxAmount) * 100) : 0
  const prevWidth =
    maxAmount > 0 && row.prevAmount > 0 ? Math.round((row.prevAmount / maxAmount) * 100) : 0

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

      <div className={styles.bigNum}>{formatCurrency(row.amount, currency)}</div>
      <p className={`${deltaClass}`} style={{ marginTop: 7 }}>
        {deltaText}
      </p>

      <div className={styles.catDetailWrap}>
        <div className={styles.catDetailRow}>
          <span className={styles.catDetailMonth}>{currMonthShort}</span>
          <div className={styles.catDetailTrack}>
            <div
              className={styles.catDetailFill}
              style={{ width: `${currWidth}%`, background: 'var(--accent)', opacity: 0.85 }}
            />
          </div>
          <span className={styles.catDetailAmt}>{formatCurrency(row.amount, currency)}</span>
        </div>
        <div className={styles.catDetailRow}>
          <span className={`${styles.catDetailMonth} ${styles.catDetailMonthMuted}`}>
            {prevMonthShort}
          </span>
          <div className={styles.catDetailTrack}>
            <div
              className={styles.catDetailFill}
              style={{ width: `${prevWidth}%`, background: 'var(--border-hair)' }}
            />
          </div>
          <span className={`${styles.catDetailAmt} ${styles.catDetailAmtMuted}`}>
            {row.prevAmount > 0 ? formatCurrency(row.prevAmount, currency) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
