import { useState } from 'react'
import { CurrencyPickerSheet } from '../components/CurrencyPickerSheet'
import type { Currency } from '@/constants/currencies'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  primaryCurrencyCode: string
  onNext: (secondaryCurrencyCode: string | null) => void
}

export function Step4eCurrency2({ primaryCurrencyCode, onNext }: Props) {
  const lang = useLanguage()
  const [selected, setSelected] = useState<Currency | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleSelect(currency: Currency) {
    setSelected(currency)
    setSheetOpen(false)
  }

  return (
    <>
      <h1 className="ob-heading">{t('ob.step4e.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.step4e.sub', lang)}</p>

      <div className="ob-field">
        <button className="ob-select-trigger" onClick={() => setSheetOpen(true)}>
          {selected ? (
            <span className="ob-select-value">
              {selected.code} — {selected.name}
            </span>
          ) : (
            <span className="ob-select-placeholder">{t('ob.step4e.placeholder', lang)}</span>
          )}
        </button>
      </div>

      <div className="ob-grow" />

      <div className="ob-btn-row">
        <button className="ob-ghost-btn" onClick={() => onNext(null)}>
          {t('ob.step4e.skip', lang)}
        </button>
        <button
          className="ob-primary-btn"
          disabled={!selected}
          onClick={() => selected && onNext(selected.code)}
        >
          {t('ob.step4e.add', lang)}
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
