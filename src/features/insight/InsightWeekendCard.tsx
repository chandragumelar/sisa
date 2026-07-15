import type { Language, Transaction } from '@/db/database'
import { useClock } from '@/app/providers/useClock'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { splitWeekendExpense, countElapsedDays } from './insight.utils'
import pageStyles from './InsightPage.module.css'
import styles from './InsightWeekendCard.module.css'

interface Props {
  currTxs: Transaction[]
  currency: string
  lang: Language
}

const EM_DASH = '—'

export function InsightWeekendCard({ currTxs, currency, lang }: Props) {
  const clock = useClock()
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

  const { weekdayDays, weekendDays } = countElapsedDays(new Date(clock.now()))
  const weekdayAvg =
    weekdayDays > 0 ? formatCurrency(Math.round(weekday / weekdayDays), currency) : EM_DASH
  const weekendAvg =
    weekendDays > 0 ? formatCurrency(Math.round(weekend / weekendDays), currency) : EM_DASH

  return (
    <div className={pageStyles.card}>
      <span className={pageStyles.cardLabel}>{t('insight.card_weekend', lang)}</span>
      <div className={styles.versusWrap}>
        <div className={styles.versusCol}>
          <span className={styles.versusLabel}>{t('home.insight_wd_weekday', lang)}</span>
          <span className={`${styles.versusNum} ${styles.versusNumWd}`}>{weekdayAvg}</span>
          <span className={styles.versusCaption}>{t('insight.weekend_avg_per_day', lang)}</span>
          <span className={styles.versusSub}>{formatCurrency(weekday, currency)}</span>
        </div>
        <div className={styles.versusCol}>
          <span className={styles.versusLabel}>{t('home.insight_wd_weekend', lang)}</span>
          <span className={`${styles.versusNum} ${styles.versusNumWe}`}>{weekendAvg}</span>
          <span className={styles.versusCaption}>{t('insight.weekend_avg_per_day', lang)}</span>
          <span className={styles.versusSub}>{formatCurrency(weekend, currency)}</span>
        </div>
      </div>
    </div>
  )
}
