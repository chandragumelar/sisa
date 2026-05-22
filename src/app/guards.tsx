import { useState, useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getSettings } from '@/db/settings.repository'

function useOnboardingCompleted(): boolean | null {
  const [completed, setCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    getSettings()
      .then((settings) => {
        if (!cancelled) setCompleted(settings?.onboardingCompleted ?? false)
      })
      .catch(() => {
        if (!cancelled) setCompleted(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return completed
}

/** Redirect to /onboarding if setup isn't done yet. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (completed === null) return null
  if (!completed) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

/** Redirect to / if onboarding is already done. */
export function RequireSetupPending({ children }: { children: ReactNode }) {
  const completed = useOnboardingCompleted()
  if (completed === null) return null
  if (completed) return <Navigate to="/" replace />
  return <>{children}</>
}
