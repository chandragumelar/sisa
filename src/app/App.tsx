import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { getSettings } from '@/db/settings.repository'
import { applyTheme } from '@/shared/utils/theme'
import { applyLanguage } from '@/shared/utils/language'
import { UpdateBanner } from './UpdateBanner'
import { LanguageProvider } from './providers/LanguageProvider'
import { PwaInstallProvider } from './providers/PwaInstallProvider'

export function App() {
  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        applyTheme(s.theme)
        applyLanguage(s.language)
      }
    })
  }, [])

  return (
    <PwaInstallProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
        <UpdateBanner />
      </LanguageProvider>
    </PwaInstallProvider>
  )
}
