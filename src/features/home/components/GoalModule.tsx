import { useRef, useState } from 'react'
import type { Goal } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { updateGoalsOrder } from '@/db/goals.repository'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { calcGoalStatuses } from '../home.utils'
import styles from './GoalModule.module.css'

interface Props {
  goals: Goal[]
  totalNabung: number
  currency: string
  onReorder: (newGoals: Goal[]) => void
  onAddTap?: () => void
  onGoalTap?: (goal: Goal) => void
}

const LONG_PRESS_MS = 300

export function GoalModule({
  goals,
  totalNabung,
  currency,
  onReorder,
  onAddTap,
  onGoalTap,
}: Props) {
  const lang = useLanguage()
  const [dragging, setDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressedIndexRef = useRef<number | null>(null)
  const dragStartY = useRef(0)
  const itemHeight = useRef(0)

  // Sync if parent goals change (e.g. after DB reload)
  if (!dragging && localGoals !== goals) {
    setLocalGoals(goals)
  }

  function startLongPress(index: number, e: React.PointerEvent) {
    pressedIndexRef.current = index
    const el = e.currentTarget as HTMLElement
    itemHeight.current = el.getBoundingClientRect().height
    dragStartY.current = e.clientY

    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(20)
      setDragging(true)
      setDragIndex(index)
      setOverIndex(index)
      el.setPointerCapture(e.pointerId)
    }, LONG_PRESS_MS)
  }

  function cancelLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || dragIndex === null || itemHeight.current === 0) return
    const deltaY = e.clientY - dragStartY.current
    const shifted = Math.round(deltaY / itemHeight.current)
    const newOver = Math.max(0, Math.min(localGoals.length - 1, dragIndex + shifted))
    setOverIndex(newOver)
  }

  function handlePointerUp() {
    const wasTap = !dragging
    const tappedIndex = pressedIndexRef.current
    pressedIndexRef.current = null
    cancelLongPress()
    if (!dragging || dragIndex === null || overIndex === null) {
      if (wasTap && tappedIndex !== null) {
        onGoalTap?.(localGoals[tappedIndex])
      }
      setDragging(false)
      setDragIndex(null)
      setOverIndex(null)
      return
    }

    const reordered = [...localGoals]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(overIndex, 0, moved)

    setLocalGoals(reordered)
    setDragging(false)
    setDragIndex(null)
    setOverIndex(null)

    const ids = reordered.map((g) => g.id!)
    updateGoalsOrder(ids).then(() => onReorder(reordered))
  }

  if (goals.length === 0) {
    return (
      <>
        <div className={styles.label}>{t('goal.title', lang)}</div>
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('goal.empty_text', lang)}</p>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('goal.add', lang)}
          </button>
        </div>
      </>
    )
  }

  const displayGoals =
    dragging && overIndex !== null && dragIndex !== null
      ? reorder(localGoals, dragIndex, overIndex)
      : localGoals

  const statuses = calcGoalStatuses(displayGoals, totalNabung)
  const activeGoal = statuses.find((s) => s.status === 'aktif')

  return (
    <>
      <div className={styles.label}>{t('goal.title', lang)}</div>
      <div className={styles.card}>
        {statuses.map(({ goal, saved, pct, status }, i) => {
          const origIndex = localGoals.findIndex((g) => g.id === goal.id)
          const isDragged = dragging && dragIndex === origIndex
          return (
            <div
              key={goal.id}
              className={`${styles.row} ${isDragged ? styles.rowDragging : ''}`}
              onPointerDown={(e) => startLongPress(origIndex, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                cancelLongPress()
                setDragging(false)
              }}
            >
              <div className={styles.head}>
                <div className={styles.headLeft}>
                  <span className={`${styles.badge} ${dragging ? styles.badgeDrag : ''}`}>
                    #{i + 1}
                  </span>
                  <span className={styles.name}>{goal.name}</span>
                </div>
                <span className={styles.amount}>
                  {formatCurrency(saved, currency)} / {formatCurrency(goal.target, currency)}
                </span>
              </div>

              {status === 'aktif' && (
                <>
                  <div className={styles.status}>{t('goal.saving', lang)}</div>
                  <div className={styles.barWrap}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    <div className={styles.barMarker} />
                  </div>
                </>
              )}

              {status === 'tercapai' && (
                <>
                  <div className={styles.status}>{t('goal.reached', lang)}</div>
                  <div className={styles.barWrap}>
                    <div className={styles.barFill} style={{ width: '100%' }} />
                  </div>
                </>
              )}

              {status === 'antri' && (
                <span className={styles.statusWaiting}>{t('goal.waiting', lang)}</span>
              )}
            </div>
          )
        })}

        {activeGoal && (
          <div className={styles.footerMeta}>
            {t('goal.reorder_hint', lang).replace('{name}', activeGoal.goal.name)}
          </div>
        )}
      </div>
      <button className={styles.addBtn} onClick={onAddTap}>
        {t('goal.add', lang)}
      </button>
    </>
  )
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}
