import { BottomSheet } from './BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { enablePush } from '@/lib/push'
import styles from './PushAskSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function PushAskSheet({ isOpen, onClose }: Props) {
  const lang = useLanguage()
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('push.ask_title', lang)}>
      <div className={styles.body}>
        <p className={styles.text}>{t('push.ask_body', lang)}</p>
        <button
          className={styles.primaryBtn}
          onClick={() => {
            void enablePush().catch(() => {})
            onClose()
          }}
        >
          {t('push.ask_cta', lang)}
        </button>
        <button className={styles.ghostBtn} onClick={onClose}>
          {t('push.ask_later', lang)}
        </button>
      </div>
    </BottomSheet>
  )
}
