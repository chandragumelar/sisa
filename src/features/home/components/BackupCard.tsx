import { useState } from 'react'
import styles from './BackupCard.module.css'

interface Props {
  urgency?: 'normal' | 'high'
  onDismiss: () => void
}

function BackupGuideSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetTitle}>Cara backup data SISA</div>

        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepText}>
            Buka <strong>Pengaturan → Backup & Ekspor</strong> di menu bawah.
          </span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepText}>
            Ketuk <strong>Ekspor data</strong> — file <code>.json</code> akan tersimpan ke perangkat
            lo.
          </span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <span className={styles.stepText}>
            Simpan file itu di Google Drive, iCloud, atau mana saja yang lo percaya. Kalau ganti HP,
            impor lagi dari sana.
          </span>
        </div>

        <button className={styles.sheetClose} onClick={onClose}>
          Oke, ngerti
        </button>
      </div>
    </div>
  )
}

export function BackupCard({ urgency = 'normal', onDismiss }: Props) {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <div className={urgency === 'high' ? `${styles.card} ${styles.cardHigh}` : styles.card}>
        <span className={styles.icon}>💾</span>
        <div className={styles.body}>
          <div className={styles.title}>
            {urgency === 'high' ? 'Sudah lama gak backup!' : 'Backup data lo'}
          </div>
          <div className={styles.desc}>
            Data SISA tersimpan di HP ini. Kalau ganti HP tanpa backup, data hilang.
          </div>
          <div className={styles.actions}>
            <button className={styles.btnGuide} onClick={() => setGuideOpen(true)}>
              Cara backup ›
            </button>
            <button className={styles.btnDismiss} onClick={onDismiss}>
              Tutup
            </button>
          </div>
        </div>
      </div>

      {guideOpen && <BackupGuideSheet onClose={() => setGuideOpen(false)} />}
    </>
  )
}
