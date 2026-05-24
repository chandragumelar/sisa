import type { Transaction } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './FooterCatatan.module.css'

interface Props {
  lastTransaction: Transaction | undefined
  currency: string
  onShowHistory: () => void
  nowMs: number
}

function relativeTime(ms: number, nowMs: number): string {
  const diff = Math.floor((nowMs - ms) / 60_000)
  if (diff < 60) return `${diff} menit lalu`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export function FooterCatatan({ lastTransaction, currency, onShowHistory, nowMs }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        {lastTransaction ? (
          <>
            <span>terakhir dicatat:</span>
            <span className={styles.itemName}>
              {lastTransaction.label ?? lastTransaction.note ?? 'Transaksi'}
            </span>
            <span className={styles.amount}>
              −
              {formatCurrency(
                Math.abs(lastTransaction.amount),
                lastTransaction.currency ?? currency,
              )}
            </span>
            <span>· {relativeTime(lastTransaction.date, nowMs)}</span>
          </>
        ) : (
          <span>belum ada catatan</span>
        )}
      </div>
      <button className={styles.link} onClick={onShowHistory}>
        semua catatan ›
      </button>
    </div>
  )
}
