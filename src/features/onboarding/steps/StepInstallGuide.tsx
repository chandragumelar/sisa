import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './StepInstallGuide.module.css'

interface Props {
  onNext: () => void
}

export function StepInstallGuide({ onNext }: Props) {
  const lang = useLanguage()

  return (
    <>
      <h1 className="ob-heading">{t('ob.install.heading', lang)}</h1>

      <div className={styles.card}>
        <p className={styles.platform}>{t('ob.install.ios_label', lang)}</p>
        <ol className={styles.steps}>
          <li>{t('ob.install.ios_step1', lang)}</li>
          <li>{t('ob.install.ios_step2', lang)}</li>
          <li>{t('ob.install.ios_step3', lang)}</li>
        </ol>
        <p className={styles.hint}>{t('ob.install.ios_hint', lang)}</p>
      </div>

      <div className={styles.card}>
        <p className={styles.platform}>{t('ob.install.android_label', lang)}</p>
        <ol className={styles.steps}>
          <li>{t('ob.install.android_step1', lang)}</li>
          <li>{t('ob.install.android_step2', lang)}</li>
          <li>{t('ob.install.android_step3', lang)}</li>
        </ol>
      </div>

      <div className="ob-grow" />

      <button className="ob-primary-btn" onClick={onNext}>
        {t('ob.install.cta', lang)}
      </button>
      <button className="ob-skip" onClick={onNext}>
        {t('ob.install.skip', lang)}
      </button>
    </>
  )
}
