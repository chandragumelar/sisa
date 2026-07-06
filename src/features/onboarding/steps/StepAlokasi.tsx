import { useState } from 'react'
import type { IncomeType } from '@/db/database'
import { AlokasiEditor } from '@/features/alokasi/AlokasiEditor'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface ItemAmount {
  name: string
  amount: number
}
interface ItemAmountCurrency extends ItemAmount {
  currency: string
}

interface Props {
  incomeType: IncomeType
  totalSaldo: number
  tagihanTotal: number
  sisaHari: number
  currency: string
  periodEndDate: number | null
  onPeriodEndDateChange: (ms: number) => void
  onNext: (operasional: number, periodEndDate: number | null) => void
  primaryWallets: ItemAmount[]
  primaryTagihan: ItemAmount[]
  otherWallets: ItemAmountCurrency[]
  otherTagihan: ItemAmountCurrency[]
}

function lastDayOfMonth(ms: number): Date {
  const d = new Date(ms)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function toInputDate(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const breakdownRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '2px 0 2px 12px',
}

const breakdownLabel: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--ink-tertiary)',
}

const breakdownAmt: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'var(--font-mono)',
  color: 'var(--ink-tertiary)',
}

export function StepAlokasi({
  incomeType,
  totalSaldo,
  tagihanTotal,
  sisaHari,
  currency,
  periodEndDate,
  onPeriodEndDateChange,
  onNext,
  primaryWallets,
  primaryTagihan,
  otherWallets,
  otherTagihan,
}: Props) {
  const lang = useLanguage()
  const bisaDialokasi = Math.max(0, totalSaldo - tagihanTotal)
  const [operasional, setOperasional] = useState(bisaDialokasi)

  const isFreelance = incomeType === 'freelance'
  const effectivePeriodEnd = periodEndDate ?? lastDayOfMonth(Date.now()).getTime()
  const periodEndLabel = new Date(effectivePeriodEnd).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasOther = otherWallets.length > 0 || otherTagihan.length > 0

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ms = new Date(e.target.value).getTime()
    if (!isNaN(ms)) onPeriodEndDateChange(ms)
  }

  return (
    <>
      <h1 className="ob-heading">{t('ob.alokasi.heading', lang)}</h1>

      {/* Breakdown */}
      <div className="ob-card" style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '3px 0',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>
            {t('saldo.total', lang)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-primary)',
            }}
          >
            {formatCurrency(totalSaldo, currency)}
          </span>
        </div>
        {primaryWallets.length > 0 &&
          primaryWallets.map((w) => (
            <div key={w.name} style={breakdownRow}>
              <span style={breakdownLabel}>{w.name}</span>
              <span style={breakdownAmt}>{formatCurrency(w.amount, currency)}</span>
            </div>
          ))}
        {tagihanTotal > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '3px 0',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>− Tagihan</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--signal-danger)',
                }}
              >
                −{formatCurrency(tagihanTotal, currency)}
              </span>
            </div>
            {primaryTagihan.map((tg) => (
              <div key={tg.name} style={breakdownRow}>
                <span style={breakdownLabel}>{tg.name}</span>
                <span
                  style={{
                    ...breakdownAmt,
                    color: 'color-mix(in srgb, var(--signal-danger) 70%, var(--ink-tertiary))',
                  }}
                >
                  −{formatCurrency(tg.amount, currency)}
                </span>
              </div>
            ))}
          </>
        )}
        <div style={{ height: 1, background: 'var(--border-hair)', margin: '8px 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 0',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
            = Bisa dialokasikan
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-primary)',
            }}
          >
            {formatCurrency(bisaDialokasi, currency)}
          </span>
        </div>
      </div>

      {/* Other currencies — only if exist */}
      {hasOther && (
        <div className="ob-card" style={{ padding: '14px 16px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-tertiary)',
              marginBottom: 8,
            }}
          >
            {t('ob.alokasi.other_currency_label', lang)}
          </p>
          {otherWallets.map((w) => (
            <div
              key={w.name}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}
            >
              <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>{w.name}</span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink-secondary)',
                }}
              >
                {formatCurrency(w.amount, w.currency)}
              </span>
            </div>
          ))}
          {otherTagihan.map((tg) => (
            <div
              key={tg.name}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}
            >
              <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>{tg.name}</span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--signal-danger)',
                }}
              >
                −{formatCurrency(tg.amount, tg.currency)}
              </span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 10, lineHeight: 1.5 }}>
            Ini nggak ikut dihitung di alokasi harian karena beda mata uang. Uangnya tetap aman,
            kelola terpisah di Beranda.
          </p>
        </div>
      )}

      {/* Period end date — freelance only */}
      {isFreelance && (
        <div className="ob-card" style={{ padding: '12px 16px' }}>
          <p className="ob-label" style={{ marginBottom: 8 }}>
            Periode sampai
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-primary)' }}>
                {periodEndLabel}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                {sisaHari} hari lagi · default akhir bulan
              </div>
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                borderRadius: 8,
                padding: '8px 11px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
                cursor: 'pointer',
              }}
            >
              Ubah
              <input
                type="date"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: 0,
                  height: 0,
                }}
                value={toInputDate(effectivePeriodEnd)}
                onChange={handleDateChange}
              />
            </label>
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ink-primary)',
          lineHeight: 1.5,
          marginBlock: '18px 12px',
        }}
      >
        Mau pakai berapa untuk operasional sampai pemasukan berikutnya ({sisaHari} hari lagi)?
      </p>

      <AlokasiEditor
        bisaDialokasi={bisaDialokasi}
        sisaHari={sisaHari}
        currency={currency}
        operasional={operasional}
        periodeLabel={isFreelance ? `sampai ${periodEndLabel}` : `sampai gajian`}
        onChange={setOperasional}
      />

      <div className="ob-footer">
        <button
          type="button"
          className="ob-btn-primary ob-btn-full"
          onClick={() => onNext(operasional, isFreelance ? effectivePeriodEnd : null)}
        >
          {t('ob.alokasi.start', lang)}
        </button>
      </div>
    </>
  )
}
