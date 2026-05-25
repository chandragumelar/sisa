import type { Transaction } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { Language } from '@/db/database'
import styles from './FooterCatatan.module.css'

interface Props {
  lastTransaction: Transaction | undefined
  currency: string
  onShowHistory: () => void
  nowMs: number
}

function relativeTime(ms: number, nowMs: number, lang: Language): string {
  const diff = Math.floor((nowMs - ms) / 60_000)
  if (diff < 60) return t('footer.minutes_ago', lang).replace('{n}', String(diff))
  const hours = Math.floor(diff / 60)
  if (hours < 24) return t('footer.hours_ago', lang).replace('{n}', String(hours))
  const days = Math.floor(hours / 24)
  return t('footer.days_ago', lang).replace('{n}', String(days))
}

export function FooterCatatan({ lastTransaction, currency, onShowHistory, nowMs }: Props) {
  const lang = useLanguage()
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        {lastTransaction ? (
          <>
            <span>{t('footer.last_recorded', lang)}</span>
            <span className={styles.itemName}>
              {lastTransaction.label ?? lastTransaction.note ?? t('footer.tx_fallback', lang)}
            </span>
            <span className={styles.amount}>
              −
              {formatCurrency(
                Math.abs(lastTransaction.amount),
                lastTransaction.currency ?? currency,
              )}
            </span>
            <span>· {relativeTime(lastTransaction.date, nowMs, lang)}</span>
          </>
        ) : (
          <span>{t('footer.no_records', lang)}</span>
        )}
      </div>
      <button className={styles.link} onClick={onShowHistory}>
        {t('footer.all_records', lang)}
      </button>
    </div>
  )
}
