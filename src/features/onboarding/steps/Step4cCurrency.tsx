import { useState } from 'react'
import { CurrencyPickerSheet } from '../components/CurrencyPickerSheet'
import type { Currency } from '@/constants/currencies'

interface Props {
  onNext: (currencyCode: string) => void
}

export function Step4cCurrency({ onNext }: Props) {
  const [selected, setSelected] = useState<Currency | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleSelect(currency: Currency) {
    setSelected(currency)
    setSheetOpen(false)
  }

  return (
    <>
      <h1 className="ob-heading">Mata uang utama</h1>
      <p className="ob-subheading">Semua nominal akan ditampilkan dalam mata uang ini.</p>

      <div className="ob-field">
        <button className="ob-select-trigger" onClick={() => setSheetOpen(true)}>
          {selected ? (
            <span className="ob-select-value">
              {selected.code} — {selected.name}
            </span>
          ) : (
            <span className="ob-select-placeholder">Pilih mata uang…</span>
          )}
        </button>
      </div>

      <div className="ob-grow" />

      <button
        className="ob-primary-btn"
        disabled={!selected}
        onClick={() => selected && onNext(selected.code)}
      >
        Lanjut
      </button>

      {sheetOpen && (
        <CurrencyPickerSheet onSelect={handleSelect} onDismiss={() => setSheetOpen(false)} />
      )}
    </>
  )
}
