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
}

function barColor(pct: number): string {
  if (pct >= 60) return 'var(--signal-safe)'
  if (pct > 0) return 'var(--accent)'
  return 'var(--ink-tertiary)'
}

export function GoalModule({ goals, totalNabung, currency, onAddTap, onGoalTap }: Props) {
  const lang = useLanguage()

  if (goals.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="var(--ink-tertiary)"
              strokeWidth="1.3"
            >
              <circle cx="6.5" cy="6.5" r="5.2" />
              <circle cx="6.5" cy="6.5" r="2.3" />
              <circle cx="6.5" cy="6.5" r="0.7" fill="var(--ink-tertiary)" stroke="none" />
            </svg>
            <span className={styles.label}>{t('goal.title', lang)}</span>
          </div>
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
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            stroke="var(--ink-tertiary)"
            strokeWidth="1.3"
          >
            <circle cx="6.5" cy="6.5" r="5.2" />
            <circle cx="6.5" cy="6.5" r="2.3" />
            <circle cx="6.5" cy="6.5" r="0.7" fill="var(--ink-tertiary)" stroke="none" />
          </svg>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>
        {totalSaved > 0 && (
          <span className={styles.totalMeta}>total {formatCurrency(totalSaved, currency)}</span>
        )}
      </div>

      {statuses.map(({ goal, saved, pct }, i) => {
        const roundedPct = Math.round(pct)
        const color = barColor(roundedPct)
        return (
          <button
            key={goal.id}
            className={styles.goalRow}
            style={{
              borderBottom: i < statuses.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}
            onClick={() => onGoalTap?.(goal)}
          >
            <div className={styles.goalTop}>
              <span className={styles.goalName}>{goal.name}</span>
              <div className={styles.goalRight}>
                <span className={styles.goalProgress}>
                  {formatCurrency(saved, currency)} / {formatCurrency(goal.target, currency)}
                </span>
                <span className={styles.goalPct} style={{ color }}>
                  {roundedPct}%
                </span>
              </div>
            </div>
            <div className={styles.goalBar}>
              <div
                className={styles.goalBarFill}
                style={{ width: `${Math.min(100, pct)}%`, background: color }}
              />
            </div>
          </button>
        )
      })}

      <button className={styles.addBtn} onClick={onAddTap}>
        {t('goal.add', lang)}
      </button>
    </div>
  )
}
