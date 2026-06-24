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
import { useLanguage } from '@/app/providers/useLanguage'
import { t, toLocale } from '@/shared/strings/strings'
import type { Language } from '@/db/database'
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

const EDITABLE_TYPES: Transaction['type'][] = ['keluar', 'masuk', 'nabung']

function relativeDate(dateMs: number, nowMs: number, lang: Language): string {
  const now = new Date(nowMs)
  const d = new Date(dateMs)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000

  if (dateMs >= todayStart) return t('history.today', lang)
  if (dateMs >= yesterdayStart) return t('history.yesterday', lang)
  return d.toLocaleDateString(toLocale(lang), { day: 'numeric', month: 'short' })
}

function typeLabel(type: Transaction['type'], lang: Language): string {
  switch (type) {
    case 'keluar':
      return t('history.type_keluar', lang)
    case 'masuk':
      return t('history.type_masuk', lang)
    case 'nabung':
      return t('history.type_nabung', lang)
    case 'tagihan':
      return t('history.type_tagihan', lang)
    case 'transfer':
      return t('history.type_transfer', lang)
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
  const lang = useLanguage()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<FilterMode>('semua')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [tick, setTick] = useState(0)

  const FILTERS: { key: FilterMode; label: string }[] = [
    { key: 'semua', label: t('history.filter_all', lang) },
    { key: 'keluar', label: t('history.filter_keluar', lang) },
    { key: 'masuk', label: t('history.filter_masuk', lang) },
    { key: 'nabung', label: t('history.filter_nabung', lang) },
  ]

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
  const filtered =
    filter === 'semua' ? transactions : transactions.filter((tx) => tx.type === filter)

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={t('history.title', lang)}>
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
          <div className={styles.empty}>{t('history.empty', lang)}</div>
        ) : (
          <div className={styles.list}>
            {filtered.map((tx) => (
              <div key={tx.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowName}>
                    {tx.label ?? tx.note ?? typeLabel(tx.type, lang)}
                  </span>
                  {tx.note ? <span className={styles.rowNote}>{tx.note}</span> : null}
                  <span className={styles.rowMeta}>
                    {walletMap[tx.walletId] ?? '—'} · {relativeDate(tx.date, nowMs, lang)}
                  </span>
                </div>
                <span
                  className={
                    tx.type === 'masuk' || tx.type === 'nabung' ? styles.amountIn : styles.amountOut
                  }
                >
                  {tx.type === 'masuk' || tx.type === 'nabung' ? '+' : '−'}
                  {formatCurrency(Math.abs(tx.amount), tx.currency ?? currency)}
                </span>
                {EDITABLE_TYPES.includes(tx.type) && (
                  <div className={styles.rowActions}>
                    {deletingId === tx.id ? (
                      <div className={styles.confirmRow}>
                        <button
                          className={styles.confirmDanger}
                          onClick={() => handleDelete(tx.id!)}
                        >
                          {t('common.delete', lang)}
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
                          onClick={() => setEditTx(tx)}
                          aria-label={t('history.edit_aria', lang)}
                        >
                          ✎
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setDeletingId(tx.id!)}
                          aria-label={t('history.delete_aria', lang)}
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
          initialDateMs={editTx.date}
          initialCategory={editTx.category ?? undefined}
        />
      )}
    </>
  )
}
