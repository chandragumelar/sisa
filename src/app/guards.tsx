import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Placeholder: always returns false until Sprint 3 wires up the DB check.
 * Sprint 3: replace with `settingsRepository.get()` to read onboardingCompleted.
 */
function useOnboardingCompleted(): boolean {
  // TODO(sprint-3): read from settingsRepository
  return false
}

/** Redirect to /onboarding if setup isn't done. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (!completed) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

/** Redirect to / if onboarding is already done. */
export function RequireSetupPending({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (completed) return <Navigate to="/" replace />
  return <>{children}</>
}
