import { useState } from 'react'
import type { Language } from '@/db/database'

interface Props {
  onNext: (lang: Language) => void
}

export function Step1Language({ onNext }: Props) {
  const [selected, setSelected] = useState<Language | null>(null)

  return (
    <>
      <h1 className="ob-heading">Pilih bahasa</h1>
      <p className="ob-subheading">Choose your language</p>

      <button
        className={`ob-option${selected === 'id' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('id')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">Bahasa Indonesia</span>
        <span className="ob-code-chip">ID</span>
      </button>

      <button
        className={`ob-option${selected === 'en' ? ' ob-option-selected' : ''}`}
        onClick={() => setSelected('en')}
      >
        <span className="ob-radio" />
        <span className="ob-option-label">English</span>
        <span className="ob-code-chip">EN</span>
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
