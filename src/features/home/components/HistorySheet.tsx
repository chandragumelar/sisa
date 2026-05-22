import { useEffect, useState } from 'react'
import type { Transaction, Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { getRecentTransactions } from '@/db/transactions.repository'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './HistorySheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  nowMs: number
}

type FilterMode = 'semua' | 'keluar' | 'masuk' | 'nabung'

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'keluar', label: 'Keluar' },
  { key: 'masuk', label: 'Masuk' },
  { key: 'nabung', label: 'Nabung' },
]

function relativeDate(dateMs: number, nowMs: number): string {
  const now = new Date(nowMs)
  const d = new Date(dateMs)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000

  if (dateMs >= todayStart) return 'Hari ini'
  if (dateMs >= yesterdayStart) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function HistorySheet({ isOpen, onClose, wallets, currency, nowMs }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<FilterMode>('semua')

  useEffect(() => {
    if (!isOpen) return
    getRecentTransactions(150).then(setTransactions)
  }, [isOpen])

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id!, w.name]))

  const filtered = filter === 'semua' ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Riwayat">
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>Belum ada catatan</div>
      ) : (
        <div className={styles.list}>
          {filtered.map((t) => (
            <div key={t.id} className={styles.row}>
              <div className={styles.rowLeft}>
                <span className={styles.rowName}>{t.label ?? typeLabel(t.type)}</span>
                <span className={styles.rowMeta}>
                  {walletMap[t.walletId] ?? '—'} · {relativeDate(t.date, nowMs)}
                </span>
              </div>
              <span
                className={
                  t.type === 'masuk' || t.type === 'nabung' ? styles.amountIn : styles.amountOut
                }
              >
                {t.type === 'masuk' || t.type === 'nabung' ? '+' : '−'}
                {formatCurrency(Math.abs(t.amount), t.currency ?? currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  )
}

function typeLabel(type: Transaction['type']): string {
  switch (type) {
    case 'keluar':
      return 'Pengeluaran'
    case 'masuk':
      return 'Pemasukan'
    case 'nabung':
      return 'Nabung'
    case 'tagihan':
      return 'Tagihan'
    case 'transfer':
      return 'Transfer'
  }
}
