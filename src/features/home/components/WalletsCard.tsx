import { useEffect, useState } from 'react'
import type { Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { convert, getRateAsOf, formatRateDate, refreshRatesIfStale } from '@/shared/utils/fx'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './WalletsCard.module.css'

export const WALLET_DOTS = ['#60a5fa', '#f97316', '#34d399', '#a78bfa', '#f472b6']

const MAX_VISIBLE = 4

interface CurrencyRow {
  currency: string
  nativeTotal: number
  equivInPrimary: number | null
  fetchedAt: number | null
}

interface Props {
  wallets: Wallet[]
  primaryCurrency: string
  onWalletTap: (w: Wallet) => void
  onAddWallet: () => void
}

export function WalletsCard({ wallets, primaryCurrency, onWalletTap, onAddWallet }: Props) {
  const lang = useLanguage()
  const [rows, setRows] = useState<CurrencyRow[]>([])
  const [grandTotal, setGrandTotal] = useState<number | null>(null)
  const [flipTo, setFlipTo] = useState<string | null>(null)
  const [flippedTotal, setFlippedTotal] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)

  const isMulti = wallets.some((w) => w.currency !== primaryCurrency)

  const primaryWallets = wallets
    .filter((w) => w.currency === primaryCurrency)
    .sort((a, b) => b.balance - a.balance)
  const foreignWallets = wallets
    .filter((w) => w.currency !== primaryCurrency)
    .sort((a, b) => b.balance - a.balance)
  const sortedWallets = [...primaryWallets, ...foreignWallets]
  const primaryTotal = primaryWallets.reduce((s, w) => s + w.balance, 0)

  useEffect(() => {
    if (!isMulti) return
    const foreignCurrencies = [...new Set(foreignWallets.map((w) => w.currency))]
    void refreshRatesIfStale(primaryCurrency, foreignCurrencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, primaryCurrency, isMulti])

  useEffect(() => {
    if (!isMulti) {
      setRows([])
      setGrandTotal(null)
      return
    }
    let cancelled = false
    async function compute() {
      const groups = new Map<string, number>()
      for (const w of wallets) {
        groups.set(w.currency, (groups.get(w.currency) ?? 0) + w.balance)
      }

      const computed: CurrencyRow[] = []
      let total = 0
      let totalOk = true

      for (const [currency, nativeTotal] of groups) {
        if (currency === primaryCurrency) {
          computed.push({ currency, nativeTotal, equivInPrimary: nativeTotal, fetchedAt: null })
          total += nativeTotal
          continue
        }
        const equiv = await convert(nativeTotal, currency, primaryCurrency)
        const record = await getRateAsOf(primaryCurrency, currency)
        computed.push({
          currency,
          nativeTotal,
          equivInPrimary: equiv,
          fetchedAt: record?.fetchedAt ?? null,
        })
        if (equiv === null) {
          totalOk = false
        } else {
          total += equiv
        }
      }

      if (cancelled) return
      computed.sort((a, b) =>
        a.currency === primaryCurrency ? -1 : b.currency === primaryCurrency ? 1 : 0,
      )
      setRows(computed)
      setGrandTotal(totalOk ? total : null)
    }
    void compute()
    return () => {
      cancelled = true
    }
  }, [wallets, primaryCurrency, isMulti])

  useEffect(() => {
    if (flipTo === null || grandTotal === null) {
      setFlippedTotal(null)
      return
    }
    let cancelled = false
    void convert(grandTotal, primaryCurrency, flipTo).then((v) => {
      if (!cancelled) setFlippedTotal(v)
    })
    return () => {
      cancelled = true
    }
  }, [flipTo, grandTotal, primaryCurrency])

  if (wallets.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.headRow}>
            <span className={styles.modLabel}>{t('home.dompet', lang)}</span>
          </div>
        </div>
        <div className={styles.divider} />
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

  const visibleWallets = expanded ? sortedWallets : sortedWallets.slice(0, MAX_VISIBLE)
  const hiddenCount = sortedWallets.length - MAX_VISIBLE

  const foreignRows = rows.filter((r) => r.currency !== primaryCurrency)
  const rateUnavailableRows = foreignRows.filter((r) => r.equivInPrimary === null)
  const hasRateMissing = rateUnavailableRows.length > 0

  const totalLabel = !isMulti
    ? t('saldo.total_saldo_label', lang)
    : hasRateMissing
      ? t('wallets.total_label_fallback', lang).replace('{currency}', primaryCurrency)
      : t('wallets.total_label', lang)

  const displayTotal = (() => {
    if (!isMulti) return formatCurrency(primaryTotal, primaryCurrency)
    if (flipTo !== null && flippedTotal !== null) return `≈ ${formatCurrency(flippedTotal, flipTo)}`
    if (grandTotal !== null) return `≈ ${formatCurrency(grandTotal, primaryCurrency)}`
    return formatCurrency(primaryTotal, primaryCurrency)
  })()

  return (
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
        {isMulti && rows.length > 0 && (
          <div className={styles.mcSubtotals}>
            {rows.map((row) => (
              <div key={row.currency} className={styles.mcSubItem}>
                <span className={styles.mcCur}>{row.currency}</span>
                <span className={styles.mcVal}>
                  {formatCurrency(row.nativeTotal, row.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className={styles.totalLbl}>{totalLabel}</div>
        <div className={styles.totalAmt}>{displayTotal}</div>
        {isMulti && hasRateMissing && (
          <div className={styles.totalFallbackNote}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              stroke="var(--ink-tertiary)"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="5.5" cy="5.5" r="4.5" />
              <path d="M5.5 3.2v2.6" />
              <circle cx="5.5" cy="7.6" r="0.45" fill="var(--ink-tertiary)" stroke="none" />
            </svg>
            <span>
              {t('wallets.fallback_note', lang).replace(
                '{currencies}',
                rateUnavailableRows
                  .map((r) => `${r.currency} ${formatCurrency(r.nativeTotal, r.currency)}`)
                  .join(', '),
              )}
            </span>
          </div>
        )}
        {isMulti && rows.length > 0 && (
          <div className={styles.chipRow}>
            {rows.map((r) => {
              const isPrimary = r.currency === primaryCurrency
              const isActive = isPrimary ? flipTo === null : flipTo === r.currency
              const isDisabled = !isPrimary && r.equivInPrimary === null
              return (
                <button
                  key={r.currency}
                  className={`${styles.chip} ${isActive ? styles.chipActive : ''} ${isDisabled ? styles.chipDisabled : ''}`}
                  onClick={() => {
                    if (isDisabled) return
                    if (isPrimary) {
                      setFlipTo(null)
                    } else {
                      setFlipTo((prev) => (prev === r.currency ? null : r.currency))
                    }
                  }}
                >
                  {r.currency}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div className={styles.divider} />
      {visibleWallets.map((w, i) => {
        const isForeign = w.currency !== primaryCurrency
        const row = isForeign ? rows.find((r) => r.currency === w.currency) : null
        return (
          <button key={w.id} className={styles.wRow} onClick={() => onWalletTap(w)}>
            <span
              className={styles.dot}
              style={{ background: WALLET_DOTS[i % WALLET_DOTS.length] }}
            />
            <span className={styles.wName}>{w.name}</span>
            {isForeign ? (
              <div className={styles.wRight}>
                <span className={styles.wAmtNative}>{formatCurrency(w.balance, w.currency)}</span>
                {row == null ? null : row.equivInPrimary !== null ? (
                  <span className={styles.wAmtEquiv}>
                    {`≈ ${formatCurrency(row.equivInPrimary, primaryCurrency)}${row.fetchedAt !== null ? ` · ${formatRateDate(row.fetchedAt)}` : ''}`}
                  </span>
                ) : (
                  <span className={styles.wAmtUnavail}>{t('wallets.rate_unavailable', lang)}</span>
                )}
              </div>
            ) : (
              <span className={styles.wAmt}>{formatCurrency(w.balance, w.currency)}</span>
            )}
          </button>
        )
      })}
      {hiddenCount > 0 && (
        <button className={styles.moreRow} onClick={() => setExpanded((v) => !v)}>
          <span className={styles.moreLbl}>
            {expanded
              ? t('wallets.collapse', lang)
              : t('home.wallets_more', lang).replace('{n}', String(hiddenCount))}
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
              {expanded ? <path d="M3 9.5L7 5.5L11 9.5" /> : <path d="M5.5 3.5L9 7l-3.5 3.5" />}
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
