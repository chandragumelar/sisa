import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { applyTheme } from '@/shared/utils/theme'
import { applyLanguage } from '@/shared/utils/language'
import { refreshRatesIfStale } from '@/shared/utils/fx'
import { UpdateBanner } from './UpdateBanner'
import { LanguageProvider } from './providers/LanguageProvider'
import { SharedProfileProvider } from '@/features/shared-profile/SharedProfileContext'

export function App() {
  useEffect(() => {
    getSettings().then((s) => {
      if (!s) return
      applyTheme(s.theme)
      applyLanguage(s.language)
      if (!s.onboardingCompleted) return
      // Non-blocking FX rate refresh — run after theme/language are applied
      Promise.all([getAllWallets(), getActiveTagihan()]).then(([wallets, tagihan]) => {
        const foreign = [
          ...new Set(
            [...wallets.map((w) => w.currency), ...tagihan.map((tg) => tg.currency)].filter(
              (c) => c !== s.primaryCurrency,
            ),
          ),
        ]
        if (foreign.length > 0) {
          void refreshRatesIfStale(s.primaryCurrency, foreign)
        }
      })
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
