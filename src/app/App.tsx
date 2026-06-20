import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { getSettings } from '@/db/settings.repository'
import { applyTheme } from '@/shared/utils/theme'
import { applyLanguage } from '@/shared/utils/language'
import { UpdateBanner } from './UpdateBanner'
import { LanguageProvider } from './providers/LanguageProvider'
import { SharedProfileProvider } from '@/features/shared-profile/SharedProfileContext'

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
    <LanguageProvider>
      <SharedProfileProvider>
        <RouterProvider router={router} />
        <UpdateBanner />
      </SharedProfileProvider>
    </LanguageProvider>
  )
}
