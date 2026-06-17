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
  showGoalToast,
  newGoalName,
  onGoalToastNabung,
  onGoalToastDismiss,
}: Props) {
  const lang = useLanguage()

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

  const statuses = calcGoalStatuses(goals, totalNabung)
  const priority = statuses[0]
  const queue = statuses.slice(1)
  const isSaving = priority.saved > 0

  return (
    <>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>{t('goal.title', lang)}</span>
        </div>

        {/* Priority goal */}
        <button
          className={styles.priorityBlock}
          style={{ borderBottom: queue.length > 0 ? '1px solid var(--border-soft)' : 'none' }}
          onClick={() => onGoalTap?.(priority.goal)}
        >
          <div className={styles.priorityTop}>
            <span
              className={
                isSaving ? `${styles.statusLabel} ${styles.statusSaving}` : styles.statusLabel
              }
            >
              {isSaving ? t('goal.status_sedang', lang) : t('goal.status_belum', lang)}
            </span>
            <span className={styles.prioritasBadge}>{t('goal.prioritas', lang)}</span>
          </div>
          <div className={styles.priorityName}>{priority.goal.name}</div>
          <div className={styles.goalBar}>
            <div
              className={styles.goalBarFill}
              style={{ width: `${Math.min(100, priority.pct)}%` }}
            />
          </div>
          <div className={styles.progressRow}>
            <span className={styles.progressLeft}>
              {isSaving
                ? `${formatCurrency(priority.saved, currency)} sudah ditabung`
                : t('goal.not_saved', lang)}
            </span>
            <span className={styles.progressRight}>
              {priority.pct}% dari {formatCurrency(priority.goal.target, currency)}
            </span>
          </div>
        </button>

        {/* Queue section */}
        {queue.length > 0 && (
          <>
            <div className={styles.antriHeader}>
              <span className={styles.antriLabel}>{t('goal.antrian_label', lang)}</span>
            </div>
            {queue.map(({ goal }, qi) => {
              const subtext =
                qi === 0
                  ? `Mulai setelah ${priority.goal.name} selesai`
                  : `Menunggu ${qi + 1} giliran lagi`
              return (
                <button
                  key={goal.id}
                  className={styles.queueRow}
                  style={{
                    borderBottom: qi < queue.length - 1 ? '1px solid var(--border-soft)' : 'none',
                  }}
                  onClick={() => onGoalTap?.(goal)}
                >
                  <span className={styles.dragHandle}>≡</span>
                  <div className={styles.queueInfo}>
                    <span className={styles.queueName}>{goal.name}</span>
                    <span className={styles.queueSub}>{subtext}</span>
                  </div>
                  <span className={styles.queueAmt}>{formatCurrency(goal.target, currency)}</span>
                </button>
              )
            })}
          </>
        )}

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
