import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { CekDuluPage } from '@/features/cekDulu/CekDuluPage'
import { AndaiPage } from '@/features/andai/AndaiPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AjakPasanganPage } from '@/features/shared-profile/AjakPasanganPage'
import { GabungKodePage } from '@/features/shared-profile/GabungKodePage'
import { BerbagiKeamananPage } from '@/features/shared-profile/BerbagiKeamananPage'
import { PulihkanPage } from '@/features/shared-profile/PulihkanPage'
import { InsightPage } from '@/features/insight/InsightPage'
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
  {
    path: '/ajak-pasangan',
    element: (
      <RequireOnboarding>
        <AjakPasanganPage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/gabung-kode',
    element: (
      <RequireOnboarding>
        <GabungKodePage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/berbagi-keamanan',
    element: (
      <RequireOnboarding>
        <BerbagiKeamananPage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/pulihkan',
    element: (
      <RequireOnboarding>
        <PulihkanPage />
      </RequireOnboarding>
    ),
  },
  {
    path: '/insight',
    element: (
      <RequireOnboarding>
        <InsightPage />
      </RequireOnboarding>
    ),
  },
])
