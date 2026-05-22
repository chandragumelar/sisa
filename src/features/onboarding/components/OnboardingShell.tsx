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

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className={styles.wordmark}>SISA</span>
        <div className={styles.progress} aria-hidden="true">
          {Array.from({ length: TOTAL_PROGRESS_DOTS }, (_, i) => (
            <span key={i} className={i < filled ? styles.dotActive : styles.dot} />
          ))}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
