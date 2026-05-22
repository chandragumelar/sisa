import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { getTagihanUrgency, rankTagihan } from '../home.utils'
import styles from './TagihanDetailSheet.module.css'

interface SingleProps {
  tagihan: Tagihan
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onPay: (tagihan: Tagihan) => void
}

export function TagihanDetailSheet({ tagihan, nowMs, isOpen, onClose, onPay }: SingleProps) {
  const urgency = getTagihanUrgency(tagihan, nowMs)
  const isPaid = tagihan.lastPaidAt !== null

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tagihan.name}>
      <div className={styles.detail}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Nominal</span>
          <span className={styles.rowValue}>
            {tagihan.nominalType === 'variabel' ? '± ' : ''}
            {formatCurrency(tagihan.nominalEstimate, tagihan.currency)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Jatuh tempo</span>
          <span className={styles.rowValue}>Tgl {tagihan.dueDay}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Status</span>
          <span
            className={
              urgency === 'lewat-tempo' || urgency === 'hari-ini'
                ? styles.rowValueUrgent
                : styles.rowValue
            }
          >
            {isPaid
              ? 'Sudah dibayar bulan ini'
              : urgency === 'lewat-tempo'
                ? 'Lewat tempo'
                : urgency === 'hari-ini'
                  ? 'Jatuh tempo hari ini'
                  : 'Belum dibayar'}
          </span>
        </div>
        {tagihan.lastPaidAmount !== null && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Terakhir dibayar</span>
            <span className={styles.rowValue}>
              {formatCurrency(tagihan.lastPaidAmount, tagihan.currency)}
            </span>
          </div>
        )}
      </div>

      {!isPaid && (
        <button
          className={styles.payBtn}
          onClick={() => {
            onPay(tagihan)
            onClose()
          }}
        >
          Tandai Dibayar
        </button>
      )}
    </BottomSheet>
  )
}

interface UrgentListProps {
  tagihan: Tagihan[]
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onPay: (tagihan: Tagihan) => void
}

export function UrgentTagihanSheet({ tagihan, nowMs, isOpen, onClose, onPay }: UrgentListProps) {
  const urgent = rankTagihan(tagihan, nowMs).filter((t) => {
    const u = getTagihanUrgency(t, nowMs)
    return u === 'lewat-tempo' || u === 'hari-ini'
  })

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Komitmen mendesak">
      {urgent.map((t) => {
        const u = getTagihanUrgency(t, nowMs)
        return (
          <div key={t.id} className={styles.urgentRow}>
            <div className={styles.urgentLeft}>
              <span className={styles.urgentName}>{t.name}</span>
              <span className={styles.urgentMeta}>
                {u === 'lewat-tempo'
                  ? `Lewat tempo ${new Date(nowMs).getDate() - t.dueDay} hari`
                  : 'Jatuh tempo hari ini'}
              </span>
            </div>
            <div className={styles.urgentRight}>
              <span className={styles.urgentAmount}>
                {formatCurrency(t.nominalEstimate, t.currency)}
              </span>
              <button
                className={styles.urgentPayBtn}
                onClick={() => {
                  onPay(t)
                  onClose()
                }}
              >
                Bayar
              </button>
            </div>
          </div>
        )
      })}
    </BottomSheet>
  )
}
