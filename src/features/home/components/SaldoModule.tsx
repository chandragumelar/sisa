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
  const hasFooter = unpaidTagihanTotal > 0 || totalNabung > 0 || !!onHistoryTap

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Header row: label + payday pill */}
        <div className={styles.headerRow}>
          <div className={styles.label}>Saldo Bebas</div>
          <div className={styles.paydayPill}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="6" r="4.5" />
              <path d="M6 3.5V6L7.8 7.8" />
            </svg>
            <span>{daysUntilPayday} hri menuju gajian</span>
          </div>
        </div>

        {/* Hero amount */}
        <div
          className={conditionLabel ? `${styles.heroNum} ${styles.heroNumAlert}` : styles.heroNum}
        >
          {formatCurrency(sisa, currency)}
        </div>

        {/* Condition verdict — below amount when present */}
        {conditionLabel && (
          <div className={styles.conditionText} style={{ color: conditionColor ?? undefined }}>
            {conditionLabel}
          </div>
        )}

        {/* Wallet rows — no divider above, sub-info feel */}
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
        </div>

        {/* Footer: full-bleed divider + deductions left, nums+history right */}
        {hasFooter && (
          <>
            <div className={styles.divider} />
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                <span className={styles.deductionsText}>
                  setelah dikurangi tagihan &amp; nabung
                </span>
              </div>
              <div className={styles.footerRight}>
                {(unpaidTagihanTotal > 0 || totalNabung > 0) && (
                  <span className={styles.deductionsNums}>
                    {unpaidTagihanTotal > 0 && `−${formatCurrency(unpaidTagihanTotal, currency)}`}
                    {unpaidTagihanTotal > 0 && totalNabung > 0 && ' · '}
                    {totalNabung > 0 && `−${formatCurrency(totalNabung, currency)}`}
                  </span>
                )}
                {onHistoryTap && (
                  <button className={styles.historyLink} onClick={onHistoryTap}>
                    lihat riwayat →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add wallet — outside card, ghost card style */}
      {onAddWalletTap && (
        <button className={styles.addWalletBtn} onClick={onAddWalletTap}>
          + tambah dompet
        </button>
      )}
    </div>
  )
}
