import type { Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  yesterdaySpent: number
  yesterdayEarned: number
}

const MAX_WALLETS_BASIC = 4

export function SaldoModule({ wallets, currency, yesterdaySpent, yesterdayEarned }: Props) {
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
      <div className={styles.heroAmount}>{formatCurrency(total, currency)}</div>
      {heroSub && <div className={styles.heroSub}>{heroSub}</div>}

      <div className={styles.walletCard}>
        {visible.length === 0 ? (
          <div className={styles.empty}>Belum ada dompet</div>
        ) : (
          visible.map((w) => (
            <div key={w.id} className={styles.walletRow}>
              <span className={styles.walletName}>{w.name}</span>
              <span className={styles.walletAmount}>{formatCurrency(w.balance, w.currency)}</span>
            </div>
          ))
        )}
      </div>
    </>
  )
}
