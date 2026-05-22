import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { rankTagihan, getTagihanUrgency } from '../home.utils'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
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

export function TagihanModule({ tagihan, currency, nowMs }: Props) {
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
          {visible.map((t) => {
            const { text, urgent } = metaText(t, nowMs)
            return (
              <div key={t.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowName}>{t.name}</span>
                  <span className={urgent ? styles.rowMetaUrgent : styles.rowMeta}>{text}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.rowAmount}>
                    {t.nominalType === 'variabel' ? '± ' : ''}
                    {formatCurrency(t.nominalEstimate, t.currency)}
                  </span>
                  <span className={styles.chev}>›</span>
                </div>
              </div>
            )
          })}

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
