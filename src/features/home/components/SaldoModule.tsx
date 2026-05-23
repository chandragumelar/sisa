import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  unpaidTagihanTotal: number
  totalNabung: number
  yesterdaySpent: number
  yesterdayEarned: number
  onWalletTap?: (wallet: Wallet) => void
}

const MAX_WALLETS_BASIC = 4
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
}: Props) {
  const [expanded, setExpanded] = useState(getExpandedPref)

  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)
  const visible = wallets.slice(0, MAX_WALLETS_BASIC)

  let heroSub = ''
  if (yesterdaySpent > 0) {
    heroSub = `${formatCurrency(yesterdaySpent, currency)} terpakai kemarin`
  } else if (yesterdayEarned > 0) {
    heroSub = `${formatCurrency(yesterdayEarned, currency)} masuk kemarin`
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
      <div className={styles.label}>sisa bulan ini</div>
      <button
        className={styles.heroAmountBtn}
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label="Tap untuk lihat detail dompet"
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
            <div className={styles.empty}>Belum ada dompet</div>
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
            <span className={styles.totalLabel}>Total saldo</span>
            <span className={styles.totalAmount}>{formatCurrency(total, currency)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>− Tagihan bulan ini</span>
            <span className={styles.summaryAmountNeg}>
              {formatCurrency(unpaidTagihanTotal, currency)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>− Tabungan</span>
            <span className={styles.summaryAmountNeg}>{formatCurrency(totalNabung, currency)}</span>
          </div>

          <div className={styles.sisaDivider} />
          <div className={`${styles.summaryRow} ${styles.sisaRow}`}>
            <span className={styles.sisaLabel}>= Sisa bulan ini</span>
            <span className={styles.sisaAmount}>{formatCurrency(sisa, currency)}</span>
          </div>
        </div>
      )}
    </>
  )
}
