import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useLanguage } from './providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './UpdateBanner.module.css'

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

  useEffect(() => {
    if (needRefresh) setVisible(true)
  }, [needRefresh])

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <span className={styles.msg}>{t('update_banner.msg', lang)}</span>
      <button
        className={styles.reloadBtn}
        onClick={() => {
          setVisible(false)
          updateServiceWorker(true)
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
