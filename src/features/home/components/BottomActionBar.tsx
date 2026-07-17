import { TrendingUp, Plus } from 'lucide-react'
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
        onClick={() => navigate('/insight', { viewTransition: true })}
        aria-label={t('insight.nav_aria', lang)}
      >
        <TrendingUp size={18} strokeWidth={1.6} />
      </button>
      <button
        className={styles.catatBtn}
        onClick={() => {
          haptic()
          onCatat()
        }}
        aria-label={t('actions.log_aria', lang)}
      >
        <Plus size={15} strokeWidth={1.75} />
        <span>{t('actions.log_full_label', lang)}</span>
      </button>
    </div>
  )
}
