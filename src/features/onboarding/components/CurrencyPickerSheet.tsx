import { useState } from 'react'
import { ALL_CURRENCIES, getPopularCurrencies, type Currency } from '@/constants/currencies'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
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
  const lang = useLanguage()
  const [query, setQuery] = useState('')

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
      <div className={styles.sheet} role="dialog" aria-label={t('currency_picker.aria', lang)}>
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
            className={styles.searchInput}
            type="search"
            placeholder={t('currency_picker.search', lang)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.listWrap}>
          {!isSearching && (
            <>
              <div className={styles.sectionLabel}>{t('currency_picker.popular', lang)}</div>
              {popular.map((c) => (
                <CurrencyRow key={c.code} currency={c} onSelect={onSelect} />
              ))}
              <div className={styles.sectionLabel}>{t('currency_picker.all', lang)}</div>
            </>
          )}

          {filtered.length === 0 && (
            <div className={styles.empty}>{t('currency_picker.empty', lang)}</div>
          )}

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
