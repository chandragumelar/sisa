import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './PaydayConfirmCard.module.css'

interface Props {
  onYes: () => void
  onNo: () => void
}

export function PaydayConfirmCard({ onYes, onNo }: Props) {
  const lang = useLanguage()

  return (
    <div className={styles.card}>
      <div className={styles.title}>{t('home.payday_confirm_title', lang)}</div>
      <div className={styles.sub}>{t('home.payday_confirm_sub', lang)}</div>
      <div className={styles.actions}>
        <button className={styles.btnNo} onClick={onNo}>
          {t('home.payday_confirm_no', lang)}
        </button>
        <button className={styles.btnYes} onClick={onYes}>
          {t('home.payday_confirm_yes', lang)}
        </button>
      </div>
    </div>
  )
}
