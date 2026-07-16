import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { CategoryRow } from './insight.utils'
import styles from './InsightPage.module.css'

interface Props {
  rows: CategoryRow[]
  prevMonthLong: string
  currency: string
  lang: Language
}

export function InsightRankingCard({ rows, prevMonthLong, currency, lang }: Props) {
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

  const maxScale = Math.max(...rows.flatMap((r) => [r.amount, r.prevAmount]), 1)

  return (
    <div className={`${styles.card} ${styles.cardFlush}`}>
      <div className={`${styles.cardHeaderRow} ${styles.cardFlushPad}`}>
        <span className={styles.cardLabel}>{t('insight.card_ranking', lang)}</span>
        <span className={styles.rankingVs}>
          {t('insight.ranking_vs', lang).replace('{month}', prevMonthLong)}
        </span>
      </div>

      <div className={`${styles.rankLegend} ${styles.cardFlushPad}`}>
        <span className={styles.rankLegendItem}>
          <span className={styles.rankLegendDotPrev} />
          {prevMonthLong}
        </span>
        <span className={styles.rankLegendItem}>
          <span className={styles.rankLegendDotNow} />
          {t('insight.ranking_legend_now', lang)}
        </span>
      </div>

      {rows.map((row, i) => {
        const isLast = i === rows.length - 1
        const hasPrev = row.prevAmount > 0 && row.deltaPct !== null

        const nowPct = (row.amount / maxScale) * 100
        const prevPct = (row.prevAmount / maxScale) * 100
        const nowColor = row.highlighted ? 'var(--signal-caution)' : 'var(--accent)'
        let lineColor = 'var(--ink-tertiary)'
        if (row.deltaPct !== null && row.deltaPct > 0) lineColor = 'var(--signal-caution)'
        else if (row.deltaPct !== null && row.deltaPct < 0) lineColor = 'var(--signal-safe)'

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
            className={styles.rankRow}
            style={{
              borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
              paddingBottom: isLast ? 16 : undefined,
            }}
          >
            <span className={styles.rankNum}>{i + 1}</span>
            <span className={styles.rankName}>{row.name}</span>
            <div className={styles.dumbbellTrack}>
              {hasPrev && (
                <div
                  className={styles.dumbbellLine}
                  style={{
                    left: `${Math.min(nowPct, prevPct)}%`,
                    width: `${Math.abs(nowPct - prevPct)}%`,
                    background: lineColor,
                  }}
                />
              )}
              {hasPrev && (
                <div className={styles.dumbbellDotPrev} style={{ left: `${prevPct}%` }} />
              )}
              <div
                className={styles.dumbbellDotNow}
                style={{ left: `${nowPct}%`, background: nowColor }}
              />
            </div>
            <div className={styles.rankAmtCol}>
              <span className={styles.rankAmt}>{formatCurrency(row.amount, currency)}</span>
              <span className={styles.rankAmtPct}>{row.pctOfTotal}%</span>
            </div>
            <span className={`${styles.rankDelta} ${deltaClass}`}>{deltaText}</span>
          </div>
        )
      })}
    </div>
  )
}
