import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './Dock.module.css'

interface Props {
  /** epoch ms of the previous payday — pre-computed by OnboardingPage */
  previousPaydayMs: number
  onNext: (lastPaydayConfirmed: number | null, echo: string) => void
}

type Choice = 'preset' | 'picker' | 'first'

function formatDate(ms: number, locale: string): string {
  return new Date(ms).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DockPayConfirm({ previousPaydayMs, onNext }: Props) {
  const lang = useLanguage()
  const locale = lang === 'en' ? 'en-US' : 'id-ID'
  const [selected, setSelected] = useState<Choice | null>(null)
  const [pickerDateStr, setPickerDateStr] = useState('')

  function handleNext() {
    if (!selected) return
    if (selected === 'first') {
      onNext(null, t('ob.chat.echo_pay_first', lang))
      return
    }
    if (selected === 'preset') {
      onNext(previousPaydayMs, formatDate(previousPaydayMs, locale))
      return
    }
    // picker
    if (!pickerDateStr) return
    const [y, m, d] = pickerDateStr.split('-').map(Number)
    const ms = new Date(y, m - 1, d).getTime()
    onNext(ms, formatDate(ms, locale))
  }

  const canProceed =
    selected === 'first' || selected === 'preset' || (selected === 'picker' && pickerDateStr !== '')

  return (
    <div className={styles.chipColumn}>
      <button
        className={`${styles.optionChip} ${selected === 'preset' ? styles.optionChipSelected : ''}`}
        onClick={() => setSelected('preset')}
      >
        <span className={styles.optionLabel}>
          {t('ob.payConfirm.preset_prefix', lang)} {formatDate(previousPaydayMs, locale)}
        </span>
      </button>

      <button
        className={`${styles.optionChip} ${selected === 'picker' ? styles.optionChipSelected : ''}`}
        onClick={() => setSelected('picker')}
      >
        <span className={styles.optionLabel}>{t('ob.payConfirm.picker_label', lang)}</span>
      </button>
      {selected === 'picker' && (
        <input
          className={styles.dateInput}
          type="date"
          value={pickerDateStr}
          onChange={(e) => setPickerDateStr(e.target.value)}
        />
      )}

      <button
        className={`${styles.optionChip} ${selected === 'first' ? styles.optionChipSelected : ''}`}
        onClick={() => setSelected('first')}
      >
        <span className={styles.optionLabel}>{t('ob.payConfirm.first_label', lang)}</span>
      </button>

      <button className="ob-primary-btn" disabled={!canProceed} onClick={handleNext}>
        {t('ob.payConfirm.next', lang)}
      </button>
    </div>
  )
}
