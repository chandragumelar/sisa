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

        {lang === 'en' ? (
          <>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span className={styles.stepText}>
                Open <strong>Settings → Data & Backup</strong> from the bottom menu.
              </span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span className={styles.stepText}>
                Tap <strong>Export backup</strong> — a <code>.json</code> file will be saved to your
                device.
              </span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span className={styles.stepText}>
                Store it in Google Drive, iCloud, or anywhere you trust. If you switch phones,
                import it from there.
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span className={styles.stepText}>
                Buka <strong>Pengaturan → Backup & Ekspor</strong> di menu bawah.
              </span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span className={styles.stepText}>
                Ketuk <strong>Ekspor data</strong> — file <code>.json</code> akan tersimpan ke
                perangkat lo.
              </span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span className={styles.stepText}>
                Simpan file itu di Google Drive, iCloud, atau mana saja yang lo percaya. Kalau ganti
                HP, impor lagi dari sana.
              </span>
            </div>
          </>
        )}

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
