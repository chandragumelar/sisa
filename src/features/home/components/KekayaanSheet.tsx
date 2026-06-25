import { useEffect, useState } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { convert, getRateAsOf, formatRateDate } from '@/shared/utils/fx'
import type { Wallet } from '@/db/database'
import styles from './KekayaanSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  primaryCurrency: string
}

interface CurrencyRow {
  currency: string
  nativeTotal: number
  equivInPrimary: number | null
  fetchedAt: number | null
}

export function KekayaanSheet({ isOpen, onClose, wallets, primaryCurrency }: Props) {
  const lang = useLanguage()
  const [rows, setRows] = useState<CurrencyRow[]>([])
  const [grandTotal, setGrandTotal] = useState<number | null>(null)
  const [flipTo, setFlipTo] = useState<string | null>(null)
  const [flippedTotal, setFlippedTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    async function compute() {
      const groups = new Map<string, number>()
      for (const w of wallets) groups.set(w.currency, (groups.get(w.currency) ?? 0) + w.balance)

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
      setRows(computed)
      setGrandTotal(totalOk ? total : null)
    }
    void compute()
    return () => {
      cancelled = true
    }
  }, [isOpen, wallets, primaryCurrency])

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

  const foreignCurrencies = rows
    .filter((r) => r.currency !== primaryCurrency)
    .map((r) => r.currency)
  const latestFetchedAt = rows
    .map((r) => r.fetchedAt)
    .filter((v): v is number => v !== null)
    .reduce<number | null>((max, v) => (max === null || v > max ? v : max), null)

  function handleFlip(cur: string) {
    setFlipTo((prev) => (prev === cur ? null : cur))
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('kekayaan.sheet_title', lang)}>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.currency} className={styles.row}>
            <div className={styles.rowLeft}>
              <span className={styles.rowCurrency}>{row.currency}</span>
              <span className={styles.rowNative}>
                {formatCurrency(row.nativeTotal, row.currency)}
              </span>
            </div>
            <div className={styles.rowRight}>
              {row.currency === primaryCurrency ? (
                <span className={styles.rowEquiv}>
                  {formatCurrency(row.nativeTotal, primaryCurrency)}
                </span>
              ) : row.equivInPrimary !== null ? (
                <>
                  <span className={styles.rowEquiv}>
                    {formatCurrency(row.equivInPrimary, primaryCurrency)}
                  </span>
                  {row.fetchedAt !== null && (
                    <span className={styles.rowRate}>
                      {t('kekayaan.rate_note', lang).replace(
                        '{date}',
                        formatRateDate(row.fetchedAt),
                      )}
                    </span>
                  )}
                </>
              ) : (
                <span className={styles.rowNoRate}>{t('kekayaan.no_rate', lang)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{t('kekayaan.grand_total', lang)}</span>
        <span className={styles.totalValue}>
          {flipTo !== null && flippedTotal !== null
            ? formatCurrency(flippedTotal, flipTo)
            : grandTotal !== null
              ? formatCurrency(grandTotal, primaryCurrency)
              : '—'}
        </span>
      </div>

      {foreignCurrencies.length > 0 && (
        <div className={styles.flips}>
          {foreignCurrencies.map((cur) => (
            <button
              key={cur}
              className={`${styles.flipChip} ${flipTo === cur ? styles.flipChipActive : ''}`}
              onClick={() => handleFlip(cur)}
            >
              {cur}
            </button>
          ))}
        </div>
      )}

      {latestFetchedAt !== null && (
        <p className={styles.footer}>
          {t('kekayaan.rate_footer', lang).replace('{date}', formatRateDate(latestFetchedAt))}
        </p>
      )}
    </BottomSheet>
  )
}
