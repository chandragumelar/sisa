import type { Goal } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { calcGoalStatuses } from '../home.utils'
import styles from './GoalModule.module.css'

interface Props {
  goals: Goal[]
  totalNabung: number
  currency: string
}

export function GoalModule({ goals, totalNabung, currency }: Props) {
  if (goals.length === 0) {
    return (
      <>
        <div className={styles.label}>goal tabungan</div>
        <div className={styles.empty}>Belum ada goal — tambah di Pengaturan.</div>
      </>
    )
  }

  const statuses = calcGoalStatuses(goals, totalNabung)
  const activeGoal = statuses.find((s) => s.status === 'aktif')

  return (
    <>
      <div className={styles.label}>goal tabungan</div>
      <div className={styles.card}>
        {statuses.map(({ goal, saved, pct, status }, i) => (
          <div key={goal.id} className={styles.row}>
            <div className={styles.head}>
              <div className={styles.headLeft}>
                <span className={styles.badge}>#{i + 1}</span>
                <span className={styles.name}>{goal.name}</span>
              </div>
              <span className={styles.amount}>
                {formatCurrency(saved, currency)} / {formatCurrency(goal.target, currency)}
              </span>
            </div>

            {status === 'aktif' && (
              <>
                <div className={styles.status}>menabung →</div>
                <div className={styles.barWrap}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  <div className={styles.barMarker} />
                </div>
              </>
            )}

            {status === 'tercapai' && (
              <>
                <div className={styles.status}>tercapai ✓</div>
                <div className={styles.barWrap}>
                  <div className={styles.barFill} style={{ width: '100%' }} />
                </div>
              </>
            )}

            {status === 'antri' && <span className={styles.statusWaiting}>nunggu giliran</span>}
          </div>
        ))}

        {activeGoal && (
          <div className={styles.footerMeta}>
            nabung lagi: {activeGoal.goal.name} · drag untuk ganti urutan
          </div>
        )}
      </div>
    </>
  )
}
