import type { Settings } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import {
  calcDaysUntilPayday,
  calcWeeklyBudget,
  calcSisaPasGajian,
  getDaysUntilEndOfWeek,
  getPaydayDate,
} from '../home.utils'
import styles from './BudgetModule.module.css'

interface Props {
  dailyBudget: number
  spentToday: number
  settings: Settings
  unpaidTagihanTotal: number
  totalSaldo: number
  nowMs: number
}

export function BudgetModule({
  dailyBudget,
  spentToday,
  settings,
  unpaidTagihanTotal,
  totalSaldo,
  nowMs,
}: Props) {
  const currency = settings.primaryCurrency
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const paydayDate = getPaydayDate(nowMs, settings)
  const daysUntilWeekEnd = getDaysUntilEndOfWeek(nowMs)
  const weeklyBudget = calcWeeklyBudget(dailyBudget, daysUntilWeekEnd)
  const sisaPasGajian = calcSisaPasGajian(
    totalSaldo,
    dailyBudget,
    daysUntilPayday,
    unpaidTagihanTotal,
  )

  const sisaHariIni = Math.max(0, dailyBudget - spentToday)
  const fillPct = dailyBudget > 0 ? Math.min(100, (spentToday / dailyBudget) * 100) : 0
  const isKetat = sisaPasGajian < 0

  return (
    <>
      <div className={styles.rowSpread}>
        <span className={styles.labelGroup}>
          <span className={styles.label}>budget hari ini</span>
          <span className={styles.infoDot}>i</span>
        </span>
        <span className={styles.meta}>
          {daysUntilPayday} hari sampai gajian (tgl {paydayDate.getDate()})
        </span>
      </div>

      <div className={styles.bigAmount}>{formatCurrency(dailyBudget, currency)}</div>

      <div className={styles.barWrap}>
        <div className={styles.barFill} style={{ width: `${fillPct}%` }} />
      </div>

      <div className={styles.barFooter}>
        <span>{formatCurrency(spentToday, currency)} terpakai</span>
        <span className={styles.barFooterRight}>
          {formatCurrency(sisaHariIni, currency)} sisa hari ini
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>budget minggu ini</div>
          <div className={styles.cardNum}>{formatCurrency(weeklyBudget, currency)}</div>
          <div className={styles.cardSub}>sampai minggu · {daysUntilWeekEnd} hari</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>sisa pas gajian</div>
          <div className={styles.cardNum}>{formatCurrency(Math.abs(sisaPasGajian), currency)}</div>
          <div className={styles.cardSub}>
            prediksi ·{' '}
            <span className={isKetat ? styles.statusKetat : styles.statusAman}>
              {isKetat ? 'ketat' : 'aman'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
