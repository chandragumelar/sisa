import { useState } from 'react'
import type { IncomeType } from '@/db/database'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  onNext: (incomeType: IncomeType) => void
}

export function Step4aIncomeType({ onNext }: Props) {
  const lang = useLanguage()
  const [selected, setSelected] = useState<IncomeType | null>(null)

  return (
    <>
      <h1 className="ob-heading">{t('ob.step4a.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.step4a.sub', lang)}</p>

      <button
        className={`ob-option${selected === 'tetap' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('tetap')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.step4a.tetap_label', lang)}
          <span className="ob-option-sub">{t('ob.step4a.tetap_sub', lang)}</span>
        </span>
      </button>

      <button
        className={`ob-option${selected === 'freelance' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('freelance')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.step4a.freelance_label', lang)}
          <span className="ob-option-sub">{t('ob.step4a.freelance_sub', lang)}</span>
        </span>
      </button>

      <button
        className={`ob-option${selected === 'mix' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('mix')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          {t('ob.step4a.mix_label', lang)}
          <span className="ob-option-sub">{t('ob.step4a.mix_sub', lang)}</span>
        </span>
      </button>

      <div className="ob-grow" />

      <button
        className="ob-primary-btn"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        {t('ob.step4a.next', lang)}
      </button>
    </>
  )
}
