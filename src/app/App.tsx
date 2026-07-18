import { useEffect, lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { applyTheme } from '@/shared/utils/theme'
import { applyLanguage } from '@/shared/utils/language'
import { refreshRatesIfStale } from '@/shared/utils/fx'
import { sendUsagePing } from '@/lib/supabase/api'
import { UpdateBanner } from './UpdateBanner'
import { LanguageProvider } from './providers/LanguageProvider'
import { useClock } from './providers/useClock'
import { IS_DEMO } from '@/features/demo/demo.constants'

// Literal check (not the IS_DEMO import) so esbuild folds this to `false` and drops the
// dynamic import() entirely in production builds — DemoBanner never enters the prod bundle.
const DemoBanner =
  import.meta.env.VITE_DEMO === '1'
    ? lazy(() => import('@/features/demo/DemoBanner').then((m) => ({ default: m.DemoBanner })))
    : null

// Must match DemoBanner.module.css .bar height — reserves space so the fixed banner
// never covers page headers instead of pushing content down.
const DEMO_BANNER_HEIGHT = '34px'

export function App() {
  const clock = useClock()

  useEffect(() => {
    void sendUsagePing(clock)
  }, [clock])

  useEffect(() => {
    getSettings().then((s) => {
      if (!s) return
      applyTheme(IS_DEMO ? 'dark' : s.theme)
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
      {DemoBanner ? (
        <>
          <Suspense fallback={null}>
            <DemoBanner />
          </Suspense>
          <div
            style={{
              marginTop: DEMO_BANNER_HEIGHT,
              height: `calc(100dvh - ${DEMO_BANNER_HEIGHT})`,
              overflow: 'auto',
            }}
          >
            <RouterProvider router={router} />
          </div>
        </>
      ) : (
        <RouterProvider router={router} />
      )}
      {!IS_DEMO && <UpdateBanner />}
    </LanguageProvider>
  )
}
