import { type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'

/**
 * Guards the home route: redirect to /onboarding if setup isn't done.
 *
 * Placeholder — always returns false until Sprint 3 wires up the DB check.
 * Sprint 3: replace the stub with `await db.settings.get(1)` via a repository.
 */
function useOnboardingCompleted(): boolean {
  // TODO(sprint-3): read from db.settings singleton via settingsRepository
  return false
}

function RequireOnboarding({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (!completed) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

/**
 * Guards the onboarding route: redirect to / if onboarding already done.
 * Prevents re-entering onboarding after completing it.
 */
function RequireSetupPending({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (completed) return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireOnboarding>
        <HomePage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <RequireSetupPending>
        <OnboardingPage />
      </RequireSetupPending>
    ),
  },
])
