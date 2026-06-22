import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  /** epoch ms of the previous payday — pre-computed by OnboardingPage */
  previousPaydayMs: number
  onNext: (lastPaydayConfirmed: number | null) => void
}

type Choice = 'preset' | 'picker' | 'first'

function formatDate(ms: number, locale: string): string {
  return new Date(ms).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function StepPayConfirm({ previousPaydayMs, onNext }: Props) {
  const lang = useLanguage()
  const locale = lang === 'en' ? 'en-US' : 'id-ID'
  const [selected, setSelected] = useState<Choice | null>(null)
  const [pickerDateStr, setPickerDateStr] = useState('')

  function handleNext() {
    if (!selected) return
    if (selected === 'first') {
      onNext(null)
      return
    }
    if (selected === 'preset') {
      onNext(previousPaydayMs)
      return
    }
    // picker
    if (!pickerDateStr) return
    const [y, m, d] = pickerDateStr.split('-').map(Number)
    onNext(new Date(y, m - 1, d).getTime())
  }

  const canProceed =
    selected === 'first' || selected === 'preset' || (selected === 'picker' && pickerDateStr !== '')

  return (
    <>
      <h1 className="ob-heading">{t('ob.payConfirm.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.payConfirm.sub', lang)}</p>

      {/* Option a: preset date */}
      <button
        className={`ob-option${selected === 'preset' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('preset')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.payConfirm.preset_prefix', lang)} {formatDate(previousPaydayMs, locale)}
        </span>
      </button>

      {/* Option b: date picker */}
      <button
        className={`ob-option${selected === 'picker' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('picker')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">{t('ob.payConfirm.picker_label', lang)}</span>
      </button>
      {selected === 'picker' && (
        <input
          className="ob-input"
          style={{ marginTop: 8 }}
          type="date"
          value={pickerDateStr}
          onChange={(e) => setPickerDateStr(e.target.value)}
        />
      )}

      {/* Option c: first time */}
      <button
        className={`ob-option${selected === 'first' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('first')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.payConfirm.first_label', lang)}
          <span className="ob-option-sub">{t('ob.payConfirm.first_sub', lang)}</span>
        </span>
      </button>

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!canProceed} onClick={handleNext}>
        {t('ob.payConfirm.next', lang)}
      </button>
    </>
  )
}
