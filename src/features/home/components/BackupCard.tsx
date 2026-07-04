import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './BackupCard.module.css'

interface Props {
  urgency?: 'normal' | 'high'
  onDismiss: () => void
}

function BackupGuideSheet({ onClose }: { onClose: () => void }) {
  const lang = useLanguage()
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetTitle}>{t('backup.guide_title', lang)}</div>

        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepText}>
            {t('backup.guide_s1a', lang)} <strong>{t('backup.guide_s1_strong', lang)}</strong>{' '}
            {t('backup.guide_s1b', lang)}
          </span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepText}>
            {t('backup.guide_s2a', lang)} <strong>{t('backup.guide_s2_strong', lang)}</strong>{' '}
            {t('backup.guide_s2b', lang)}
          </span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <span className={styles.stepText}>{t('backup.guide_s3', lang)}</span>
        </div>

        <button className={styles.sheetClose} onClick={onClose}>
          {t('backup.guide_got_it', lang)}
        </button>
      </div>
    </div>
  )
}

export function BackupCard({ urgency = 'normal', onDismiss }: Props) {
  const lang = useLanguage()
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <div className={urgency === 'high' ? `${styles.card} ${styles.cardHigh}` : styles.card}>
        <span className={styles.icon}>💾</span>
        <div className={styles.body}>
          <div className={styles.title}>
            {urgency === 'high' ? t('backup.title_urgent', lang) : t('backup.title_normal', lang)}
          </div>
          <div className={styles.desc}>{t('backup.desc', lang)}</div>
          <div className={styles.actions}>
            <button className={styles.btnGuide} onClick={() => setGuideOpen(true)}>
              {t('backup.guide_btn', lang)}
            </button>
            <button className={styles.btnDismiss} onClick={onDismiss}>
              {t('common.close', lang)}
            </button>
          </div>
        </div>
      </div>

      {guideOpen && <BackupGuideSheet onClose={() => setGuideOpen(false)} />}
    </>
  )
}
