import { useState } from 'react'
import { useSetLanguage } from '@/app/providers/useLanguage'
import { CurrencyPickerSheet } from '@/shared/components/CurrencyPickerSheet'
import { t } from '@/shared/strings/strings'
import type { Currency } from '@/constants/currencies'
import type { Language } from '@/db/database'

interface Props {
  onNext: (v: { language: Language; primaryCurrency: string }) => void
}

export function StepLangCurrency({ onNext }: Props) {
  const setLang = useSetLanguage()
  const [selectedLang, setSelectedLang] = useState<Language>('id')
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleSelect(currency: Currency) {
    setSelectedCurrency(currency)
    setSheetOpen(false)
  }

  function handleNext() {
    if (!selectedCurrency) return
    setLang(selectedLang)
    onNext({ language: selectedLang, primaryCurrency: selectedCurrency.code })
  }

  return (
    <>
      <h1 className="ob-heading">Pilih bahasa</h1>
      <p className="ob-subheading">Choose your language</p>

      <button
        className={`ob-option${selectedLang === 'id' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelectedLang('id')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">Bahasa Indonesia</span>
        <span className="ob-code-chip">ID</span>
      </button>

      <button
        className={`ob-option${selectedLang === 'en' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelectedLang('en')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">English</span>
        <span className="ob-code-chip">EN</span>
      </button>

      <div className="ob-spacer" />

      <p className="ob-subheading">{t('ob.langCurrency.currency_label', selectedLang)}</p>

      <div className="ob-field">
        <button className="ob-select-trigger" onClick={() => setSheetOpen(true)}>
          {selectedCurrency ? (
            <span className="ob-select-value">
              {selectedCurrency.code} — {selectedCurrency.name}
            </span>
          ) : (
            <span className="ob-select-placeholder">
              {t('ob.langCurrency.currency_placeholder', selectedLang)}
            </span>
          )}
        </button>
      </div>

      <p className="ob-explainer">{t('ob.langCurrency.explainer', selectedLang)}</p>

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!selectedCurrency} onClick={handleNext}>
        {t('ob.langCurrency.next', selectedLang)}
      </button>

      {sheetOpen && (
        <CurrencyPickerSheet onSelect={handleSelect} onDismiss={() => setSheetOpen(false)} />
      )}
    </>
  )
}
