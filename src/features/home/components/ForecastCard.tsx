import { formatCurrency } from '@/shared/utils/formatCurrency'
import type { ForecastMonth } from '../forecast.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './ForecastCard.module.css'

interface Props {
  months: ForecastMonth[]
  currency: string
  onDetail: () => void
}

export function ForecastCard({ months, currency, onDetail }: Props) {
  const lang = useLanguage()
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{t('forecast.title', lang)}</span>
        <button className={styles.detailBtn} onClick={onDetail}>
          {t('forecast.detail_btn', lang)}
        </button>
      </div>
      <div className={styles.cols}>
        {months.map((m) => (
          <div key={m.label} className={styles.col}>
            <span className={styles.colLabel}>{m.label}</span>
            <span className={m.sisa >= 0 ? styles.colAmount : styles.colAmountNeg}>
              {formatCurrency(m.sisa, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
