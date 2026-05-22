import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { RequireOnboarding, RequireSetupPending } from './guards'

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
