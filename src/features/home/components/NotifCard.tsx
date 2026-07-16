import { AlertCircle } from 'lucide-react'
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
        <AlertCircle size={16} strokeWidth={1.75} />
      </span>
      <span className={styles.body}>
        <strong>{message}</strong> — {preview}
        {extra}
      </span>
      <span className={styles.chev}>›</span>
    </button>
  )
}
