import { useState } from 'react'
import { Lock } from 'lucide-react'
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
  compact?: boolean
}

function NumInput({ value, onChange, symbol, accent = false, compact = false }: NumInputProps) {
  const [raw, setRaw] = useState<string | null>(null)
  const display = raw !== null ? raw : value.toLocaleString('id-ID')
  return (
    <div className={`${styles.inputBox} ${accent ? styles.inputBoxActive : ''}`}>
      <span className={styles.inputPrefix}>{symbol}</span>
      <input
        type="text"
        inputMode="numeric"
        className={`${styles.inputNum} ${compact ? styles.inputNumCompact : ''}`}
        value={display}
        onFocus={() => setRaw(value === 0 ? '' : String(value))}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, '')
          setRaw(cleaned)
          onChange(parseInt(cleaned || '0', 10))
        }}
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
  const mengendap = Math.max(0, bisaDialokasi - operasional)
  const jatahHarian = sisaHari > 0 ? Math.round(operasional / sisaHari) : 0

  function setDipakai(v: number) {
    onChange(Math.max(0, Math.min(bisaDialokasi, v)))
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.card} ${compact ? styles.cardCompact : ''}`}>
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

        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>↕ otomatis nyesuain</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabelRow}>
            <Lock size={11} strokeWidth={1.75} />
            <span className={styles.sectionLabelMuted}>{t('alokasi.uang_mengendap', lang)}</span>
            <span className={styles.autoBadge}>{t('alokasi.mengendap_auto', lang)}</span>
          </div>
          <div className={styles.inputBoxReadOnly}>
            <span className={styles.inputPrefix}>{currSymbol}</span>
            <span
              className={`${styles.inputNum} ${styles.inputNumMuted} ${compact ? styles.inputNumCompact : ''}`}
            >
              {mengendap.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <p className={styles.note}>{t('alokasi.mengendap_note', lang)}</p>
      </div>

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
