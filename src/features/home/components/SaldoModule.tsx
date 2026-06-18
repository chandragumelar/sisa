import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
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
  const lang = useLanguage()
  const [infoOpen, setInfoOpen] = useState(false)
  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Header row: label + info btn on left, payday pill on right */}
          <div className={styles.headerRow}>
            <div className={styles.labelGroup}>
              <span className={styles.label}>{t('home.saldo_bebas', lang)}</span>
              <button
                className={styles.infoBtn}
                onClick={() => setInfoOpen(true)}
                aria-label="Cara hitung saldo bebas"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                >
                  <circle cx="6" cy="6" r="5" />
                  <line x1="6" y1="5.5" x2="6" y2="8.5" strokeLinecap="round" />
                  <circle cx="6" cy="3.4" r="0.75" fill="currentColor" stroke="none" />
                </svg>
              </button>
            </div>
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
              <span>
                {(daysUntilPayday === 1
                  ? t('home.day_to_payday', lang)
                  : t('home.days_to_payday', lang)
                ).replace('{n}', String(daysUntilPayday))}
              </span>
            </div>
          </div>

          {/* Hero amount */}
          <div
            className={conditionLabel ? `${styles.heroNum} ${styles.heroNumAlert}` : styles.heroNum}
          >
            {formatCurrency(sisa, currency)}
          </div>

          {/* Condition verdict */}
          {conditionLabel && (
            <div className={styles.conditionText} style={{ color: conditionColor ?? undefined }}>
              {conditionLabel}
            </div>
          )}

          {/* Wallet rows */}
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

          {/* History link only */}
          {onHistoryTap && (
            <>
              <div className={styles.divider} />
              <button className={styles.historyLink} onClick={onHistoryTap}>
                {t('home.history_link', lang)}
              </button>
            </>
          )}
        </div>

        {/* Add wallet — outside card, ghost card style */}
        {onAddWalletTap && (
          <button className={styles.addWalletBtn} onClick={onAddWalletTap}>
            {t('saldo.add_wallet', lang)}
          </button>
        )}
      </div>

      {/* Formula explanation sheet */}
      <BottomSheet
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={t('saldo.formula_title', lang)}
      >
        <p className={styles.formulaIntro}>{t('saldo.formula_intro', lang)}</p>

        <div className={styles.formulaRows}>
          <div className={styles.formulaRow}>
            <span className={styles.formulaLabel}>{t('saldo.formula_total_wallets', lang)}</span>
            <span className={styles.formulaAmt}>{formatCurrency(total, currency)}</span>
          </div>

          {unpaidTagihanTotal > 0 && (
            <div className={styles.formulaRow}>
              <span className={styles.formulaLabel}>
                {t('saldo.formula_bills_label', lang)}
                <span className={styles.formulaSubLabel}>
                  {t('saldo.formula_bills_sublabel', lang)}
                </span>
              </span>
              <span className={`${styles.formulaAmt} ${styles.formulaAmtMinus}`}>
                − {formatCurrency(unpaidTagihanTotal, currency)}
              </span>
            </div>
          )}

          {totalNabung > 0 && (
            <div className={styles.formulaRow}>
              <span className={styles.formulaLabel}>
                {t('saldo.formula_savings_label', lang)}
                <span className={styles.formulaSubLabel}>
                  {t('saldo.formula_savings_sublabel', lang)}
                </span>
              </span>
              <span className={`${styles.formulaAmt} ${styles.formulaAmtMinus}`}>
                − {formatCurrency(totalNabung, currency)}
              </span>
            </div>
          )}

          <div className={`${styles.formulaRow} ${styles.formulaRowTotal}`}>
            <span className={styles.formulaTotalLabel}>{t('saldo.formula_total_label', lang)}</span>
            <span className={styles.formulaTotalAmt}>{formatCurrency(sisa, currency)}</span>
          </div>
        </div>

        <p className={styles.formulaNote}>{t('saldo.formula_note', lang)}</p>
      </BottomSheet>
    </>
  )
}
