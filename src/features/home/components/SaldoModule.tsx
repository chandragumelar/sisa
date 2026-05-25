import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  unpaidTagihanTotal: number
  totalNabung: number
  yesterdaySpent: number
  yesterdayEarned: number
  onWalletTap?: (wallet: Wallet) => void
  onAddWalletTap?: () => void
}

const SALDO_EXPANDED_KEY = 'sisa:saldoExpanded'

function getExpandedPref(): boolean {
  try {
    return localStorage.getItem(SALDO_EXPANDED_KEY) !== 'false'
  } catch {
    return true
  }
}

export function SaldoModule({
  wallets,
  currency,
  unpaidTagihanTotal,
  totalNabung,
  yesterdaySpent,
  yesterdayEarned,
  onWalletTap,
  onAddWalletTap,
}: Props) {
  const lang = useLanguage()
  const [expanded, setExpanded] = useState(getExpandedPref)

  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)
  const visible = wallets

  let heroSub = ''
  if (yesterdaySpent > 0) {
    heroSub = t('saldo.spent_yesterday', lang).replace(
      '{amount}',
      formatCurrency(yesterdaySpent, currency),
    )
  } else if (yesterdayEarned > 0) {
    heroSub = t('saldo.income_yesterday', lang).replace(
      '{amount}',
      formatCurrency(yesterdayEarned, currency),
    )
  }

  function handleToggle() {
    setExpanded((e) => {
      const next = !e
      localStorage.setItem(SALDO_EXPANDED_KEY, String(next))
      return next
    })
  }

  return (
    <>
      <div className={styles.label}>{t('saldo.title', lang)}</div>
      <button
        className={styles.heroAmountBtn}
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label={t('saldo.toggle_aria', lang)}
      >
        <span className={styles.heroAmount}>{formatCurrency(sisa, currency)}</span>
        <svg
          className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {heroSub && <div className={styles.heroSub}>{heroSub}</div>}

      {expanded && (
        <div className={styles.walletCard}>
          {visible.length === 0 ? (
            <div className={styles.empty}>{t('saldo.no_wallets', lang)}</div>
          ) : (
            visible.map((w) => (
              <button
                key={w.id}
                className={styles.walletRow}
                onClick={() => onWalletTap?.(w)}
                disabled={!onWalletTap}
              >
                <span className={styles.walletName}>{w.name}</span>
                <span className={styles.walletAmount}>{formatCurrency(w.balance, w.currency)}</span>
              </button>
            ))
          )}

          <div className={styles.summaryDivider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span className={styles.totalLabel}>{t('saldo.total', lang)}</span>
            <span className={styles.totalAmount}>{formatCurrency(total, currency)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('saldo.tagihan', lang)}</span>
            <span className={styles.summaryAmountNeg}>
              {formatCurrency(unpaidTagihanTotal, currency)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('saldo.nabung', lang)}</span>
            <span className={styles.summaryAmountNeg}>{formatCurrency(totalNabung, currency)}</span>
          </div>

          <div className={styles.sisaDivider} />
          <div className={`${styles.summaryRow} ${styles.sisaRow}`}>
            <span className={styles.sisaLabel}>{t('saldo.sisa', lang)}</span>
            <span className={styles.sisaAmount}>{formatCurrency(sisa, currency)}</span>
          </div>

          <button className={styles.addBtn} onClick={onAddWalletTap}>
            {t('saldo.add_wallet', lang)}
          </button>
        </div>
      )}
    </>
  )
}
