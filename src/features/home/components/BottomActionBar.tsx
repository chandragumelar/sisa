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
      <div className={styles.container}>
        <button
          className={styles.sideBtn}
          onClick={() => {
            haptic('light')
            onCatat()
          }}
          aria-label={t('actions.log_aria', lang)}
        >
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
          <span className={styles.sideLabel}>{t('actions.andai_label', lang)}</span>
        </button>
      </div>
    </div>
  )
}
