import { useState } from 'react'
import type { Settings } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { TAGIHAN_BURDEN_LOW, TAGIHAN_BURDEN_HIGH } from '@/constants/budget'
import {
  calcDaysUntilPayday,
  calcWeeklyBudget,
  getDaysUntilEndOfWeek,
  getPaydayDate,
} from '../home.utils'
import styles from './BudgetModule.module.css'

interface Props {
  dailyBudget: number
  spentToday: number
  settings: Settings
  currency: string
  unpaidTagihanTotal: number
  totalSaldo: number
  nowMs: number
}

function getBurdenVerdict(pct: number): { label: string; className: string } {
  if (pct < TAGIHAN_BURDEN_LOW) return { label: 'masih sehat', className: styles.statusAman }
  if (pct < TAGIHAN_BURDEN_HIGH) return { label: 'lumayan', className: styles.statusKetat }
  return { label: 'berat', className: styles.statusBerat }
}

export function BudgetModule({
  dailyBudget,
  spentToday,
  settings,
  currency,
  unpaidTagihanTotal,
  totalSaldo,
  nowMs,
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false)
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const paydayDate = getPaydayDate(nowMs, settings)
  const daysUntilWeekEnd = getDaysUntilEndOfWeek(nowMs)
  const weeklyBudget = calcWeeklyBudget(dailyBudget, daysUntilWeekEnd, daysUntilPayday)

  const sisaHariIni = Math.max(0, dailyBudget - spentToday)
  const fillPct = dailyBudget > 0 ? Math.min(100, (spentToday / dailyBudget) * 100) : 0

  const burdenPct = totalSaldo > 0 ? (unpaidTagihanTotal / totalSaldo) * 100 : null
  const burden = burdenPct !== null ? getBurdenVerdict(burdenPct) : null

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
          <div className={styles.cardLabel}>tagihan vs uangmu</div>
          {burden !== null ? (
            <>
              <div className={styles.cardNum}>{Math.round(burdenPct!)}%</div>
              <div className={styles.cardSub}>
                <span className={burden.className}>{burden.label}</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardNumEmpty}>—</div>
              <div className={styles.cardSub}>saldo kosong</div>
            </>
          )}
        </div>
      </div>

      <BottomSheet isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Cara hitung budget">
        <div className={styles.infoContent}>
          <p>
            <strong>Budget harian</strong> = (Saldo − Tagihan − Tabungan) ÷ Hari sampai gajian
          </p>
          <p>
            <strong>Tagihan vs uangmu</strong> = Tagihan belum dibayar ÷ Total saldo × 100%
          </p>
          <p className={styles.infoNote}>
            Tagihan dan target tabungan dikurangi dulu sebelum dibagi ke hari. Saldo dihitung dari
            semua dompet aktif.
          </p>
        </div>
      </BottomSheet>
    </>
  )
}
