import { useState } from 'react'
import type { IncomeType } from '@/db/database'

interface Props {
  onNext: (incomeType: IncomeType) => void
}

export function Step4aIncomeType({ onNext }: Props) {
  const [selected, setSelected] = useState<IncomeType | null>(null)

  return (
    <>
      <h1 className="ob-heading">Tipe pemasukan lo</h1>
      <p className="ob-subheading">Ini buat ngitung kapan duit masuk.</p>

      <button
        className={`ob-option${selected === 'tetap' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('tetap')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          Gaji tetap
          <span className="ob-option-sub">Masuk tanggal yang sama tiap bulan</span>
        </span>
      </button>

      <button
        className={`ob-option${selected === 'freelance' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('freelance')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          Freelance / tidak tetap
          <span className="ob-option-sub">Nggak tentu tanggal dan jumlahnya</span>
        </span>
      </button>

      <button
        className={`ob-option${selected === 'mix' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('mix')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">
          Campuran
          <span className="ob-option-sub">Ada gaji, ada juga pemasukan lain</span>
        </span>
      </button>

      <div className="ob-grow" />

      <button
        className="ob-primary-btn"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        Lanjut
      </button>
    </>
  )
}
