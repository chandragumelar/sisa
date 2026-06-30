import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { formatTxDate } from './insight.utils'
import type { TopTx } from './insight.utils'
import styles from './InsightPage.module.css'

interface Props {
  currTop: TopTx[]
  prevTop: TopTx[]
  currency: string
  currMonthShort: string
  prevMonthShort: string
  lang: Language
}

export function InsightTopTxCard({
  currTop,
  prevTop,
  currency,
  currMonthShort,
  prevMonthShort,
  lang,
}: Props) {
  if (currTop.length === 0 && prevTop.length === 0) {
    return (
      <div className={styles.card}>
        <span className={styles.cardLabel}>{t('insight.card_top_tx', lang)}</span>
        <div className={styles.emptyBlock}>
          <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.top_tx_empty', lang)}
          </p>
          <p className={styles.emptySub}>{t('insight.top_tx_empty_sub', lang)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.card} ${styles.cardFlush}`}>
      <div className={`${styles.cardLabel} ${styles.cardFlushPad}`}>
        {t('insight.card_top_tx', lang)}
      </div>

      {currTop.length > 0 && (
        <>
          <div className={`${styles.txSectionLabel} ${styles.cardFlushPad}`}>{currMonthShort}</div>
          {currTop.map((tx, i) => (
            <div
              key={i}
              className={styles.txRow}
              style={{
                borderBottom: i < currTop.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <span className={styles.txRank}>{i + 1}</span>
              <div className={styles.txInfo}>
                <div className={styles.txName}>{tx.label}</div>
                <div className={styles.txDate}>{formatTxDate(tx.date, lang)}</div>
              </div>
              <span className={styles.txAmt}>{formatCurrency(tx.amount, currency)}</span>
            </div>
          ))}
        </>
      )}

      {prevTop.length > 0 && (
        <>
          <div className={styles.hdiv} style={{ margin: '4px 0 0' }} />
          <div
            className={`${styles.txSectionLabel} ${styles.cardFlushPad} ${styles.txSectionLabelMuted}`}
          >
            {prevMonthShort}
          </div>
          {prevTop.map((tx, i) => (
            <div
              key={i}
              className={`${styles.txRow} ${styles.txRowMuted}`}
              style={{
                borderBottom: i < prevTop.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <span className={styles.txRank}>{i + 1}</span>
              <div className={styles.txInfo}>
                <div className={styles.txName}>{tx.label}</div>
                <div className={styles.txDate}>{formatTxDate(tx.date, lang)}</div>
              </div>
              <span className={styles.txAmt}>{formatCurrency(tx.amount, currency)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
