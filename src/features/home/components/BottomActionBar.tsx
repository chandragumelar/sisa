import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  return (
    <div className={styles.bar}>
      <button
        className={styles.insightBtn}
        onClick={() => navigate('/insight')}
        aria-label={t('insight.nav_aria', lang)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      </button>
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
