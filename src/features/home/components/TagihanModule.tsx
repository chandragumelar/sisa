import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { rankTagihan, formatTagihanMeta } from '../tagihan.utils'
import { TagihanSwipeRow } from './TagihanSwipeRow'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onPayTap: (tagihan: Tagihan) => void
  onRowTap: (tagihan: Tagihan) => void
  onAddTap?: () => void
}

const MAX_VISIBLE = 4

export function TagihanModule({ tagihan, currency, nowMs, onPayTap, onRowTap, onAddTap }: Props) {
  const active = tagihan.filter((t) => t.isActive)
  const ranked = rankTagihan(active, nowMs)
  const visible = ranked.slice(0, MAX_VISIBLE)
  const hidden = ranked.slice(MAX_VISIBLE)

  const total = active.reduce((sum, t) => sum + t.nominalEstimate, 0)

  return (
    <>
      <div className={styles.header}>
        <span className={styles.label}>tagihan bulan ini</span>
        {active.length > 0 && (
          <span className={styles.totalMeta}>± {formatCurrency(total, currency)}</span>
        )}
      </div>

      {active.length === 0 ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>
            Catat tagihan rutin — listrik, internet, streaming — biar budget lo akurat dan gak
            kecolongan.
          </p>
          <button className={styles.addBtn} onClick={onAddTap}>
            + Tambah tagihan
          </button>
        </div>
      ) : (
        <>
          {visible.map((t) => (
            <TagihanSwipeRow
              key={t.id}
              tagihan={t}
              nowMs={nowMs}
              metaText={formatTagihanMeta(t, nowMs)}
              onPayTap={() => onPayTap(t)}
              onRowTap={() => onRowTap(t)}
            />
          ))}

          {hidden.length > 0 && (
            <button className={styles.expandLink}>
              + <strong>{hidden.length} tagihan lainnya</strong> ·{' '}
              {hidden.map((t) => t.name).join(', ')} ›
            </button>
          )}

          <div className={styles.swipeHint}>geser kiri untuk tandai dibayar</div>
          <button className={styles.addBtn} onClick={onAddTap}>
            + Tambah tagihan
          </button>
        </>
      )}
    </>
  )
}
