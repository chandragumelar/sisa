import { useState } from 'react'
import type { IncomeType } from '@/db/database'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'

interface Props {
  incomeType: IncomeType
  currency?: string
  onNext: (data: { incomeDay: number | null; freelanceMinBalance: string }) => void
}

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

export function Step4bIncomeDetail({ incomeType, currency = 'IDR', onNext }: Props) {
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
        {isTetap ? 'Tanggal gajian' : isMix ? 'Detail pemasukan' : 'Batas aman saldo'}
      </h1>
      <p className="ob-subheading">
        {isTetap
          ? 'Tiap tanggal berapa gaji lo masuk?'
          : isMix
            ? 'Tanggal gajian tetap lo, kalau ada.'
            : 'Berapa saldo minimal yang bikin lo merasa aman?'}
      </p>

      {(isTetap || isMix) && (
        <div className="ob-field">
          <div className="ob-field-label">Tanggal gajian</div>
          <select
            className="ob-input"
            value={incomeDay ?? ''}
            onChange={(e) => setIncomeDay(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Pilih tanggal…</option>
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Tanggal {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {(isFreelance || isMix) && (
        <div className="ob-field">
          <div className="ob-field-label">
            {isMix ? 'Minimum saldo aman (opsional)' : 'Minimum saldo aman'}
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
          {isFreelance && (
            <div className="ob-hint">
              SISA akan kasih peringatan kalau saldo lo di bawah angka ini.
            </div>
          )}
        </div>
      )}

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!canProceed} onClick={handleNext}>
        Lanjut
      </button>
    </>
  )
}
