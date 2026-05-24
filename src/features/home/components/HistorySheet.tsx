import { useEffect, useState } from 'react'
import type { Transaction, Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import {
  getRecentTransactions,
  deleteTransactionAndRevertBalance,
} from '@/db/transactions.repository'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import type { QuickLogMode } from '@/features/quickLog/quickLog.utils'
import styles from './HistorySheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  nowMs: number
  totalNabung: number
  onUpdate: () => void
}

type FilterMode = 'semua' | 'keluar' | 'masuk' | 'nabung'

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'keluar', label: 'Keluar' },
  { key: 'masuk', label: 'Masuk' },
  { key: 'nabung', label: 'Nabung' },
]

const EDITABLE_TYPES: Transaction['type'][] = ['keluar', 'masuk', 'nabung']

function relativeDate(dateMs: number, nowMs: number): string {
  const now = new Date(nowMs)
  const d = new Date(dateMs)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000

  if (dateMs >= todayStart) return 'Hari ini'
  if (dateMs >= yesterdayStart) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
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

export function HistorySheet({
  isOpen,
  onClose,
  wallets,
  currency,
  nowMs,
  totalNabung,
  onUpdate,
}: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<FilterMode>('semua')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [tick, setTick] = useState(0)

  function reload() {
    setTick((n) => n + 1)
    onUpdate()
  }

  useEffect(() => {
    if (!isOpen) return
    getRecentTransactions(150).then(setTransactions)
  }, [isOpen, tick])

  async function handleDelete(txId: number) {
    await deleteTransactionAndRevertBalance(txId)
    setDeletingId(null)
    reload()
  }

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id!, w.name]))
  const filtered = filter === 'semua' ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <>
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
                  {t.note ? <span className={styles.rowNote}>{t.note}</span> : null}
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
                {EDITABLE_TYPES.includes(t.type) && (
                  <div className={styles.rowActions}>
                    {deletingId === t.id ? (
                      <div className={styles.confirmRow}>
                        <button
                          className={styles.confirmDanger}
                          onClick={() => handleDelete(t.id!)}
                        >
                          Hapus
                        </button>
                        <button
                          className={styles.confirmCancel}
                          onClick={() => setDeletingId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setEditTx(t)}
                          aria-label="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setDeletingId(t.id!)}
                          aria-label="Hapus"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      {editTx && (
        <QuickLogSheet
          key={editTx.id}
          isOpen={!!editTx}
          onClose={() => setEditTx(null)}
          wallets={wallets}
          currency={currency}
          totalNabung={totalNabung}
          nowMs={nowMs}
          onCommit={(_txId: number, _mode: QuickLogMode) => {
            setEditTx(null)
            reload()
          }}
          editTxId={editTx.id!}
          initialMode={editTx.type as QuickLogMode}
          initialAmount={Math.abs(editTx.amount)}
          initialWalletId={editTx.walletId}
          initialLabel={editTx.label ?? undefined}
          initialNote={editTx.note ?? undefined}
          initialDateMs={editTx.date}
        />
      )}
    </>
  )
}
