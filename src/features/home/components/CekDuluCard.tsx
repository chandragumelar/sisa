import { useState } from 'react'
import { Search, ChevronRight, Info, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
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
              <Search size={32} strokeWidth={1.75} />
            </div>
            <div className={styles.emptyHeading}>{t('cek.empty.heading', lang)}</div>
            <p className={styles.emptyBody}>{t('cek.empty.body', lang)}</p>
            <button className={styles.ctaBtn} onClick={onAddTagihan}>
              {t('cek.empty.cta', lang)}
              <ChevronRight size={12} strokeWidth={1.75} />
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
              <Info size={12} strokeWidth={1.75} />
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
                <AlertTriangle size={11} strokeWidth={1.75} />
                {t('cek.andai_warning', lang).replace('{item}', missingItem)}
              </div>
            </div>

            <button className={styles.ctaBtn} onClick={onAddMissing}>
              {t('cek.cta_add', lang).replace('{item}', missingItem)}
              <ChevronRight size={12} strokeWidth={1.75} />
            </button>
          </>
        )}

        {/* ── State 2: full (existing DecisionHero layout) ── */}
        {cardState === 2 && (
          <>
            <div className={styles.heading}>{t('decision.heading', lang)}</div>

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
              <ChevronRight size={13} strokeWidth={1.75} />
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
        <CheckCircle2
          className={styles.checkIconDone}
          size={15}
          strokeWidth={1.75}
          color="var(--signal-safe)"
        />
      ) : (
        <Circle
          className={styles.checkIconTodo}
          size={15}
          strokeWidth={1.75}
          color="var(--accent)"
        />
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
