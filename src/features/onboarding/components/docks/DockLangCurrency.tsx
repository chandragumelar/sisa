import { useState } from 'react'
import { useSetLanguage } from '@/app/providers/useLanguage'
import { CurrencyPickerSheet } from '@/shared/components/CurrencyPickerSheet'
import { t } from '@/shared/strings/strings'
import type { Currency } from '@/constants/currencies'
import type { Language } from '@/db/database'
import styles from './Dock.module.css'

const LANG_LABELS: Record<Language, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
}

interface Props {
  onBotSay: (text: string) => void
  onNext: (result: { language: Language; primaryCurrency: string }, echo: string) => void
}

export function DockLangCurrency({ onBotSay, onNext }: Props) {
  const setLang = useSetLanguage()
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function pickLang(language: Language) {
    setLang(language)
    setSelectedLang(language)
    onBotSay(t('ob.chat.ask_currency', language))
    onBotSay(t('ob.langCurrency.explainer', language))
  }

  function handleSelect(currency: Currency) {
    setSelectedCurrency(currency)
    setSheetOpen(false)
  }

  function handleConfirm() {
    if (!selectedLang || !selectedCurrency) return
    onNext(
      { language: selectedLang, primaryCurrency: selectedCurrency.code },
      `${LANG_LABELS[selectedLang]} · ${selectedCurrency.code}`,
    )
  }

  if (!selectedLang) {
    return (
      <div className={`${styles.chipRow} ${styles.dockPop}`}>
        <button className={styles.chip} onClick={() => pickLang('id')}>
          {LANG_LABELS.id}
        </button>
        <button className={styles.chip} onClick={() => pickLang('en')}>
          {LANG_LABELS.en}
        </button>
      </div>
    )
  }

  return (
    <div className={`${styles.stack} ${styles.dockPop}`}>
      <button className={styles.selectChip} onClick={() => setSheetOpen(true)}>
        {selectedCurrency
          ? `${selectedCurrency.code} — ${selectedCurrency.name}`
          : t('ob.langCurrency.currency_placeholder', selectedLang)}
      </button>
      {selectedCurrency && (
        <button className="ob-primary-btn" onClick={handleConfirm}>
          {t('ob.langCurrency.next', selectedLang)}
        </button>
      )}
      {sheetOpen && (
        <CurrencyPickerSheet onSelect={handleSelect} onDismiss={() => setSheetOpen(false)} />
      )}
    </div>
  )
}
