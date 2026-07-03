import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencyLabel } from '@/constants/currencies'
import styles from './CekDuluCard.module.css'

interface Props {
  currency: string
  walletCount: number
  tagihanCount: number
  sisa: number
  unpaidTagihanTotal: number
  onCekDulu: (amount?: number) => void
  onAndai: () => void
  onAddTagihan: () => void
  onAddWallet: () => void
}

type CardState = 0 | 1 | 2

function getCardState(walletCount: number, tagihanCount: number): CardState {
  if (walletCount > 0 && tagihanCount > 0) return 2
  if (walletCount === 0 && tagihanCount === 0) return 0
  return 1
}

export function CekDuluCard({
  currency,
  walletCount,
  tagihanCount,
  sisa,
  unpaidTagihanTotal,
  onCekDulu,
  onAndai,
  onAddTagihan,
  onAddWallet,
}: Props) {
  const lang = useLanguage()
  const [amountStr, setAmountStr] = useState('')
  const curLabel = getCurrencyLabel(currency, lang)
  const cardState = getCardState(walletCount, tagihanCount)
  const hasTagihan = tagihanCount > 0
  const missingItem = !hasTagihan ? t('cek.item_tagihan', lang) : t('cek.item_wallet', lang)
  const onAddMissing = !hasTagihan ? onAddTagihan : onAddWallet

  function handleSubmit() {
    const raw = parseNominalRaw(amountStr)
    const val = parseInt(raw, 10)
    onCekDulu(isNaN(val) || val === 0 ? undefined : val)
  }

  return (
    <div className={styles.card}>
      <div key={cardState} className={styles.content}>
        {/* ── State 0: empty ── */}
        {cardState === 0 && (
          <>
            <div className={styles.eyebrow}>
              {t('cek.card_title_dynamic', lang).replace('{cur}', curLabel)}
            </div>
            <div className={styles.emptyIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
            </div>
            <div className={styles.emptyHeading}>{t('cek.empty.heading', lang)}</div>
            <p className={styles.emptyBody}>{t('cek.empty.body', lang)}</p>
            <button className={styles.ctaBtn} onClick={onAddTagihan}>
              {t('cek.empty.cta', lang)}
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 3L9.5 7L5.5 11" />
              </svg>
            </button>
          </>
        )}

        {/* ── State 1: partial ── */}
        {cardState === 1 && (
          <>
            <div className={styles.headerRow}>
              <div className={styles.eyebrow}>
                {t('cek.card_title_dynamic', lang).replace('{cur}', curLabel)}
              </div>
              <span className={styles.badgeEstimasi}>{t('cek.badge_estimasi', lang)}</span>
            </div>

            <div className={styles.sectionLabel}>{t('cek.section_label', lang)}</div>
            <div className={styles.checklist}>
              <CheckRow
                done={hasTagihan}
                label={t('cek.item_tagihan', lang)}
                doneText={t('cek.done_tagihan', lang).replace('{n}', String(tagihanCount))}
                todoText={t('cek.need_fill', lang)}
                onTodo={onAddTagihan}
              />
            </div>

            <div className={styles.disclaimer}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M7 6v4M7 4.5V4" />
                <circle cx="7" cy="7" r="6" />
              </svg>
              {t('cek.disclaimer', lang).replace('{item}', missingItem)}
            </div>

            <div className={styles.estimasiRows}>
              <div className={styles.estimasiRow}>
                <span className={styles.estimasiLabel}>{t('cek.row_sisa', lang)}</span>
                <span
                  className={
                    sisa < 0 ? `${styles.estimasiAmt} ${styles.estimasiAmtNeg}` : styles.estimasiAmt
                  }
                >
                  {formatCurrency(sisa, currency)}
                </span>
              </div>
              <div className={styles.estimasiRow}>
                <span className={styles.estimasiLabel}>{t('cek.row_tagihan', lang)}</span>
                <span className={styles.estimasiAmt}>
                  {formatCurrency(unpaidTagihanTotal, currency)}
                </span>
              </div>
            </div>

            <div className={styles.andaiDisabled}>
              <div className={styles.andaiInputWrap}>
                <span className={styles.andaiCurrencySymbol}>{getCurrencySymbol(currency)}</span>
                <input
                  className={styles.andaiInput}
                  type="text"
                  placeholder={t('decision.input_placeholder', lang)}
                  disabled
                />
              </div>
              <div className={styles.andaiWarning}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M7 2L13 12H1L7 2Z" />
                  <path d="M7 6v3M7 10.5V10" />
                </svg>
                {t('cek.andai_warning', lang).replace('{item}', missingItem)}
              </div>
            </div>

            <button className={styles.ctaBtn} onClick={onAddMissing}>
              {t('cek.cta_add', lang).replace('{item}', missingItem)}
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 3L9.5 7L5.5 11" />
              </svg>
            </button>
          </>
        )}

        {/* ── State 2: full (existing DecisionHero layout) ── */}
        {cardState === 2 && (
          <>
            <div className={styles.headerRow}>
              <div className={styles.eyebrow}>
                {t('cek.card_title_dynamic', lang).replace('{cur}', curLabel)}
              </div>
            </div>

            <div className={styles.heading}>
              {t('decision.heading_line1', lang)}
              <br />
              {t('decision.heading_line2', lang)}
            </div>

            <div className={styles.inputWrapper}>
              <span className={styles.currencySymbol}>{getCurrencySymbol(currency)}</span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                placeholder={t('decision.input_placeholder', lang)}
                value={amountStr}
                onChange={(e) =>
                  setAmountStr(formatNominalDisplay(parseNominalRaw(e.target.value)))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
            </div>

            <button className={styles.cekBtn} onClick={handleSubmit}>
              <span>{t('decision.cek_btn', lang)}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 3L9.5 7L5.5 11" />
              </svg>
            </button>

            <div className={styles.andaiRow}>
              <span className={styles.andaiText}>{t('decision.andai_prefix', lang)} </span>
              <button className={styles.andaiLink} onClick={onAndai}>
                {t('decision.andai_link', lang)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface CheckRowProps {
  done: boolean
  label: string
  doneText: string
  todoText: string
  onTodo: () => void
}

function CheckRow({ done, label, doneText, todoText, onTodo }: CheckRowProps) {
  return (
    <div className={styles.checkRow}>
      {done ? (
        <svg
          className={styles.checkIconDone}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="7" fill="var(--signal-safe)" />
          <path
            d="M5 8L7.5 10.5L11.5 5.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className={styles.checkIconTodo}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="6.5" stroke="var(--accent)" strokeWidth="1.4" />
        </svg>
      )}
      <span className={styles.checkLabel}>{label}</span>
      {done ? (
        <span className={styles.checkDoneText}>{doneText}</span>
      ) : (
        <button className={styles.checkTodoBtn} onClick={onTodo}>
          {todoText} →
        </button>
      )}
    </div>
  )
}
