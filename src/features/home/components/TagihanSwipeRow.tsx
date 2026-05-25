import { useRef, useState } from 'react'
import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { getTagihanUrgency } from '../tagihan.utils'
import { hapticLight } from '@/shared/utils/haptic'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './TagihanSwipeRow.module.css'

interface Props {
  tagihan: Tagihan
  nowMs: number
  metaText: { text: string; urgent: boolean }
  onPayTap: () => void
  onRowTap: () => void
}

const REVEAL_WIDTH = 110

export function TagihanSwipeRow({ tagihan, nowMs, metaText, onPayTap, onRowTap }: Props) {
  const lang = useLanguage()
  const [translateX, setTranslateX] = useState(0)
  const [snapped, setSnapped] = useState(false)
  const startX = useRef<number | null>(null)
  const startTranslate = useRef(0)
  const didMove = useRef(false)

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    startTranslate.current = translateX
    didMove.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (startX.current === null) return
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > 5) didMove.current = true
    const raw = startTranslate.current + delta
    const clamped = Math.min(0, Math.max(-REVEAL_WIDTH, raw))
    setTranslateX(clamped)
  }

  function handlePointerUp() {
    if (startX.current === null) return
    startX.current = null

    if (translateX < -REVEAL_WIDTH / 2) {
      setTranslateX(-REVEAL_WIDTH)
      setSnapped(true)
      hapticLight()
    } else {
      setTranslateX(0)
      setSnapped(false)
    }
  }

  function handleRowClick() {
    if (didMove.current) return
    if (snapped) {
      setTranslateX(0)
      setSnapped(false)
    } else {
      onRowTap()
    }
  }

  const urgency = getTagihanUrgency(tagihan, nowMs)
  const isPaid = urgency === 'normal' && tagihan.lastPaidAt !== null

  const dotColor =
    urgency === 'lewat-tempo' || urgency === 'hari-ini'
      ? 'var(--bahaya-br)'
      : urgency === 'dalam-7-hari'
        ? 'var(--mepet-br)'
        : 'var(--line)'

  return (
    <div className={styles.container}>
      <div
        className={styles.revealPanel}
        onClick={onPayTap}
        aria-label={t('tagihan_swipe.mark_paid_aria', lang)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{t('tagihan_swipe.mark_paid_label', lang)}</span>
      </div>

      <div
        className={styles.rowContent}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: startX.current === null ? 'transform 0.2s ease-out' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleRowClick}
      >
        <span className={styles.rowDot} style={{ background: dotColor }} />
        <div className={styles.rowLeft}>
          <span className={styles.rowName}>{tagihan.name}</span>
          <span className={metaText.urgent ? styles.rowMetaUrgent : styles.rowMeta}>
            {metaText.text}
          </span>
        </div>
        <div className={styles.rowRight}>
          {isPaid && (
            <span className={styles.paidBadge}>{t('tagihan_swipe.paid_badge', lang)}</span>
          )}
          <span className={styles.rowAmount}>
            {tagihan.nominalType === 'variabel' ? '± ' : ''}
            {formatCurrency(tagihan.nominalEstimate, tagihan.currency)}
          </span>
          <span className={styles.chev}>›</span>
        </div>
      </div>
    </div>
  )
}
