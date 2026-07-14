import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { db } from '@/db/database'
import styles from './DemoBanner.module.css'

const GUMROAD_URL = 'https://pikaxustudio.gumroad.com/l/sisa-app'

export function DemoBanner() {
  const lang = useLanguage()
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    if (resetting) return
    setResetting(true)
    await db.delete()
    window.location.reload()
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>{t('demo.banner.label', lang)}</span>
      <div className={styles.actions}>
        <button className={styles.reset} onClick={handleReset} disabled={resetting}>
          {resetting ? t('demo.banner.resetting', lang) : t('demo.banner.reset', lang)}
        </button>
        <a className={styles.buy} href={GUMROAD_URL} target="_blank" rel="noopener noreferrer">
          {t('demo.banner.buy', lang)}
        </a>
      </div>
    </div>
  )
}
