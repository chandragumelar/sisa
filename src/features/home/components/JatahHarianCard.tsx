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
  uangMengendap: number
  sisaPeriode: number
  saldoBertahan: boolean
}

type CardState =
  | 'defisit'
  | 'mengendap-habis'
  | 'makan-mengendap'
  | 'over-dalam-jatah'
  | 'habis'
  | 'normal'

export function JatahHarianCard({
  jatahHariIni,
  spentToday,
  sisaUang,
  sisaHari,
  currency,
  uangMengendap,
  sisaPeriode,
  saldoBertahan,
}: Props) {
  const lang = useLanguage()
  const curLabel = getCurrencyLabel(currency, lang)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const pct = jatahHariIni > 0 ? Math.min(100, Math.round((spentToday / jatahHariIni) * 100)) : 0
  const lebih = spentToday - jatahHariIni
  const besokRaw = sisaUang / Math.max(1, sisaHari - 1)
  const besok = Math.max(0, Math.round(besokRaw / 1000) * 1000)

  const bantalan = uangMengendap + sisaPeriode

  let state: CardState
  if (bantalan < 0) {
    state = 'defisit'
  } else if (bantalan >= 0 && bantalan < jatahHariIni) {
    state = 'mengendap-habis'
  } else if (sisaPeriode < 0 && bantalan >= jatahHariIni) {
    state = 'makan-mengendap'
  } else if (spentToday > jatahHariIni && sisaPeriode >= 0) {
    state = 'over-dalam-jatah'
  } else if (spentToday === jatahHariIni && jatahHariIni > 0) {
    state = 'habis'
  } else {
    state = 'normal'
  }

  if (
    saldoBertahan &&
    (state === 'defisit' || state === 'mengendap-habis' || state === 'makan-mengendap')
  ) {
    state = 'over-dalam-jatah'
  }

  const isDanger = state === 'defisit' || state === 'mengendap-habis' || state === 'makan-mengendap'
  const isOverCaution = state === 'over-dalam-jatah'
  const isHabis = state === 'habis'

  const dangerBadgeText =
    state === 'defisit'
      ? t('home.jatah_defisit_badge', lang)
      : state === 'mengendap-habis'
        ? t('home.jatah_mengendap_habis_badge', lang)
        : state === 'makan-mengendap'
          ? t('home.jatah_makan_mengendap_badge', lang)
          : ''

  const dangerMsgText =
    state === 'defisit'
      ? t('home.jatah_defisit_msg', lang)
      : state === 'mengendap-habis'
        ? t('home.jatah_mengendap_habis_msg', lang)
        : state === 'makan-mengendap'
          ? t('home.jatah_makan_mengendap_msg', lang)
          : ''

  const cardClass = isDanger
    ? `${styles.card} ${styles.cardDanger}`
    : isOverCaution
      ? `${styles.card} ${styles.cardOver}`
      : styles.card
  const barClass = isDanger
    ? styles.barDanger
    : isOverCaution
      ? styles.barOver
      : isHabis
        ? styles.barSafe
        : ''
  const spentAmtClass = isDanger ? styles.spentAmtDanger : isOverCaution ? styles.spentAmtOver : ''

  return (
    <>
      <div className={cardClass}>
        <div className={styles.headerRow}>
          <div className={styles.labelRow}>
            <span className={styles.label}>
              {t('home.jatah_harian_dynamic', lang).replace('{cur}', curLabel)}
            </span>
            <button
              className={styles.tooltipBtn}
              onClick={() => setTooltipOpen(true)}
              aria-label={t('a11y.info_jatah', lang)}
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
          {isDanger && <span className={styles.dangerBadge}>{dangerBadgeText}</span>}
          {isOverCaution && (
            <span className={styles.overBadge}>{t('home.jatah_lewat_badge', lang)}</span>
          )}
          {isHabis && <span className={styles.pasBadge}>{t('home.jatah_pas_badge', lang)}</span>}
        </div>

        <div className={styles.heroNum}>{formatCurrency(jatahHariIni, currency)}</div>

        <div className={styles.barWrap}>
          <div className={`${styles.bar} ${barClass}`} style={{ width: `${pct}%` }} />
        </div>

        <div className={styles.spentRow}>
          <span className={styles.spentLabel}>{t('home.jatah_keluar', lang)}</span>
          <span className={`${styles.spentAmt} ${spentAmtClass}`}>
            {formatCurrency(spentToday, currency)}
          </span>
        </div>

        {isDanger && (
          <div className={styles.dangerBox}>
            <p className={styles.dangerLine}>{dangerMsgText}</p>
          </div>
        )}

        {isOverCaution && (
          <div className={styles.alertBox}>
            <p className={styles.alertLine}>
              {t('home.jatah_lewat_title', lang).replace('{n}', formatCurrency(lebih, currency))}
            </p>
            <p className={styles.alertLine}>
              {t('home.jatah_besok', lang).replace('{n}', formatCurrency(besok, currency))}
            </p>
          </div>
        )}

        {isHabis && (
          <div className={styles.pasBox}>
            <p className={styles.pasLine}>{t('home.jatah_pas_msg', lang)}</p>
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
