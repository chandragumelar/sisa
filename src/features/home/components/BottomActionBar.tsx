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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--ink-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
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
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--ink-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3H3v3" />
            <path d="M10 13h3v-3" />
            <path d="M3 6c0 3.5 2.5 5.5 5 7" />
            <path d="M13 10c0-3.5-2.5-5.5-5-7" />
          </svg>
          <span className={styles.sideLabel}>{t('actions.andai_label', lang)}</span>
        </button>
      </div>
    </div>
  )
}
