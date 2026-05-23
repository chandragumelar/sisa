import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  yesterdaySpent: number
  yesterdayEarned: number
  onWalletTap?: (wallet: Wallet) => void
}

const MAX_WALLETS_BASIC = 4

export function SaldoModule({
  wallets,
  currency,
  yesterdaySpent,
  yesterdayEarned,
  onWalletTap,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const visible = wallets.slice(0, MAX_WALLETS_BASIC)

  let heroSub = ''
  if (yesterdaySpent > 0) {
    heroSub = `${formatCurrency(yesterdaySpent, currency)} terpakai kemarin`
  } else if (yesterdayEarned > 0) {
    heroSub = `${formatCurrency(yesterdayEarned, currency)} masuk kemarin`
  }

  return (
    <>
      <div className={styles.label}>saldo total</div>
      <button
        className={styles.heroAmountBtn}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label="Tap untuk lihat detail dompet"
      >
        <span className={styles.heroAmount}>{formatCurrency(total, currency)}</span>
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
        </div>
      )}
    </>
  )
}
