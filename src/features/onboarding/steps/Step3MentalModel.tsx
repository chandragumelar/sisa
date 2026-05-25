import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './Step3MentalModel.module.css'

interface Props {
  onNext: () => void
}

export function Step3MentalModel({ onNext }: Props) {
  const lang = useLanguage()

  const body1 = t('ob.step3.body1', lang)
  const colonIdx = body1.indexOf(':')
  const eyebrow = colonIdx >= 0 ? body1.slice(0, colonIdx).trim() : ''
  const question = colonIdx >= 0 ? body1.slice(colonIdx + 1).trim() : body1
  const endsQ = question.endsWith('?')
  const questionMain = endsQ ? question.slice(0, -1) : question

  return (
    <>
      <div className="ob-grow" />

      <div className={styles.heading}>{t('ob.step3.heading', lang)}</div>

      <div style={{ height: 28 }} />

      <div className={styles.questionCard}>
        {eyebrow && <div className={styles.questionEyebrow}>{eyebrow}</div>}
        <div className={styles.questionText}>
          &ldquo;{questionMain}
          {endsQ && <span className={styles.questionAccent}>?</span>}&rdquo;
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className={styles.privacyRow}>
        <div className={styles.shieldIcon} aria-hidden="true">
          <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
            <path
              d="M7 1L1 4v5c0 3.5 2.6 6 6 6s6-2.5 6-6V4l-6-3z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <span>{t('ob.step3.body2', lang)}</span>
      </div>

      <div className="ob-grow" />

      <button className={styles.nextBtn} onClick={onNext}>
        <span>{t('ob.step3.next', lang)}</span>
        <span className={styles.nextArrow}>→</span>
      </button>
      <button className="ob-skip" onClick={onNext}>
        {t('ob.step3.skip', lang)}
      </button>
    </>
  )
}
