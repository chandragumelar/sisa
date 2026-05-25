import { formatCurrency } from '@/shared/utils/formatCurrency'
import type { ForecastMonth } from '../forecast.utils'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './ForecastDetailSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  months: ForecastMonth[]
  currency: string
  dailyBudget: number
  tagihanTotal: number
}

export function ForecastDetailSheet({
  isOpen,
  onClose,
  months,
  currency,
  dailyBudget,
  tagihanTotal,
}: Props) {
  const lang = useLanguage()
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('forecast.sheet_title', lang)}>
      <div className={styles.body}>
        <div className={styles.assumptions}>
          <div className={styles.assumptionRow}>
            <span className={styles.assumptionKey}>{t('forecast.daily_label', lang)}</span>
            <span className={styles.assumptionVal}>{formatCurrency(dailyBudget, currency)}</span>
          </div>
          <div className={styles.assumptionRow}>
            <span className={styles.assumptionKey}>{t('forecast.tagihan_label', lang)}</span>
            <span className={styles.assumptionVal}>{formatCurrency(tagihanTotal, currency)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        {months.map((m, i) => (
          <div key={m.label} className={styles.monthRow}>
            <span className={styles.monthLabel}>
              {i === 0
                ? t('forecast.month_current', lang)
                : t('forecast.month_plus', lang).replace('{n}', String(i))}{' '}
              · {m.label}
            </span>
            <span className={m.sisa >= 0 ? styles.monthAmount : styles.monthAmountNeg}>
              {formatCurrency(m.sisa, currency)}
            </span>
          </div>
        ))}

        <p className={styles.note}>{t('forecast.note', lang)}</p>
      </div>
    </BottomSheet>
  )
}
