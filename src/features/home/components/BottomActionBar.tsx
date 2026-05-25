import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './BottomActionBar.module.css'

interface Props {
  onCatat: () => void
  onCekDulu: () => void
  onAndai: () => void
}

function haptic(style: 'light' | 'medium') {
  if (!navigator.vibrate) return
  navigator.vibrate(style === 'light' ? 10 : 20)
}

export function BottomActionBar({ onCatat, onCekDulu, onAndai }: Props) {
  const lang = useLanguage()
  return (
    <div className={styles.bar}>
      <button
        className={styles.sideBtn}
        onClick={() => {
          haptic('light')
          onCatat()
        }}
        aria-label={t('actions.log_aria', lang)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className={styles.sideLabel}>{t('actions.log_label', lang)}</span>
      </button>

      <button
        className={styles.cekBtn}
        onClick={() => {
          haptic('medium')
          onCekDulu()
        }}
        aria-label={t('actions.cek_aria', lang)}
      >
        <span className={styles.cekLabel}>{t('actions.cek_label', lang)}</span>
        <span className={styles.cekSub}>{t('actions.cek_sub', lang)}</span>
      </button>

      <button
        className={styles.sideBtn}
        onClick={() => {
          haptic('light')
          onAndai()
        }}
        aria-label={t('actions.andai_aria', lang)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="18" r="2" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <path d="M18 8v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8" />
          <line x1="12" y1="11" x2="12" y2="16" />
        </svg>
        <span className={styles.sideLabel}>{t('actions.andai_label', lang)}</span>
      </button>
    </div>
  )
}
