import type { Tagihan } from '@/db/database'
import { getTagihanUrgency } from '../tagihan.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './NotifCard.module.css'

interface Props {
  tagihan: Tagihan[]
  nowMs: number
  onClick: () => void
}

export function NotifCard({ tagihan, nowMs, onClick }: Props) {
  const lang = useLanguage()
  const lewatTempo = tagihan.filter((tg) => getTagihanUrgency(tg, nowMs) === 'lewat-tempo')
  const hariIni = tagihan.filter((tg) => getTagihanUrgency(tg, nowMs) === 'hari-ini')
  const urgent = [...lewatTempo, ...hariIni]

  if (urgent.length === 0) return null

  const preview = urgent
    .slice(0, 2)
    .map((tg) => tg.name)
    .join(' & ')
  const extra =
    urgent.length > 2 ? ' ' + t('notif.extra', lang).replace('{n}', String(urgent.length - 2)) : ''

  const lewatCount = lewatTempo.length
  const hariIniCount = hariIni.length

  let message = ''
  if (lewatCount > 0 && hariIniCount > 0) {
    message = t('notif.both', lang).replace('{n}', String(lewatCount + hariIniCount))
  } else if (lewatCount > 0) {
    message = t('notif.overdue', lang).replace('{n}', String(lewatCount))
  } else {
    message = t('notif.due_today', lang).replace('{n}', String(hariIniCount))
  }

  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.icon}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <span className={styles.body}>
        <strong>{message}</strong> — {preview}
        {extra}
      </span>
      <span className={styles.chev}>›</span>
    </button>
  )
}
