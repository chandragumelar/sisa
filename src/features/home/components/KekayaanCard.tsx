import { useEffect, useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { convert } from '@/shared/utils/fx'
import type { Wallet } from '@/db/database'
import styles from './KekayaanCard.module.css'

interface Props {
  wallets: Wallet[]
  primaryCurrency: string
  onClick: () => void
}

export function KekayaanCard({ wallets, primaryCurrency, onClick }: Props) {
  const lang = useLanguage()
  const [grandTotal, setGrandTotal] = useState<number | null>(null)

  const currencies = [...new Set(wallets.map((w) => w.currency))]
  const isMulti = currencies.some((c) => c !== primaryCurrency)

  useEffect(() => {
    let cancelled = false
    async function calc() {
      const groups = new Map<string, number>()
      for (const w of wallets) groups.set(w.currency, (groups.get(w.currency) ?? 0) + w.balance)
      let total = 0
      for (const [cur, amount] of groups) {
        if (cur === primaryCurrency) {
          total += amount
          continue
        }
        const v = await convert(amount, cur, primaryCurrency)
        if (v === null) {
          if (!cancelled) setGrandTotal(null)
          return
        }
        total += v
      }
      if (!cancelled) setGrandTotal(total)
    }
    void calc()
    return () => {
      cancelled = true
    }
  }, [wallets, primaryCurrency])

  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.headerRow}>
        <span className={styles.label}>{t('kekayaan.label', lang)}</span>
        {isMulti && (
          <div className={styles.pills}>
            {currencies.map((c) => (
              <span key={c} className={styles.pill}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>
          {grandTotal !== null ? formatCurrency(grandTotal, primaryCurrency) : '—'}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </div>
    </button>
  )
}
