import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { CekDuluPage } from '@/features/cekDulu/CekDuluPage'
import { AndaiPage } from '@/features/andai/AndaiPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
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
  {
    path: '/cek-dulu',
    element: (
      <RequireOnboarding>
        <CekDuluPage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/andai',
    element: (
      <RequireOnboarding>
        <AndaiPage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/settings',
    element: (
      <RequireOnboarding>
        <SettingsPage />
      </RequireOnboarding>
    ),
  },
])
