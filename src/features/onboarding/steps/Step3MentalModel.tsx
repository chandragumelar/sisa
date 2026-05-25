import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './Step3MentalModel.module.css'

interface Props {
  onNext: () => void
}

export function Step3MentalModel({ onNext }: Props) {
  const lang = useLanguage()
  return (
    <>
      <div className="ob-grow" />

      <p className={styles.creed}>
        {lang === 'en' ? (
          <>
            SISA <strong>isn't a tracker</strong>.
            <br />
            <br />
            One question: <span className={styles.question}>can I buy this right now?</span>
            <br />
            <br />
            Your data stays <strong>on your phone</strong>, not the cloud.
          </>
        ) : (
          <>
            SISA <strong>bukan tracker</strong>.
            <br />
            <br />
            app jawab satu hal:{' '}
            <span className={styles.question}>aman ga gue beli ini sekarang?</span>
            <br />
            <br />
            Data lo <strong>di HP lo</strong>, bukan cloud.
          </>
        )}
      </p>

      <div className="ob-grow" />

      <button className="ob-primary-btn" onClick={onNext}>
        {t('ob.step3.next', lang)}
      </button>
      <button className="ob-skip" onClick={onNext}>
        {t('ob.step3.skip', lang)}
      </button>
    </>
  )
}
