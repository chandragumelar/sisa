import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import {
  rankTagihan,
  getTagihanUrgency,
  calcNextOccurrence,
  isOccurrencePaid,
} from '../tagihan.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onPayTap: (tagihan: Tagihan) => void
  onRowTap: (tagihan: Tagihan) => void
  onAddTap?: () => void
}

const MAX_CHIPS = 5

function chipMeta(tg: Tagihan, nowMs: number): { text: string; urgent: boolean } {
  const occ = calcNextOccurrence(tg, nowMs)
  if (!occ || isOccurrencePaid(tg, occ.getTime()))
    return { text: `tgl ${tg.dueDay}`, urgent: false }
  const todayMidnight = new Date(nowMs)
  todayMidnight.setHours(0, 0, 0, 0)
  const days = Math.round((occ.getTime() - todayMidnight.getTime()) / 86_400_000)
  if (days < 0) return { text: `lewat ${Math.abs(days)} hr`, urgent: true }
  if (days === 0) return { text: 'hari ini', urgent: true }
  if (days === 1) return { text: 'besok', urgent: false }
  return { text: `${days} hr lagi`, urgent: false }
}

export function TagihanModule({ tagihan, currency, nowMs, onRowTap, onAddTap }: Props) {
  const lang = useLanguage()
  const active = tagihan.filter((tg) => tg.isActive)
  const ranked = rankTagihan(active, nowMs)
  const visible = ranked.slice(0, MAX_CHIPS)
  const hiddenCount = ranked.length - visible.length

  const urgentCount = active.filter((tg) => {
    const u = getTagihanUrgency(tg, nowMs)
    return u === 'lewat-tempo' || u === 'hari-ini'
  }).length

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{t('tagihan_module.title', lang)}</span>
        {urgentCount > 0 ? (
          <span className={styles.urgentMeta}>{urgentCount} belum bayar</span>
        ) : (
          active.length > 0 && (
            <span className={styles.totalMeta}>
              ±{' '}
              {formatCurrency(
                active.reduce((s, tg) => s + tg.nominalEstimate, 0),
                currency,
              )}
            </span>
          )
        )}
      </div>

      {active.length === 0 ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('tagihan_module.empty_text', lang)}</p>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('tagihan_module.add', lang)}
          </button>
        </div>
      ) : (
        <div className={styles.chipRow}>
          {visible.map((tg) => {
            const meta = chipMeta(tg, nowMs)
            const urgent = meta.urgent
            return (
              <button
                key={tg.id}
                className={`${styles.chip} ${urgent ? styles.chipUrgent : ''}`}
                onClick={() => onRowTap(tg)}
              >
                <div className={`${styles.chipName} ${urgent ? styles.chipNameUrgent : ''}`}>
                  {tg.name}
                </div>
                <div className={`${styles.chipMeta} ${urgent ? styles.chipMetaUrgent : ''}`}>
                  {meta.text}
                </div>
              </button>
            )
          })}

          {hiddenCount > 0 && (
            <button className={`${styles.chip} ${styles.chipMore}`} onClick={onAddTap}>
              <div className={styles.chipName}>+{hiddenCount} lagi</div>
              <div className={styles.chipMeta}>lihat semua ›</div>
            </button>
          )}
        </div>
      )}

      {active.length > 0 && (
        <button className={styles.addBtn} onClick={onAddTap}>
          {t('tagihan_module.add', lang)}
        </button>
      )}
    </div>
  )
}
