import type { Settings } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { TAGIHAN_BURDEN_LOW, TAGIHAN_BURDEN_HIGH } from '@/constants/budget'
import { calcDaysUntilPayday, calcWeeklyBudget, getDaysUntilEndOfWeek } from '../home.utils'
import styles from './BudgetModule.module.css'

interface Props {
  dailyBudget: number
  spentToday: number
  settings: Settings
  currency: string
  unpaidTagihanTotal: number
  totalSaldo: number
  totalNabung: number
  nowMs: number
}

type VerdictKey = 'aman' | 'ketat' | 'bahaya'

function getBurden(
  unpaidTagihanTotal: number,
  totalSaldo: number,
): { pct: number; key: VerdictKey } | null {
  if (totalSaldo <= 0) return null
  const pct = (unpaidTagihanTotal / totalSaldo) * 100
  const key: VerdictKey =
    pct < TAGIHAN_BURDEN_LOW ? 'aman' : pct < TAGIHAN_BURDEN_HIGH ? 'ketat' : 'bahaya'
  return { pct, key }
}

export function BudgetModule({
  dailyBudget,
  spentToday,
  settings,
  currency,
  unpaidTagihanTotal,
  totalSaldo,
  totalNabung,
  nowMs,
}: Props) {
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const daysUntilWeekEnd = getDaysUntilEndOfWeek(nowMs)
  const weeklyBudget = calcWeeklyBudget(dailyBudget, daysUntilWeekEnd, daysUntilPayday)
  const sisaHariIni = Math.max(0, dailyBudget - spentToday)
  const paydayBalance = totalSaldo - unpaidTagihanTotal - totalNabung
  const burden = getBurden(unpaidTagihanTotal, totalSaldo)

  const verdictLabel =
    burden === null
      ? null
      : burden.key === 'aman'
        ? 'AMAN'
        : burden.key === 'ketat'
          ? 'KETAT'
          : 'BAHAYA'

  const dailySpentPct = dailyBudget > 0 ? Math.min(100, (spentToday / dailyBudget) * 100) : 0

  return (
    <>
      {/* Row: Per Hari + Pas Gajian */}
      <div className={styles.halfRow}>
        {/* Tile 2: Per Hari */}
        <div className={styles.card} style={{ position: 'relative' }}>
          <div className={styles.tileLabel}>per hari</div>
          <div className={styles.tileNum}>{formatCurrency(dailyBudget, currency)}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${dailySpentPct}%` }} />
          </div>
          <div className={styles.tileSub}>
            {formatCurrency(spentToday, currency)} terpakai ·{' '}
            <strong style={{ color: 'var(--ink-primary)' }}>
              {formatCurrency(sisaHariIni, currency)} sisa
            </strong>
          </div>
          <div className={styles.daysBadge}>{daysUntilPayday} hr</div>
        </div>

        {/* Tile 3: Pas Gajian */}
        <div className={styles.card}>
          <div className={styles.tileLabel}>pas gajian</div>
          <div className={styles.tileNum}>{formatCurrency(paydayBalance, currency)}</div>
          {verdictLabel && (
            <div className={`${styles.verdictChip} ${styles[`verdict_${burden!.key}`]}`}>
              <span className={styles.verdictDot} />
              <span>{verdictLabel}</span>
            </div>
          )}
          <div className={styles.tileSub}>prediksi saldo akhir bulan</div>
        </div>
      </div>

      {/* Tile 4: Budget Minggu */}
      <div className={`${styles.card} ${styles.weekCard}`}>
        <div className={styles.weekInner}>
          <div>
            <div className={styles.tileLabel}>budget minggu ini</div>
            <div className={styles.weekNum}>{formatCurrency(weeklyBudget, currency)}</div>
          </div>
          <div className={styles.weekRight}>
            <div>sampai Minggu</div>
            <div>{daysUntilWeekEnd} hari lagi</div>
          </div>
        </div>
      </div>
    </>
  )
}
