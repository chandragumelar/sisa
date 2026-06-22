import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './TransisiPeriodeBanner.module.css'

interface Props {
  currency: string
  defaultNominal: number | null
  nowMs: number
  onConfirm: (lastPaydayConfirmed: number, fixedIncome: number | null) => void
}

function msToDateInputStr(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateInputToMs(str: string): number {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function TransisiPeriodeBanner({ currency, defaultNominal, nowMs, onConfirm }: Props) {
  const lang = useLanguage()
  const [popupOpen, setPopupOpen] = useState(false)
  const [dateStr, setDateStr] = useState(msToDateInputStr(nowMs))
  const [nominalStr, setNominalStr] = useState(
    defaultNominal && defaultNominal > 0 ? formatNominalDisplay(String(defaultNominal)) : '',
  )

  function handleConfirm() {
    const selectedMs = parseDateInputToMs(dateStr)
    const nominalRaw = parseNominalRaw(nominalStr)
    const nominalNum = nominalRaw ? Number(nominalRaw) : null
    onConfirm(selectedMs, nominalNum && nominalNum > 0 ? nominalNum : null)
    setPopupOpen(false)
  }

  return (
    <>
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <span className={styles.bannerHeading}>{t('home.transisi_heading', lang)}</span>
          <span className={styles.bannerSub}>{t('home.transisi_sub', lang)}</span>
        </div>
        <button className={styles.bannerBtn} onClick={() => setPopupOpen(true)}>
          {t('home.transisi_btn', lang)}
        </button>
      </div>

      <BottomSheet
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={t('home.transisi_popup_heading', lang)}
      >
        <p className={styles.popupBody}>{t('home.transisi_popup_body', lang)}</p>

        <div className={styles.popupField}>
          <label className={styles.popupLabel}>{t('home.transisi_popup_date_label', lang)}</label>
          <input
            className={styles.popupInput}
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </div>

        <div className={styles.popupField}>
          <label className={styles.popupLabel}>
            {t('home.transisi_popup_nominal_label', lang)}
          </label>
          <div className={styles.popupInputRow}>
            <span className={styles.popupInputPrefix}>{getCurrencySymbol(currency)}</span>
            <input
              className={styles.popupInput}
              type="text"
              inputMode="numeric"
              placeholder="5.000.000"
              value={nominalStr}
              onChange={(e) => setNominalStr(formatNominalDisplay(parseNominalRaw(e.target.value)))}
            />
          </div>
        </div>

        <div className={styles.popupActions}>
          <button className={styles.popupBtnCancel} onClick={() => setPopupOpen(false)}>
            {t('home.transisi_popup_cancel', lang)}
          </button>
          <button className={styles.popupBtnConfirm} onClick={handleConfirm} disabled={!dateStr}>
            {t('home.transisi_popup_confirm', lang)}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
