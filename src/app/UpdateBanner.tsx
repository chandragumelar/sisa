import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import styles from './UpdateBanner.module.css'

export function UpdateBanner() {
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
      <span className={styles.msg}>versi baru tersedia</span>
      <button
        className={styles.reloadBtn}
        onClick={() => {
          setVisible(false)
          updateServiceWorker(true)
        }}
      >
        muat ulang ›
      </button>
      <button className={styles.dismissBtn} onClick={() => setVisible(false)} aria-label="Tutup">
        ✕
      </button>
    </div>
  )
}
