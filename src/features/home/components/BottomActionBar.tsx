import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './BottomActionBar.module.css'

interface Props {
  onCatat: () => void
}

function haptic() {
  if (!navigator.vibrate) return
  navigator.vibrate(10)
}

export function BottomActionBar({ onCatat }: Props) {
  const lang = useLanguage()
  return (
    <div className={styles.bar}>
      <button
        className={styles.catatBtn}
        onClick={() => {
          haptic()
          onCatat()
        }}
        aria-label={t('actions.log_aria', lang)}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="8" y1="3" x2="8" y2="13" />
          <line x1="3" y1="8" x2="13" y2="8" />
        </svg>
        <span>{t('actions.log_full_label', lang)}</span>
      </button>
    </div>
  )
}
