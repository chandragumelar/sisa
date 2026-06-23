import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './AlokasiEditor.module.css'

interface Props {
  bisaDialokasi: number
  sisaHari: number
  currency: string
  operasional: number
  onChange: (v: number) => void
  compact?: boolean
}

export function AlokasiEditor({
  bisaDialokasi,
  sisaHari,
  currency,
  operasional,
  onChange,
  compact = false,
}: Props) {
  const mengendap = bisaDialokasi - operasional
  const jatahHarian = sisaHari > 0 ? Math.round(operasional / sisaHari) : 0
  const step = Math.max(1000, Math.round(bisaDialokasi / 100 / 1000) * 1000)

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value)
    onChange(Math.round(raw / step) * step)
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.card} ${compact ? styles.cardCompact : ''}`}>
        {/* Operasional */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Operasional</span>
            <span className={styles.sectionHint}>yang mau lo pakai</span>
          </div>
          <div className={`${styles.inputBox} ${styles.inputBoxActive}`}>
            <span className={styles.inputPrefix}>{currency === 'IDR' ? 'Rp' : currency}</span>
            <span className={`${styles.inputNum} ${compact ? styles.inputNumCompact : ''}`}>
              {operasional.toLocaleString('id-ID')}
            </span>
          </div>
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
            onChange={handleSlider}
          />
          <div className={styles.sliderLabels}>
            <span>{formatCurrency(0, currency)}</span>
            <span className={styles.sliderHint}>← geser untuk ubah</span>
            <span>{formatCurrency(bisaDialokasi, currency)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>↕ saling terhubung</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Mengendap */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabelMuted}>
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
              Mengendap
            </div>
            <span className={styles.sectionHint}>didiamkan periode ini</span>
          </div>
          <div className={styles.inputBox}>
            <span className={styles.inputPrefix}>
              {mengendap < 0 ? '−' : ''}
              {currency === 'IDR' ? 'Rp' : currency}
            </span>
            <span
              className={`${styles.inputNum} ${styles.inputNumMuted} ${compact ? styles.inputNumCompact : ''} ${mengendap < 0 ? styles.inputNumDanger : ''}`}
            >
              {Math.abs(mengendap).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <p className={styles.note}>Mengendap boleh Rp 0. Ga ada aturan harus nabung.</p>
      </div>

      {/* Jatah harian preview */}
      {sisaHari > 0 && (
        <div className={styles.jatahBox}>
          <span className={styles.jatahLabel}>Jatah harian ≈</span>
          <div className={styles.jatahRight}>
            <span className={styles.jatahNum}>{formatCurrency(jatahHarian, currency)}</span>
            <span className={styles.jatahUnit}>/hari ({sisaHari} hari)</span>
          </div>
        </div>
      )}
    </div>
  )
}
