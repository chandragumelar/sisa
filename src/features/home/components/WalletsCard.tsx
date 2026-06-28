import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './WalletsCard.module.css'

export const WALLET_DOTS = ['#60a5fa', '#f97316', '#34d399', '#a78bfa', '#f472b6']

const MAX_VISIBLE = 4

interface Props {
  wallets: Wallet[]
  currency: string
  totalSaldo: number
  onWalletTap: (w: Wallet) => void
  onAddWallet: () => void
}

export function WalletsCard({ wallets, currency, totalSaldo, onWalletTap, onAddWallet }: Props) {
  const lang = useLanguage()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (wallets.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.headRow}>
            <span className={styles.modLabel}>{t('home.dompet', lang)}</span>
          </div>
        </div>
        <div className={styles.emptyBody}>
          <div className={styles.emptyIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="var(--ink-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="16" height="12" rx="2" />
              <path d="M2 9h16" />
              <circle cx="14.5" cy="13" r="1" fill="var(--ink-tertiary)" stroke="none" />
            </svg>
          </div>
          <span className={styles.emptyTitle}>{t('home.wallets_empty_title', lang)}</span>
          <span className={styles.emptySub}>{t('home.wallets_empty_sub', lang)}</span>
          <button className={styles.emptyCta} onClick={onAddWallet}>
            {t('home.tambah_dompet', lang)}
          </button>
        </div>
      </div>
    )
  }

  const visible = wallets.slice(0, MAX_VISIBLE)
  const hiddenCount = wallets.length - MAX_VISIBLE

  return (
    <>
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.headRow}>
            <span className={styles.modLabel}>{t('home.dompet', lang)}</span>
            <button className={styles.addBtn} onClick={onAddWallet} aria-label="Tambah dompet">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--ink-secondary)"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M7 2.5v9M2.5 7h9" />
              </svg>
            </button>
          </div>
          <div className={styles.totalLbl}>{t('saldo.total_saldo_label', lang)}</div>
          <div className={styles.totalAmt}>{formatCurrency(totalSaldo, currency)}</div>
        </div>
        <div className={styles.divider} />
        {visible.map((w, i) => (
          <button key={w.id} className={styles.wRow} onClick={() => onWalletTap(w)}>
            <span
              className={styles.dot}
              style={{ background: WALLET_DOTS[i % WALLET_DOTS.length] }}
            />
            <span className={styles.wName}>{w.name}</span>
            <span className={styles.wAmt}>{formatCurrency(w.balance, w.currency)}</span>
          </button>
        ))}
        {hiddenCount > 0 && (
          <button className={styles.moreRow} onClick={() => setSheetOpen(true)}>
            <span className={styles.moreLbl}>
              {t('home.wallets_more', lang).replace('{n}', String(hiddenCount))}
            </span>
            <span className={styles.moreChev}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 3l4 4-4 4" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('home.wallets_sheet_title', lang)}
      >
        <div className={styles.sheetList}>
          {wallets.map((w, i) => (
            <button
              key={w.id}
              className={styles.sRow}
              onClick={() => {
                onWalletTap(w)
                setSheetOpen(false)
              }}
            >
              <span
                className={styles.dot}
                style={{ background: WALLET_DOTS[i % WALLET_DOTS.length] }}
              />
              <span className={styles.sName}>{w.name}</span>
              <span className={styles.sAmt}>{formatCurrency(w.balance, w.currency)}</span>
              <span className={styles.sChev}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="var(--ink-tertiary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </span>
            </button>
          ))}
          <button
            className={styles.sAddRow}
            onClick={() => {
              onAddWallet()
              setSheetOpen(false)
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M7 2.5v9M2.5 7h9" />
            </svg>
            {t('home.tambah_dompet', lang)}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
