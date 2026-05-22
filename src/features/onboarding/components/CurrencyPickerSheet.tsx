import { useState, useEffect, useRef } from 'react'
import { ALL_CURRENCIES, getPopularCurrencies, type Currency } from '@/constants/currencies'
import styles from './CurrencyPickerSheet.module.css'

interface CurrencyPickerSheetProps {
  onSelect: (currency: Currency) => void
  onDismiss: () => void
  excludeCode?: string | null
}

export function CurrencyPickerSheet({
  onSelect,
  onDismiss,
  excludeCode,
}: CurrencyPickerSheetProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const lowerQuery = query.toLowerCase()
  const isSearching = query.trim().length > 0

  const filtered = isSearching
    ? ALL_CURRENCIES.filter(
        (c) =>
          c.code !== excludeCode &&
          (c.code.toLowerCase().includes(lowerQuery) ||
            c.name.toLowerCase().includes(lowerQuery) ||
            c.symbol.toLowerCase().includes(lowerQuery)),
      )
    : ALL_CURRENCIES.filter((c) => c.code !== excludeCode)

  const popular = getPopularCurrencies().filter((c) => c.code !== excludeCode)

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onDismiss()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.sheet} role="dialog" aria-label="Pilih mata uang">
        <div className={styles.dragHandle} aria-hidden="true" />

        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder="pilih mata uang…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.listWrap}>
          {!isSearching && (
            <>
              <div className={styles.sectionLabel}>Populer</div>
              {popular.map((c) => (
                <CurrencyRow key={c.code} currency={c} onSelect={onSelect} />
              ))}
              <div className={styles.sectionLabel}>Semua</div>
            </>
          )}

          {filtered.length === 0 && <div className={styles.empty}>Mata uang tidak ditemukan</div>}

          {(isSearching ? filtered : ALL_CURRENCIES.filter((c) => c.code !== excludeCode)).map(
            (c) => (
              <CurrencyRow key={c.code} currency={c} onSelect={onSelect} />
            ),
          )}
        </div>
      </div>
    </div>
  )
}

function CurrencyRow({
  currency,
  onSelect,
}: {
  currency: Currency
  onSelect: (c: Currency) => void
}) {
  return (
    <button className={styles.row} onClick={() => onSelect(currency)}>
      <span className={styles.rowSymbol}>{currency.symbol}</span>
      <span className={styles.rowCode}>{currency.code}</span>
      <span className={styles.rowName}>{currency.name}</span>
    </button>
  )
}
