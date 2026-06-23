import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
import styles from './AlokasiEditor.module.css'

interface Props {
  bisaDialokasi: number
  sisaHari: number
  currency: string
  operasional: number
  periodeLabel: string
  onChange: (v: number) => void
  compact?: boolean
}

interface NumInputProps {
  value: number
  onChange: (v: number) => void
  symbol: string
  accent?: boolean
  danger?: boolean
  compact?: boolean
}

function NumInput({
  value,
  onChange,
  symbol,
  accent = false,
  danger = false,
  compact = false,
}: NumInputProps) {
  const [raw, setRaw] = useState<string | null>(null)
  const display = raw !== null ? raw : value.toLocaleString('id-ID')
  return (
    <div
      className={`${styles.inputBox} ${accent ? styles.inputBoxActive : ''} ${danger ? styles.inputBoxDanger : ''}`}
    >
      <span className={styles.inputPrefix}>{symbol}</span>
      <input
        type="text"
        inputMode="numeric"
        className={`${styles.inputNum} ${compact ? styles.inputNumCompact : ''} ${danger ? styles.inputNumDanger : ''}`}
        value={display}
        onFocus={() => setRaw(value === 0 ? '' : String(value))}
        onChange={(e) => setRaw(e.target.value.replace(/\D/g, ''))}
        onBlur={() => {
          if (raw !== null) {
            onChange(parseInt(raw || '0', 10))
            setRaw(null)
          }
        }}
      />
    </div>
  )
}

export function AlokasiEditor({
  bisaDialokasi,
  sisaHari,
  currency,
  operasional,
  periodeLabel,
  onChange,
  compact = false,
}: Props) {
  const lang = useLanguage()
  const currSymbol = getCurrencySymbol(currency)
  const mengendap = bisaDialokasi - operasional
  const jatahHarian = sisaHari > 0 ? Math.round(operasional / sisaHari) : 0
  const step = Math.max(1000, Math.round(bisaDialokasi / 100 / 1000) * 1000)

  function setDipakai(v: number) {
    onChange(Math.max(0, Math.min(bisaDialokasi, v)))
  }

  function setMengendapInput(v: number) {
    const m = Math.max(0, Math.min(bisaDialokasi, v))
    onChange(bisaDialokasi - m)
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.card} ${compact ? styles.cardCompact : ''}`}>
        {/* Buat dipakai */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>{t('alokasi.buat_dipakai', lang)}</div>
          <NumInput
            value={operasional}
            onChange={setDipakai}
            symbol={currSymbol}
            accent
            compact={compact}
          />
        </div>

        {/* Slider */}
        <div className={styles.sliderWrap}>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={bisaDialokasi}
            step={step}
            value={operasional}
            onChange={(e) => setDipakai(Math.round(+e.target.value / step) * step)}
          />
          <div className={styles.sliderLabels}>
            <span>{currSymbol}0</span>
            <span className={styles.sliderHint}>{t('alokasi.slider_hint', lang)}</span>
            <span>
              {currSymbol}
              {bisaDialokasi.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Linked divider */}
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>↕ saling terhubung</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Uang Mengendap */}
        <div className={styles.section}>
          <div className={styles.sectionLabelRow}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <rect x="2.5" y="5.5" width="8" height="6.5" rx="1.5" />
              <path d="M4.5 5.5V4a2 2 0 1 1 4 0v1.5" strokeLinecap="round" />
            </svg>
            <span className={styles.sectionLabelMuted}>{t('alokasi.uang_mengendap', lang)}</span>
          </div>
          <NumInput
            value={Math.abs(mengendap)}
            onChange={setMengendapInput}
            symbol={mengendap < 0 ? `−${currSymbol}` : currSymbol}
            danger={mengendap < 0}
            compact={compact}
          />
        </div>

        <p className={styles.note}>{t('alokasi.mengendap_note', lang)}</p>
      </div>

      {/* Jatah harian preview */}
      {sisaHari > 0 && (
        <div className={styles.jatahBox}>
          <span className={styles.jatahLabel}>{t('alokasi.jatah_harian_approx', lang)}</span>
          <div className={styles.jatahRight}>
            <span className={styles.jatahNum}>
              {currSymbol}
              {jatahHarian.toLocaleString('id-ID')}
            </span>
            <span className={styles.jatahUnit}>/hari {periodeLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
