import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { usePwaInstall } from '@/app/providers/usePwaInstall'
import { t } from '@/shared/strings/strings'
import styles from './StepPwaInstall.module.css'

interface Props {
  onNext: () => void
}

export function StepPwaInstall({ onNext }: Props) {
  const lang = useLanguage()
  const { deferredPrompt, clearPrompt } = usePwaInstall()
  const [showTooltip, setShowTooltip] = useState(false)

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      clearPrompt()
      onNext()
    } else if (navigator.share) {
      try {
        await navigator.share({ url: window.location.href })
      } catch {
        // user cancelled the share sheet — still advance
      }
      onNext()
    } else {
      setShowTooltip(true)
    }
  }

  return (
    <>
      <h1 className="ob-heading">{t('ob.pwa_install.heading', lang)}</h1>

      <div className={styles.card}>
        <p className={styles.platform}>{t('ob.pwa_install.ios_label', lang)}</p>
        <ol className={styles.steps}>
          <li>{t('ob.pwa_install.ios_step1', lang)}</li>
          <li>{t('ob.pwa_install.ios_step2', lang)}</li>
          <li>{t('ob.pwa_install.ios_step3', lang)}</li>
        </ol>
        <p className={styles.hint}>{t('ob.pwa_install.ios_hint', lang)}</p>
      </div>

      <div className={styles.card}>
        <p className={styles.platform}>{t('ob.pwa_install.android_label', lang)}</p>
        <ol className={styles.steps}>
          <li>{t('ob.pwa_install.android_step1', lang)}</li>
          <li>{t('ob.pwa_install.android_step2', lang)}</li>
          <li>{t('ob.pwa_install.android_step3', lang)}</li>
        </ol>
      </div>

      <div className="ob-grow" />

      <button className="ob-primary-btn" onClick={handleInstall}>
        {t('ob.pwa_install.cta', lang)}
      </button>
      {showTooltip && <p className={styles.tooltip}>{t('ob.pwa_install.tooltip', lang)}</p>}
      <button className="ob-skip" onClick={onNext}>
        {t('ob.pwa_install.skip', lang)}
      </button>
    </>
  )
}
