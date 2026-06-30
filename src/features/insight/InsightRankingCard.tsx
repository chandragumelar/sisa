import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { CategoryRow } from './insight.utils'
import styles from './InsightPage.module.css'

interface Props {
  rows: CategoryRow[]
  prevMonthShort: string
  currency: string
  lang: Language
}

export function InsightRankingCard({ rows, prevMonthShort, currency, lang }: Props) {
  if (rows.length === 0) {
    return (
      <div className={styles.card}>
        <span className={styles.cardLabel}>{t('insight.card_ranking', lang)}</span>
        <div className={styles.emptyBlock}>
          <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.ranking_empty', lang)}
          </p>
          <p className={styles.emptySub}>{t('insight.ranking_empty_sub', lang)}</p>
        </div>
      </div>
    )
  }

  const maxAmount = rows[0].amount

  return (
    <div className={`${styles.card} ${styles.cardFlush}`}>
      <div className={`${styles.cardHeaderRow} ${styles.cardFlushPad}`}>
        <span className={styles.cardLabel}>{t('insight.card_ranking', lang)}</span>
        <span className={styles.rankingVs}>
          {t('insight.ranking_vs', lang).replace('{month}', prevMonthShort)}
        </span>
      </div>

      {rows.map((row, i) => {
        const barWidth = maxAmount > 0 ? Math.round((row.amount / maxAmount) * 100) : 0
        const isLast = i === rows.length - 1

        let deltaText = '—'
        let deltaClass = styles.deltaMute
        if (row.deltaPct !== null && row.deltaPct !== 0) {
          deltaText = `${row.deltaPct > 0 ? '↑' : '↓'} ${Math.abs(row.deltaPct)}%`
          if (row.highlighted) deltaClass = styles.deltaAlert
          else if (row.deltaPct < 0) deltaClass = styles.deltaPos
        }

        return (
          <div
            key={row.name}
            className={`${styles.rankRow} ${row.highlighted ? styles.rankRowHighlight : ''}`}
            style={{
              borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
              paddingBottom: isLast ? 4 : undefined,
              borderRadius:
                isLast && row.highlighted ? '0 0 var(--radius-card) var(--radius-card)' : undefined,
            }}
          >
            <span className={styles.rankNum}>{i + 1}</span>
            <span className={styles.rankName}>{row.name}</span>
            <div className={styles.rankBar}>
              <div
                className={styles.rankBarFill}
                style={{
                  width: `${barWidth}%`,
                  background: row.highlighted ? 'var(--signal-caution)' : 'var(--accent)',
                  opacity: row.highlighted ? 1 : 0.75,
                }}
              />
            </div>
            <span className={styles.rankAmt}>{formatCurrency(row.amount, currency)}</span>
            <span className={`${styles.rankDelta} ${deltaClass}`}>{deltaText}</span>
          </div>
        )
      })}
    </div>
  )
}
