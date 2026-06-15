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
  onReorder?: (newGoals: Goal[]) => void
  onAddTap?: () => void
  onGoalTap?: (goal: Goal) => void
}

export function GoalModule({ goals, totalNabung, currency, onAddTap, onGoalTap }: Props) {
  const lang = useLanguage()

  if (goals.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('goal.empty_text', lang)}</p>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('goal.add', lang)}
          </button>
        </div>
      </div>
    )
  }

  const statuses = calcGoalStatuses(goals, totalNabung)
  const totalSaved = statuses.reduce((sum, s) => sum + s.saved, 0)

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <span className={styles.label}>{t('goal.title', lang)}</span>
        {totalSaved > 0 && (
          <span className={styles.totalMeta}>total {formatCurrency(totalSaved, currency)}</span>
        )}
      </div>

      <div className={styles.grid}>
        {statuses.map(({ goal, saved, pct, status }) => {
          const isWaiting = status === 'antri'
          return (
            <button
              key={goal.id}
              className={`${styles.card} ${isWaiting ? styles.cardWaiting : ''}`}
              onClick={() => onGoalTap?.(goal)}
            >
              <span
                className={styles.priorityBadge}
                style={{ background: isWaiting ? 'var(--ink-tertiary)' : 'var(--ink-primary)' }}
              >
                {isWaiting ? 'antri' : status === 'tercapai' ? 'tercapai' : 'aktif'}
              </span>
              <div className={`${styles.goalName} ${isWaiting ? styles.goalNameWaiting : ''}`}>
                {goal.name}
              </div>
              {!isWaiting ? (
                <>
                  <div className={styles.goalPct}>{Math.round(pct)}%</div>
                  <div className={styles.goalBar}>
                    <div
                      className={styles.goalBarFill}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className={styles.goalProgress}>
                    {formatCurrency(saved, currency)} / {formatCurrency(goal.target, currency)}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.goalWaitingText}>nunggu giliran</div>
                  <div className={styles.goalBar} />
                  <div className={styles.goalProgress}>
                    0 / {formatCurrency(goal.target, currency)}
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.addBtn} onClick={onAddTap}>
          {t('goal.add', lang)}
        </button>
      </div>
    </div>
  )
}
