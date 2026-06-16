import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './SaldoModule.module.css'

const WALLET_DOTS = ['#60a5fa', '#34d399', '#c084fc', '#fb923c', '#f472b6']

interface Props {
  wallets: Wallet[]
  currency: string
  unpaidTagihanTotal: number
  totalNabung: number
  daysUntilPayday: number
  conditionLabel: string | null
  conditionColor: string | null
  onWalletTap?: (wallet: Wallet) => void
  onHistoryTap?: () => void
  onAddWalletTap?: () => void
}

export function SaldoModule({
  wallets,
  currency,
  unpaidTagihanTotal,
  totalNabung,
  daysUntilPayday,
  conditionLabel,
  conditionColor,
  onWalletTap,
  onHistoryTap,
  onAddWalletTap,
}: Props) {
  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.label}>Saldo Bebas</div>
          <div
            className={conditionLabel ? `${styles.heroNum} ${styles.heroNumAlert}` : styles.heroNum}
          >
            {formatCurrency(sisa, currency)}
          </div>
        </div>
        <div className={styles.topRight}>
          <div className={styles.paydayText}>{daysUntilPayday} hr gajian</div>
          {conditionLabel && (
            <div className={styles.conditionText} style={{ color: conditionColor ?? undefined }}>
              {conditionLabel}
            </div>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.walletList}>
        {wallets.map((w, i) => (
          <button
            key={w.id}
            className={styles.walletRow}
            style={{
              borderBottom: i < wallets.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}
            onClick={() => onWalletTap?.(w)}
          >
            <div className={styles.walletLeft}>
              <span
                className={styles.walletDot}
                style={{ background: WALLET_DOTS[i % WALLET_DOTS.length] }}
              />
              <span className={styles.walletName}>{w.name}</span>
            </div>
            <span className={styles.walletAmt}>{formatCurrency(w.balance, w.currency)}</span>
          </button>
        ))}

        {onAddWalletTap && (
          <button className={styles.addWalletBtn} onClick={onAddWalletTap}>
            + tambah dompet
          </button>
        )}
      </div>

      {(unpaidTagihanTotal > 0 || totalNabung > 0) && (
        <div className={styles.deductionsRow}>
          <span className={styles.deductionsText}>setelah tagihan &amp; nabung</span>
          <span className={styles.deductionsNums}>
            {unpaidTagihanTotal > 0 && `−${formatCurrency(unpaidTagihanTotal, currency)}`}
            {unpaidTagihanTotal > 0 && totalNabung > 0 && ' · '}
            {totalNabung > 0 && `−${formatCurrency(totalNabung, currency)}`}
          </span>
        </div>
      )}

      {onHistoryTap && (
        <div className={styles.historyRow}>
          <button className={styles.historyLink} onClick={onHistoryTap}>
            lihat riwayat →
          </button>
        </div>
      )}
    </div>
  )
}
