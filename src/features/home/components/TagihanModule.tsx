import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { rankTagihan, getTagihanUrgency } from '../home.utils'
import { TagihanSwipeRow } from './TagihanSwipeRow'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onPayTap: (tagihan: Tagihan) => void
  onRowTap: (tagihan: Tagihan) => void
}

const MAX_VISIBLE = 4

function metaText(t: Tagihan, nowMs: number): { text: string; urgent: boolean } {
  const urgency = getTagihanUrgency(t, nowMs)
  const today = new Date(nowMs).getDate()
  switch (urgency) {
    case 'lewat-tempo': {
      const overdue = today - t.dueDay
      return { text: `lewat ${overdue} hari · belum dibayar`, urgent: true }
    }
    case 'hari-ini':
      return { text: 'jatuh tempo hari ini · belum dibayar', urgent: true }
    case 'dalam-7-hari': {
      const daysLeft = t.dueDay - today
      return { text: `${daysLeft} hari lagi`, urgent: false }
    }
    default:
      return { text: `tgl ${t.dueDay}`, urgent: false }
  }
}

export function TagihanModule({ tagihan, currency, nowMs, onPayTap, onRowTap }: Props) {
  const active = tagihan.filter((t) => t.isActive)
  const ranked = rankTagihan(active, nowMs)
  const visible = ranked.slice(0, MAX_VISIBLE)
  const hidden = ranked.slice(MAX_VISIBLE)

  const total = active.reduce((sum, t) => sum + t.nominalEstimate, 0)

  return (
    <>
      <div className={styles.header}>
        <span className={styles.label}>komitmen bulan ini</span>
        {active.length > 0 && (
          <span className={styles.totalMeta}>± {formatCurrency(total, currency)}</span>
        )}
      </div>

      {active.length === 0 ? (
        <div className={styles.empty}>Belum ada komitmen — tambah di Pengaturan.</div>
      ) : (
        <>
          {visible.map((t) => (
            <TagihanSwipeRow
              key={t.id}
              tagihan={t}
              nowMs={nowMs}
              metaText={metaText(t, nowMs)}
              onPayTap={() => onPayTap(t)}
              onRowTap={() => onRowTap(t)}
            />
          ))}

          {hidden.length > 0 && (
            <button className={styles.expandLink}>
              + <strong>{hidden.length} komitmen lainnya</strong> ·{' '}
              {hidden.map((t) => t.name).join(', ')} ›
            </button>
          )}

          <div className={styles.swipeHint}>geser kiri untuk tandai dibayar</div>
        </>
      )}
    </>
  )
}
