import { formatCurrency } from '@/shared/utils/formatCurrency'
import type { ForecastMonth } from '../forecast.utils'
import { BottomSheet } from '@/shared/components/BottomSheet'
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
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="prediksi 3 bulan">
      <div className={styles.body}>
        <div className={styles.assumptions}>
          <div className={styles.assumptionRow}>
            <span className={styles.assumptionKey}>jatah harian</span>
            <span className={styles.assumptionVal}>{formatCurrency(dailyBudget, currency)}</span>
          </div>
          <div className={styles.assumptionRow}>
            <span className={styles.assumptionKey}>tagihan per bulan</span>
            <span className={styles.assumptionVal}>{formatCurrency(tagihanTotal, currency)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        {months.map((m, i) => (
          <div key={m.label} className={styles.monthRow}>
            <span className={styles.monthLabel}>
              {i === 0 ? 'bulan ini' : `+${i} bulan`} · {m.label}
            </span>
            <span className={m.sisa >= 0 ? styles.monthAmount : styles.monthAmountNeg}>
              {formatCurrency(m.sisa, currency)}
            </span>
          </div>
        ))}

        <p className={styles.note}>
          Proyeksi berdasarkan rata-rata income dan pengeluaran 3 bulan terakhir.
        </p>
      </div>
    </BottomSheet>
  )
}
