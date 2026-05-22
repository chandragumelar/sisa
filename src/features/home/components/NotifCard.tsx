import type { Tagihan } from '@/db/database'
import { getTagihanUrgency } from '../home.utils'
import styles from './NotifCard.module.css'

interface Props {
  tagihan: Tagihan[]
  nowMs: number
  onClick: () => void
}

export function NotifCard({ tagihan, nowMs, onClick }: Props) {
  const lewatTempo = tagihan.filter((t) => getTagihanUrgency(t, nowMs) === 'lewat-tempo')
  const hariIni = tagihan.filter((t) => getTagihanUrgency(t, nowMs) === 'hari-ini')
  const urgent = [...lewatTempo, ...hariIni]

  if (urgent.length === 0) return null

  const preview = urgent
    .slice(0, 2)
    .map((t) => t.name)
    .join(' & ')
  const extra = urgent.length > 2 ? ` +${urgent.length - 2} lainnya` : ''

  const lewatCount = lewatTempo.length
  const hariIniCount = hariIni.length

  let message = ''
  if (lewatCount > 0 && hariIniCount > 0) {
    message = `${lewatCount + hariIniCount} komitmen lewat tempo & jatuh tempo hari ini`
  } else if (lewatCount > 0) {
    message = `${lewatCount} komitmen lewat tempo`
  } else {
    message = `${hariIniCount} komitmen jatuh tempo hari ini`
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
