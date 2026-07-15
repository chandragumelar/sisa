import type { Language, Transaction } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { splitWeekendExpense } from './insight.utils'
import pageStyles from './InsightPage.module.css'
import styles from './InsightWeekendCard.module.css'

interface Props {
  currTxs: Transaction[]
  currency: string
  lang: Language
}

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function InsightWeekendCard({ currTxs, currency, lang }: Props) {
  const { weekday, weekend, total } = splitWeekendExpense(currTxs)

  if (total === 0) {
    return (
      <div className={pageStyles.card}>
        <span className={pageStyles.cardLabel}>{t('insight.card_weekend', lang)}</span>
        <div className={pageStyles.emptyBlock}>
          <p className={pageStyles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.weekend_empty', lang)}
          </p>
          <p className={pageStyles.emptySub}>{t('insight.weekend_empty_sub', lang)}</p>
        </div>
      </div>
    )
  }

  const weekdayLen = (weekday / total) * CIRCUMFERENCE
  const weekdayPct = Math.round((weekday / total) * 100)
  const weekendPct = 100 - weekdayPct

  return (
    <div className={pageStyles.card}>
      <span className={pageStyles.cardLabel}>{t('insight.card_weekend', lang)}</span>
      <div className={styles.donutWrap}>
        <svg viewBox="0 0 112 112" width="112" height="112" className={styles.donutSvg} aria-hidden>
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth="18"
          />
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="18"
            strokeDasharray={`${weekdayLen} ${CIRCUMFERENCE - weekdayLen}`}
            transform="rotate(-90 56 56)"
          />
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke="var(--signal-caution)"
            strokeWidth="18"
            strokeDasharray={`${CIRCUMFERENCE - weekdayLen} ${weekdayLen}`}
            strokeDashoffset={-weekdayLen}
            transform="rotate(-90 56 56)"
          />
        </svg>
        <div className={styles.legend}>
          <div className={styles.legendRow}>
            <span className={styles.legendDotWd} />
            <span className={styles.legendLabel}>{t('home.insight_wd_weekday', lang)}</span>
            <span className={styles.legendVal}>{formatCurrency(weekday, currency)}</span>
            <span className={styles.legendPct}>{weekdayPct}%</span>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.legendDotWe} />
            <span className={styles.legendLabel}>{t('home.insight_wd_weekend', lang)}</span>
            <span className={styles.legendVal}>{formatCurrency(weekend, currency)}</span>
            <span className={styles.legendPct}>{weekendPct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
