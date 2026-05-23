import { useState } from 'react'
import type { Settings } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
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
  hasTagihan: boolean
}

export function BudgetModule({
  dailyBudget,
  spentToday,
  settings,
  unpaidTagihanTotal,
  totalSaldo,
  nowMs,
  hasTagihan,
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false)

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
  const canPredictSisa = hasTagihan

  return (
    <>
      <div className={styles.labelRow}>
        <span className={styles.label}>budget hari ini</span>
        <button
          className={styles.infoDot}
          onClick={() => setInfoOpen(true)}
          aria-label="Cara hitung budget harian"
        >
          i
        </button>
      </div>

      <div className={styles.bigAmount}>{formatCurrency(dailyBudget, currency)}</div>

      <div className={styles.descLine}>
        jatah harian untuk {daysUntilPayday} hari sampai gajian tgl {paydayDate.getDate()}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>budget minggu ini</div>
          <div className={styles.cardNum}>{formatCurrency(weeklyBudget, currency)}</div>
          <div className={styles.cardSub}>sampai minggu · {daysUntilWeekEnd} hari</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>sisa pas gajian</div>
          {canPredictSisa ? (
            <>
              <div className={styles.cardNum}>
                {formatCurrency(Math.abs(sisaPasGajian), currency)}
              </div>
              <div className={styles.cardSub}>
                prediksi ·{' '}
                <span className={isKetat ? styles.statusKetat : styles.statusAman}>
                  {isKetat ? 'ketat' : 'aman'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardNumEmpty}>—</div>
              <div className={styles.cardSub}>isi tagihan dulu</div>
            </>
          )}
        </div>
      </div>

      <div className={styles.barWrap}>
        <div className={styles.barFill} style={{ width: `${fillPct}%` }} />
      </div>

      <div className={styles.barFooter}>
        <span>{formatCurrency(spentToday, currency)} terpakai</span>
        <span className={styles.barFooterRight}>
          {formatCurrency(sisaHariIni, currency)} sisa hari ini
        </span>
      </div>

      <BottomSheet isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Cara hitung budget">
        <div className={styles.infoContent}>
          <p>
            <strong>Budget harian</strong> = (Saldo total − Tagihan belum dibayar) ÷ Hari sampai
            gajian
          </p>
          <p>
            <strong>Sisa pas gajian</strong> = Saldo total − (Budget harian × Hari sampai gajian) −
            Tagihan belum dibayar
          </p>
          <p className={styles.infoNote}>
            Tagihan perlu diisi biar prediksi akurat. Saldo dihitung dari semua dompet aktif.
          </p>
        </div>
      </BottomSheet>
    </>
  )
}
