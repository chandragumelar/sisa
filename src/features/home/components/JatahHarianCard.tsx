import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { getCurrencyLabel } from '@/constants/currencies'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './JatahHarianCard.module.css'

interface Props {
  jatahHariIni: number
  spentToday: number
  sisaUang: number
  sisaHari: number
  currency: string
}

export function JatahHarianCard({ jatahHariIni, spentToday, sisaUang, sisaHari, currency }: Props) {
  const lang = useLanguage()
  const curLabel = getCurrencyLabel(currency, lang)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const isOver = spentToday > jatahHariIni
  const pct = jatahHariIni > 0 ? Math.min(100, Math.round((spentToday / jatahHariIni) * 100)) : 0
  const lebih = spentToday - jatahHariIni
  const besok = Math.max(0, Math.round(sisaUang / Math.max(1, sisaHari - 1)))

  return (
    <>
      <div className={`${styles.card} ${isOver ? styles.cardOver : ''}`}>
        <div className={styles.headerRow}>
          <div className={styles.labelRow}>
            <span className={styles.label}>
              {t('home.jatah_harian_dynamic', lang).replace('{cur}', curLabel)}
            </span>
            <button
              className={styles.tooltipBtn}
              onClick={() => setTooltipOpen(true)}
              aria-label="Info jatah harian"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <circle cx="6" cy="6" r="5" />
                <line x1="6" y1="5.5" x2="6" y2="8.5" strokeLinecap="round" />
                <circle cx="6" cy="3.4" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
          {isOver && <span className={styles.overBadge}>{t('home.jatah_lewat_badge', lang)}</span>}
        </div>

        <div className={styles.heroNum}>{formatCurrency(jatahHariIni, currency)}</div>

        <div className={styles.barWrap}>
          <div
            className={`${styles.bar} ${isOver ? styles.barOver : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className={styles.spentRow}>
          <span className={styles.spentLabel}>{t('home.jatah_keluar', lang)}</span>
          <span className={`${styles.spentAmt} ${isOver ? styles.spentAmtOver : ''}`}>
            {formatCurrency(spentToday, currency)}
          </span>
        </div>

        {isOver && (
          <div className={styles.alertBox}>
            <p className={styles.alertLine}>
              {t('home.jatah_lewat_title', lang).replace('{n}', formatCurrency(lebih, currency))}
            </p>
            <p className={styles.alertLine}>
              {t('home.jatah_besok', lang).replace('{n}', formatCurrency(besok, currency))}
            </p>
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        title={t('home.jatah_harian_label', lang)}
      >
        <p className={styles.tooltipBody}>{t('home.jatah_harian_tooltip', lang)}</p>
      </BottomSheet>
    </>
  )
}
