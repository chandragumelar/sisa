import { useState } from 'react'
import { CurrencyPickerSheet } from '../components/CurrencyPickerSheet'
import type { Currency } from '@/constants/currencies'

interface Props {
  primaryCurrencyCode: string
  onNext: (secondaryCurrencyCode: string | null) => void
}

export function Step4eCurrency2({ primaryCurrencyCode, onNext }: Props) {
  const [selected, setSelected] = useState<Currency | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleSelect(currency: Currency) {
    setSelected(currency)
    setSheetOpen(false)
  }

  return (
    <>
      <h1 className="ob-heading">Mata uang kedua</h1>
      <p className="ob-subheading">
        Karena lo Pro, lo bisa pantau dua mata uang sekaligus. Bisa diatur ulang nanti.
      </p>

      <div className="ob-field">
        <button className="ob-select-trigger" onClick={() => setSheetOpen(true)}>
          {selected ? (
            <span className="ob-select-value">
              {selected.code} — {selected.name}
            </span>
          ) : (
            <span className="ob-select-placeholder">Pilih mata uang kedua…</span>
          )}
        </button>
      </div>

      <div className="ob-grow" />

      <div className="ob-btn-row">
        <button className="ob-ghost-btn" onClick={() => onNext(null)}>
          Nanti aja
        </button>
        <button
          className="ob-primary-btn"
          disabled={!selected}
          onClick={() => selected && onNext(selected.code)}
        >
          + Tambah
        </button>
      </div>

      {sheetOpen && (
        <CurrencyPickerSheet
          onSelect={handleSelect}
          onDismiss={() => setSheetOpen(false)}
          excludeCode={primaryCurrencyCode}
        />
      )}
    </>
  )
}
