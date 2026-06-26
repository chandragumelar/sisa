import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useLanguage } from './providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './UpdateBanner.module.css'

const BUILD_KEY = 'sisa_build_v'

export function UpdateBanner() {
  const lang = useLanguage()
  const [visible, setVisible] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {},
    onRegisterError() {},
  })

  // Case 1: new SW is installing and waiting (user has app open during deploy)
  useEffect(() => {
    if (needRefresh) setVisible(true)
  }, [needRefresh])

  // Case 2: SW already activated silently (app was closed/backgrounded during deploy)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BUILD_KEY)
      if (!stored) {
        localStorage.setItem(BUILD_KEY, __BUILD_TIME__)
      } else if (stored !== __BUILD_TIME__) {
        localStorage.setItem(BUILD_KEY, __BUILD_TIME__)
        setVisible(true)
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — skip silently
    }
  }, [])

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <span className={styles.msg}>{t('update_banner.msg', lang)}</span>
      <button
        className={styles.reloadBtn}
        onClick={() => {
          setVisible(false)
          updateServiceWorker(true)
          // Fallback reload if no waiting SW (SW already activated silently)
          setTimeout(() => window.location.reload(), 200)
        }}
      >
        {t('update_banner.reload', lang)}
      </button>
      <button
        className={styles.dismissBtn}
        onClick={() => setVisible(false)}
        aria-label={t('common.close', lang)}
      >
        ✕
      </button>
    </div>
  )
}
