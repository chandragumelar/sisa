import { useState } from 'react'
import type { IncomeFrequency, IncomeType } from '@/db/database'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  incomeType: IncomeType
  currency?: string
  onNext: (data: {
    incomeDay: number | null
    freelanceMinBalance: string
    incomeFrequency: IncomeFrequency
    incomeAnchorDate: number | null
  }) => void
}

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

function parseDateInputToMs(dateStr: string): number | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function Step4bIncomeDetail({ incomeType, currency = 'IDR', onNext }: Props) {
  const lang = useLanguage()
  const [incomeFrequency, setIncomeFrequency] = useState<IncomeFrequency>('bulanan')
  const [incomeDay, setIncomeDay] = useState<number | null>(null)
  const [anchorDateStr, setAnchorDateStr] = useState('')
  const [minBalance, setMinBalance] = useState('')

  const isTetap = incomeType === 'tetap'
  const isMix = incomeType === 'mix'
  const isFreelance = incomeType === 'freelance'
  const hasCycle = isTetap || isMix
  const isWeekly = incomeFrequency === 'mingguan' || incomeFrequency === '2mingguan'

  const canProceed = (() => {
    if (isFreelance) return true
    if (isWeekly) return anchorDateStr !== ''
    return incomeDay !== null
  })()

  function handleNext() {
    onNext({
      incomeDay: isWeekly ? null : incomeDay,
      freelanceMinBalance: parseNominalRaw(minBalance),
      incomeFrequency,
      incomeAnchorDate: isWeekly ? parseDateInputToMs(anchorDateStr) : null,
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

      {hasCycle && (
        <div className="ob-field">
          <div className="ob-field-label">{t('ob.step4b.freq_label', lang)}</div>
          <select
            className="ob-input"
            value={incomeFrequency}
            onChange={(e) => {
              setIncomeFrequency(e.target.value as IncomeFrequency)
              setIncomeDay(null)
              setAnchorDateStr('')
            }}
          >
            <option value="bulanan">{t('ob.step4b.freq_bulanan', lang)}</option>
            <option value="mingguan">{t('ob.step4b.freq_mingguan', lang)}</option>
            <option value="2mingguan">{t('ob.step4b.freq_2mingguan', lang)}</option>
          </select>
        </div>
      )}

      {hasCycle && !isWeekly && (
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

      {hasCycle && isWeekly && (
        <div className="ob-field">
          <div className="ob-field-label">{t('ob.step4b.anchor_label', lang)}</div>
          <input
            className="ob-input"
            type="date"
            value={anchorDateStr}
            onChange={(e) => setAnchorDateStr(e.target.value)}
          />
          <div className="ob-hint">{t('ob.step4b.anchor_hint', lang)}</div>
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
