import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  onNext: () => void
}

export function StepInstallGuide({ onNext }: Props) {
  const lang = useLanguage()

  return (
    <>
      <h1 className="ob-heading">{t('ob.install.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.install.sub', lang)}</p>

      <div className="ob-install-section">
        <p className="ob-install-label">{t('ob.install.ios_label', lang)}</p>
        <p className="ob-install-steps">{t('ob.install.ios_steps', lang)}</p>
      </div>

      <div className="ob-install-section">
        <p className="ob-install-label">{t('ob.install.android_label', lang)}</p>
        <p className="ob-install-steps">{t('ob.install.android_steps', lang)}</p>
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
