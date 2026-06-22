import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  /** epoch ms of the calendar payday for this period — pre-computed by OnboardingPage */
  paydayMs: number
  onNext: (lastPaydayConfirmed: number | null) => void
}

export function StepPayConfirm({ paydayMs, onNext }: Props) {
  const lang = useLanguage()
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null)

  function handleNext() {
    if (!selected) return
    // "yes" → confirm payday; use paydayMs as the period start anchor
    // "no"  → hari pertama; lastPaydayConfirmed stays null
    onNext(selected === 'yes' ? paydayMs : null)
  }

  return (
    <>
      <h1 className="ob-heading">{t('ob.payConfirm.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.payConfirm.sub', lang)}</p>

      <button
        className={`ob-option${selected === 'yes' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('yes')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.payConfirm.yes', lang)}
          <span className="ob-option-sub">{t('ob.payConfirm.yes_sub', lang)}</span>
        </span>
      </button>

      <button
        className={`ob-option${selected === 'no' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('no')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.payConfirm.no', lang)}
          <span className="ob-option-sub">{t('ob.payConfirm.no_sub', lang)}</span>
        </span>
      </button>

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!selected} onClick={handleNext}>
        {t('ob.payConfirm.next', lang)}
      </button>
    </>
  )
}
