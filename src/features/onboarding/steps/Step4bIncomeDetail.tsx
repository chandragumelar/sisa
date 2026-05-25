import { useState } from 'react'
import type { IncomeType } from '@/db/database'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  incomeType: IncomeType
  currency?: string
  onNext: (data: { incomeDay: number | null; freelanceMinBalance: string }) => void
}

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

export function Step4bIncomeDetail({ incomeType, currency = 'IDR', onNext }: Props) {
  const lang = useLanguage()
  const [incomeDay, setIncomeDay] = useState<number | null>(null)
  const [minBalance, setMinBalance] = useState('')

  const isTetap = incomeType === 'tetap'
  const isMix = incomeType === 'mix'
  const isFreelance = incomeType === 'freelance'

  const canProceed = isFreelance ? true : incomeDay !== null

  function handleNext() {
    onNext({
      incomeDay: incomeDay,
      freelanceMinBalance: parseNominalRaw(minBalance),
    })
  }

  return (
    <>
      <h1 className="ob-heading">
        {isTetap
          ? t('ob.step4b.heading_tetap', lang)
          : isMix
            ? t('ob.step4b.heading_mix', lang)
            : t('ob.step4b.heading_freelance', lang)}
      </h1>
      <p className="ob-subheading">
        {isTetap
          ? t('ob.step4b.sub_tetap', lang)
          : isMix
            ? t('ob.step4b.sub_mix', lang)
            : t('ob.step4b.sub_freelance', lang)}
      </p>

      {(isTetap || isMix) && (
        <div className="ob-field">
          <div className="ob-field-label">{t('ob.step4b.payday_label', lang)}</div>
          <select
            className="ob-input"
            value={incomeDay ?? ''}
            onChange={(e) => setIncomeDay(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('ob.step4b.payday_placeholder', lang)}</option>
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {t('ob.step4b.payday_day', lang).replace('{d}', String(d))}
              </option>
            ))}
          </select>
        </div>
      )}

      {(isFreelance || isMix) && (
        <div className="ob-field">
          <div className="ob-field-label">
            {isMix
              ? t('ob.step4b.min_balance_optional', lang)
              : t('ob.step4b.min_balance_required', lang)}
          </div>
          <div className="ob-input-row">
            <span className="ob-input-prefix">{getCurrencySymbol(currency)}</span>
            <input
              className="ob-input ob-input-bare"
              type="text"
              inputMode="numeric"
              placeholder="500.000"
              value={minBalance}
              onChange={(e) => setMinBalance(formatNominalDisplay(parseNominalRaw(e.target.value)))}
            />
          </div>
          {isFreelance && <div className="ob-hint">{t('ob.step4b.min_balance_hint', lang)}</div>}
        </div>
      )}

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!canProceed} onClick={handleNext}>
        {t('ob.step4b.next', lang)}
      </button>
    </>
  )
}
