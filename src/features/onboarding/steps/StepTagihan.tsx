import { useState } from 'react'
import type { TagihanOnboardingInput } from '../onboarding.types'

interface Props {
  tagihan: TagihanOnboardingInput[]
  currency: string
  onChange: (items: TagihanOnboardingInput[]) => void
  onNext: () => void
  onSkip: () => void
}

const CONTOH = [
  { name: 'Kos / sewa', amt: 'Rp2.500.000', date: 'Tgl 1' },
  { name: 'Cicilan (motor, KPR)', amt: 'Rp850.000', date: 'Tgl 10' },
  { name: 'Listrik & air', amt: 'Rp300.000', date: 'Tgl 20' },
  { name: 'Langganan (Spotify, Netflix…)', amt: null, date: null },
]

export function StepTagihan({ tagihan, currency, onChange, onNext, onSkip }: Props) {
  const [addingName, setAddingName] = useState('')
  const [addingNominal, setAddingNominal] = useState('')
  const [addingDueDay, setAddingDueDay] = useState('1')
  const [showAddForm, setShowAddForm] = useState(false)

  const total = tagihan.reduce((s, t) => s + (Number(t.nominal) || 0), 0)

  function handleAdd() {
    const nominal = Number(addingNominal.replace(/\D/g, ''))
    if (!addingName.trim() || nominal <= 0) return
    onChange([...tagihan, { name: addingName.trim(), nominal, dueDay: Number(addingDueDay) || 1 }])
    setAddingName('')
    setAddingNominal('')
    setAddingDueDay('1')
    setShowAddForm(false)
  }

  function handleRemove(idx: number) {
    onChange(tagihan.filter((_, i) => i !== idx))
  }

  const currSymbol = currency === 'IDR' ? 'Rp' : currency

  return (
    <>
      <div className="ob-toprow">
        <button type="button" className="ob-skip" onClick={onSkip}>
          Nanti aja
        </button>
      </div>
      <h1 className="ob-heading">Tagihan rutin lo?</h1>
      <p className="ob-subheading">
        Isi ini biar angka Sisa lo akurat. Makin lengkap, makin tepat.{' '}
        {tagihan.length === 0 && 'Skip kalau mau nanti.'}
      </p>

      {tagihan.length === 0 && !showAddForm ? (
        <div className="ob-card" style={{ padding: '14px 16px' }}>
          <p className="ob-label" style={{ marginBottom: 11 }}>
            Contoh tagihan rutin
          </p>
          {CONTOH.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                background: 'var(--surface-deep)',
                borderRadius: 8,
                border: '1px dashed var(--border-hair)',
                marginBottom: i < CONTOH.length - 1 ? 6 : 0,
                opacity: 0.7,
              }}
            >
              <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-tertiary)' }}>{c.name}</span>
              {c.amt && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {c.amt}
                </span>
              )}
              {c.date && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--ink-tertiary)',
                    padding: '2px 7px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-hair)',
                    borderRadius: 20,
                  }}
                >
                  {c.date}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="ob-card">
          {tagihan.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                gap: 10,
                borderBottom: i < tagihan.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                  Jatuh tempo tgl {item.dueDay}
                </div>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink-primary)',
                }}
              >
                {currSymbol}
                {Number(item.nominal).toLocaleString('id-ID')}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid var(--border-hair)',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.8 8h5.4l.8-8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div
          className="ob-card"
          style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            className="ob-input"
            placeholder="Nama tagihan (mis. Kos)"
            value={addingName}
            onChange={(e) => setAddingName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="ob-input"
              placeholder="Nominal"
              inputMode="numeric"
              style={{ flex: 2 }}
              value={addingNominal}
              onChange={(e) => setAddingNominal(e.target.value.replace(/\D/g, ''))}
            />
            <input
              className="ob-input"
              placeholder="Tgl"
              inputMode="numeric"
              style={{ flex: 1 }}
              value={addingDueDay}
              onChange={(e) => setAddingDueDay(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ob-btn-ghost" onClick={() => setShowAddForm(false)}>
              Batal
            </button>
            <button type="button" className="ob-btn-primary" onClick={handleAdd}>
              Tambah
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button type="button" className="ob-add-dashed" onClick={() => setShowAddForm(true)}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M8 3V13M3 8H13" />
          </svg>
          Tambah tagihan
        </button>
      )}

      <div className="ob-footer">
        <div className="ob-footer-total">
          <span>Total tagihan bulanan</span>
          <span
            className="ob-footer-total-amt"
            style={{ color: total > 0 ? 'var(--signal-danger)' : 'var(--ink-tertiary)' }}
          >
            {currSymbol}
            {total.toLocaleString('id-ID')}
          </span>
        </div>
        <button type="button" className="ob-btn-primary ob-btn-full" onClick={onNext}>
          Lanjut →
        </button>
      </div>
    </>
  )
}
