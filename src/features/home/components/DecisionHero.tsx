import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import styles from './DecisionHero.module.css'

interface Props {
  currency: string
  onCekDulu: (amount?: number) => void
  onAndai: () => void
}

function currencySymbol(currency: string): string {
  if (currency === 'IDR') return 'Rp'
  if (currency === 'EUR') return '€'
  if (currency === 'USD') return '$'
  return currency
}

export function DecisionHero({ currency, onCekDulu, onAndai }: Props) {
  const lang = useLanguage()
  const [amountStr, setAmountStr] = useState('')

  function handleSubmit() {
    const raw = parseNominalRaw(amountStr)
    const val = parseInt(raw, 10)
    onCekDulu(isNaN(val) || val === 0 ? undefined : val)
  }

  return (
    <div className={styles.card}>
      <div className={styles.eyebrow}>{t('actions.cek_label', lang)}</div>
      <div className={styles.heading}>
        {t('decision.heading_line1', lang)}
        <br />
        {t('decision.heading_line2', lang)}
      </div>

      <div className={styles.inputWrapper}>
        <span className={styles.currencySymbol}>{currencySymbol(currency)}</span>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          placeholder={t('decision.input_placeholder', lang)}
          value={amountStr}
          onChange={(e) => setAmountStr(formatNominalDisplay(parseNominalRaw(e.target.value)))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
      </div>

      <button className={styles.cekBtn} onClick={handleSubmit}>
        <span>{t('decision.cek_btn', lang)}</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5.5 3L9.5 7L5.5 11" />
        </svg>
      </button>

      <div className={styles.andaiRow}>
        <span className={styles.andaiText}>{t('decision.andai_prefix', lang)} </span>
        <button className={styles.andaiLink} onClick={onAndai}>
          {t('decision.andai_link', lang)}
        </button>
      </div>
    </div>
  )
}
