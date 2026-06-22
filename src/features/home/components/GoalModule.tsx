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

  function moveGoal(from: number, to: number) {
    const newIds = [...localIdsRef.current]
    const [moved] = newIds.splice(from, 1)
    newIds.splice(to, 0, moved)
    localIdsRef.current = newIds
    setLocalIds(newIds)
    onReorder?.(newIds)
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
  const last = statuses.length - 1

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>

        {statuses.map(({ goal, saved, pct }, idx) => {
          const isPriority = idx === 0
          const isSaving = saved > 0
          const isFirst = idx === 0
          const isLast = idx === last

          if (isPriority) {
            return (
              <div key={goal.id} className={styles.priorityWrap}>
                <div className={styles.priorityMain}>
                  <div className={styles.priorityBody}>
                    <div className={styles.priorityTop}>
                      <span
                        className={
                          isSaving
                            ? `${styles.statusLabel} ${styles.statusSaving}`
                            : styles.statusLabel
                        }
                      >
                        {isSaving ? t('goal.status_sedang', lang) : t('goal.status_belum', lang)}
                      </span>
                      <span className={styles.prioritasBadge}>{t('goal.prioritas', lang)}</span>
                    </div>
                    <button className={styles.priorityContent} onClick={() => onGoalTap?.(goal)}>
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
                  <ArrowCol
                    idx={idx}
                    isFirst={isFirst}
                    isLast={isLast}
                    onUp={() => moveGoal(idx, idx - 1)}
                    onDown={() => moveGoal(idx, idx + 1)}
                  />
                </div>
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
                className={styles.queueRow}
                style={{
                  borderBottom: idx < last ? '1px solid var(--border-soft)' : 'none',
                }}
              >
                <button className={styles.queueContent} onClick={() => onGoalTap?.(goal)}>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{goal.name}</span>
                    <span className={styles.queueSub}>{subtext}</span>
                  </div>
                  <span className={styles.queueAmt}>{formatCurrency(goal.target, currency)}</span>
                </button>
                <ArrowCol
                  idx={idx}
                  isFirst={isFirst}
                  isLast={isLast}
                  onUp={() => moveGoal(idx, idx - 1)}
                  onDown={() => moveGoal(idx, idx + 1)}
                />
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

function ArrowCol({
  idx,
  isFirst,
  isLast,
  onUp,
  onDown,
}: {
  idx: number
  isFirst: boolean
  isLast: boolean
  onUp: () => void
  onDown: () => void
}) {
  // idx kept for potential future use (aria-label)
  void idx
  return (
    <div className={styles.arrowCol}>
      <button
        className={styles.arrowBtn}
        onClick={onUp}
        disabled={isFirst}
        aria-label="Geser ke atas"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 8L6 4L10 8" />
        </svg>
      </button>
      <button
        className={styles.arrowBtn}
        onClick={onDown}
        disabled={isLast}
        aria-label="Geser ke bawah"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4L6 8L10 4" />
        </svg>
      </button>
    </div>
  )
}
