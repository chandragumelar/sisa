import { type ReactNode } from 'react'
import type { OnboardingStep } from '../onboarding.types'
import { getProgressCount, TOTAL_PROGRESS_DOTS } from '../onboarding.utils'
import styles from './OnboardingShell.module.css'

interface OnboardingShellProps {
  step: OnboardingStep
  children: ReactNode
}

export function OnboardingShell({ step, children }: OnboardingShellProps) {
  const filled = getProgressCount(step)
  const filledStr = String(filled).padStart(2, '0')
  const totalStr = String(TOTAL_PROGRESS_DOTS).padStart(2, '0')

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.segments} aria-hidden="true">
          {Array.from({ length: TOTAL_PROGRESS_DOTS }, (_, i) => (
            <span key={i} className={i < filled ? styles.segmentActive : styles.segment} />
          ))}
        </div>
        <div className={styles.stepLabel}>
          {filledStr} / {totalStr}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
