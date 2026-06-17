import { useState, useEffect, useRef } from 'react'
import type { Goal } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { calcGoalStatuses } from '../home.utils'
import styles from './GoalModule.module.css'

interface Props {
  goals: Goal[]
  totalNabung: number
  currency: string
  onAddTap?: () => void
  onGoalTap?: (goal: Goal) => void
  onNabungTap?: () => void
  onReorder?: (orderedIds: number[]) => void
  showGoalToast?: boolean
  newGoalName?: string
  onGoalToastNabung?: () => void
  onGoalToastDismiss?: () => void
}

export function GoalModule({
  goals,
  totalNabung,
  currency,
  onAddTap,
  onGoalTap,
  onNabungTap,
  onReorder,
  showGoalToast,
  newGoalName,
  onGoalToastNabung,
  onGoalToastDismiss,
}: Props) {
  const lang = useLanguage()

  // Local ordering state — syncs when goals are added/deleted
  const [localIds, setLocalIds] = useState<number[]>(() => goals.map((g) => g.id!))
  const localIdsRef = useRef<number[]>(localIds)

  useEffect(() => {
    setLocalIds((prev) => {
      const newIds = goals.map((g) => g.id!)
      const kept = prev.filter((id) => newIds.includes(id))
      const added = newIds.filter((id) => !kept.includes(id))
      const merged = [...kept, ...added]
      localIdsRef.current = merged
      return merged
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals.length])

  // Drag state — refs avoid stale closures in document listeners
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const overIdxRef = useRef<number | null>(null)
  const dragIdxRef = useRef<number | null>(null)
  const rowRefs = useRef<(HTMLElement | null)[]>([])
  const didDragRef = useRef(false)

  // Document-level pointer listeners during drag
  useEffect(() => {
    if (dragIdx === null) return

    function onMove(e: PointerEvent) {
      let next = 0
      rowRefs.current.forEach((el, i) => {
        if (!el) return
        const { top, height } = el.getBoundingClientRect()
        if (e.clientY > top + height / 2) next = i
      })
      const clamped = Math.max(0, Math.min((rowRefs.current.length ?? 1) - 1, next))
      overIdxRef.current = clamped
      setOverIdx(clamped)
    }

    function onUp() {
      const from = dragIdxRef.current
      const to = overIdxRef.current
      if (from !== null && to !== null && from !== to) {
        const newIds = [...localIdsRef.current]
        const [moved] = newIds.splice(from, 1)
        newIds.splice(to, 0, moved)
        localIdsRef.current = newIds
        setLocalIds(newIds)
        onReorder?.(newIds)
        didDragRef.current = true
      }
      dragIdxRef.current = null
      overIdxRef.current = null
      setDragIdx(null)
      setOverIdx(null)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
    }
  }, [dragIdx, onReorder])

  function startDrag(idx: number, e: React.PointerEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    dragIdxRef.current = idx
    overIdxRef.current = idx
    setDragIdx(idx)
    setOverIdx(idx)
    didDragRef.current = false
    // Capture so move/up fire on this element even when pointer leaves
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  if (goals.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>
        <div className={styles.emptyBlock}>
          <p className={styles.emptyTitle}>{t('goal.empty_title', lang)}</p>
          <p className={styles.emptyText}>{t('goal.empty_text', lang)}</p>
          <p className={styles.emptyHint}>{t('goal.empty_hint', lang)}</p>
          <button className={styles.addBtnOutline} onClick={onAddTap}>
            {t('goal.add', lang)}
          </button>
        </div>
      </div>
    )
  }

  // Build ordered goals based on local ordering
  const orderedGoals = localIds
    .map((id) => goals.find((g) => g.id === id))
    .filter((g): g is Goal => !!g)
  const statuses = calcGoalStatuses(orderedGoals, totalNabung)

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>

        {statuses.map(({ goal, saved, pct }, idx) => {
          const isPriority = idx === 0
          const isSaving = saved > 0
          const isDragging = dragIdx === idx
          const isDragOver = overIdx === idx && dragIdx !== null && dragIdx !== idx

          if (isPriority) {
            return (
              <div
                key={goal.id}
                ref={(el) => {
                  rowRefs.current[idx] = el
                }}
                className={[
                  styles.priorityWrap,
                  isDragging ? styles.itemDragging : '',
                  isDragOver ? styles.itemDragOver : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.priorityTop}>
                  <span className={styles.dragHandle} onPointerDown={(e) => startDrag(idx, e)}>
                    ≡
                  </span>
                  <span
                    className={
                      isSaving ? `${styles.statusLabel} ${styles.statusSaving}` : styles.statusLabel
                    }
                  >
                    {isSaving ? t('goal.status_sedang', lang) : t('goal.status_belum', lang)}
                  </span>
                  <span className={styles.prioritasBadge}>{t('goal.prioritas', lang)}</span>
                </div>
                <button
                  className={styles.priorityContent}
                  onClick={() => {
                    if (didDragRef.current) {
                      didDragRef.current = false
                      return
                    }
                    onGoalTap?.(goal)
                  }}
                >
                  <div className={styles.priorityName}>{goal.name}</div>
                  <div className={styles.goalBar}>
                    <div
                      className={styles.goalBarFill}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className={styles.progressRow}>
                    <span className={styles.progressLeft}>
                      {isSaving
                        ? `${formatCurrency(saved, currency)} sudah ditabung`
                        : t('goal.not_saved', lang)}
                    </span>
                    <span className={styles.progressRight}>
                      {pct}% dari {formatCurrency(goal.target, currency)}
                    </span>
                  </div>
                </button>
              </div>
            )
          }

          // Queue item
          const qi = idx - 1
          const subtext =
            qi === 0
              ? `Mulai setelah ${statuses[0].goal.name} selesai`
              : `Menunggu ${qi + 1} giliran lagi`

          return (
            <div key={goal.id}>
              {/* ANTRIAN label before first queue item */}
              {idx === 1 && (
                <div className={styles.antriHeader}>
                  <span className={styles.antriLabel}>{t('goal.antrian_label', lang)}</span>
                </div>
              )}
              <div
                ref={(el) => {
                  rowRefs.current[idx] = el
                }}
                className={[
                  styles.queueRow,
                  isDragging ? styles.itemDragging : '',
                  isDragOver ? styles.itemDragOver : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  borderBottom: idx < statuses.length - 1 ? '1px solid var(--border-soft)' : 'none',
                }}
              >
                <span className={styles.dragHandle} onPointerDown={(e) => startDrag(idx, e)}>
                  ≡
                </span>
                <button
                  className={styles.queueContent}
                  onClick={() => {
                    if (didDragRef.current) {
                      didDragRef.current = false
                      return
                    }
                    onGoalTap?.(goal)
                  }}
                >
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{goal.name}</span>
                    <span className={styles.queueSub}>{subtext}</span>
                  </div>
                  <span className={styles.queueAmt}>{formatCurrency(goal.target, currency)}</span>
                </button>
              </div>
            </div>
          )
        })}

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.reorderHint}>{t('goal.reorder_hint_new', lang)}</span>
          <div className={styles.btnRow}>
            <button className={styles.addBtnOutline} onClick={onAddTap}>
              {t('goal.add', lang)}
            </button>
            <button className={styles.nabungBtn} onClick={onNabungTap}>
              {t('goal.menabung', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Educational toast — bottom sheet after first goal added */}
      {showGoalToast && (
        <div className={styles.toastOverlay} onClick={onGoalToastDismiss}>
          <div className={styles.toastSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.toastHandle} />
            <h2 className={styles.toastTitle}>{t('goal.toast_title', lang)}</h2>
            <p className={styles.toastBody}>
              Sekarang mulai menabung — setiap nabungan akan otomatis mengisi{' '}
              <strong>{newGoalName}</strong> duluan.
            </p>
            <button className={styles.toastCta} onClick={onGoalToastNabung}>
              {t('goal.toast_cta', lang)}
            </button>
            <button className={styles.toastDismiss} onClick={onGoalToastDismiss}>
              {t('goal.toast_dismiss', lang)}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
