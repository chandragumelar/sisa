import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  unpaidTagihanTotal: number
  totalNabung: number
  onWalletTap?: (wallet: Wallet) => void
  onWalletManageTap?: () => void
}

function fmtShort(amount: number, currency: string): string {
  if (currency !== 'IDR') return formatCurrency(amount, currency)
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000
    return `Rp ${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1).replace('.0', '')}jt`
  }
  if (amount >= 1_000) return `Rp ${Math.round(amount / 1_000)}rb`
  return `Rp ${amount}`
}

export function SaldoModule({
  wallets,
  currency,
  unpaidTagihanTotal,
  totalNabung,
  onWalletTap,
  onWalletManageTap,
}: Props) {
  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)

  const [rpPrefix, sisaNum] = (() => {
    const fmt = formatCurrency(Math.abs(sisa), currency)
    if (fmt.startsWith('Rp')) return [sisa < 0 ? '−Rp' : 'Rp', fmt.slice(2).trim()]
    return ['', sisa < 0 ? `−${fmt}` : fmt]
  })()

  const showSub = unpaidTagihanTotal > 0 || totalNabung > 0

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.label}>saldo bebas</span>
        <button className={styles.walletLink} onClick={onWalletManageTap}>
          {wallets.length} dompet ›
        </button>
      </div>

      <div className={styles.hero}>
        <span className={styles.heroRp}>{rpPrefix}</span>
        <span className={styles.heroNum}>{sisaNum}</span>
      </div>

      {showSub && (
        <div className={styles.sub}>
          setelah tagihan {fmtShort(unpaidTagihanTotal, currency)} &amp; nabung{' '}
          {fmtShort(totalNabung, currency)}
        </div>
      )}

      {wallets.length > 0 && (
        <div className={styles.chips}>
          {wallets.map((w) => (
            <button key={w.id} className={styles.chip} onClick={() => onWalletTap?.(w)}>
              <span className={styles.chipName}>{w.name}</span>
              <span className={styles.chipAmt}>{fmtShort(w.balance, w.currency)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
