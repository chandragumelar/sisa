import { useState } from 'react'
import type { ReactNode } from 'react'
import { Info, Clock, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import type { BudgetMode } from '@/shared/utils/budget.utils'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './SaldoModule.module.css'

const RINCIAN_COLLAPSED_KEY = 'sisa:saldoRincianCollapsed'

/** Splits formatCurrency's own output on its own currency symbol — never
 * assumes prefix length/position, since IDR ("Rp 500.000") and AUD
 * ("AU$500.000") differ on both counts. */
function HeroAmount({ amount, currency }: { amount: number; currency: string }) {
  const formatted = formatCurrency(amount, currency)
  const symbol = getCurrencySymbol(currency)
  const numberPart = formatted.replace(symbol, '').trim()
  return (
    <div className={styles.heroNum} aria-label={formatted}>
      <span className={styles.heroPrefix} aria-hidden="true">
        {symbol}
      </span>
      <span aria-hidden="true">{numberPart}</span>
    </div>
  )
}

interface Props {
  currency: string
  sisaUang: number
  totalSaldo: number
  tagihanUnpaid: number
  mengendap: number
  mode: BudgetMode
  shortfall: number
  daysUntilPayday: number
  nextPaydayMs: number
  conditionLabel: string | null
  conditionColor: string | null
  onEditAlokasi?: () => void
}

export function SaldoModule({
  currency,
  sisaUang,
  totalSaldo,
  tagihanUnpaid,
  mengendap,
  mode,
  shortfall,
  daysUntilPayday,
  nextPaydayMs,
  conditionLabel,
  conditionColor,
  onEditAlokasi,
}: Props) {
  const lang = useLanguage()
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(RINCIAN_COLLAPSED_KEY) !== '1'
    } catch {
      return true
    }
  })
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const nextPaydayDate = new Date(nextPaydayMs)
  const paydayLabel = `${nextPaydayDate.getDate()} ${nextPaydayDate.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short' })} ${nextPaydayDate.getFullYear()}`

  const cadanganState = sisaUang > 0 ? 'aman' : mengendap > 0 ? 'makan-cadangan' : 'cadangan-habis'

  function toggleExpanded() {
    setExpanded((v) => {
      const next = !v
      try {
        if (next) {
          localStorage.removeItem(RINCIAN_COLLAPSED_KEY)
        } else {
          localStorage.setItem(RINCIAN_COLLAPSED_KEY, '1')
        }
      } catch {
        // storage unavailable — state tetap jalan untuk sesi ini
      }
      return next
    })
  }

  return (
    <>
      <div className={styles.wrapper}>
        {/* ── Card 1: SISA UANG ── */}
        <div
          className={mode === 'bertahan' ? `${styles.card} ${styles.cardBertahan}` : styles.card}
        >
          <div className={styles.headerRow}>
            <div className={styles.heroLabelRow}>
              <span className={styles.label}>{t('home.sisa_uang_dynamic', lang)}</span>
              <button
                className={styles.tooltipBtn}
                onClick={() => setTooltipOpen(true)}
                aria-label={t('a11y.info_sisa', lang)}
              >
                <Info size={13} strokeWidth={1.75} />
              </button>
            </div>
            {mode === 'bertahan' ? (
              <span className={styles.badgeBertahan}>{t('saldo.mode_bertahan_badge', lang)}</span>
            ) : mode === 'hari-terakhir' ? (
              <span className={styles.badgeHariTerakhir}>
                {t('saldo.mode_hariterakhir_badge', lang)}
              </span>
            ) : null}
          </div>

          {/* Mode: Bertahan */}
          {mode === 'bertahan' && (
            <div className={styles.bertahanBody}>
              <p className={styles.bertahanMsg}>{t('saldo.mode_bertahan_msg', lang)}</p>
              <div className={styles.shortfallBox}>
                <div className={styles.shortfallMeta}>
                  <span className={styles.shortfallLabel}>
                    {t('saldo.mode_bertahan_shortfall_label', lang)}
                  </span>
                  <span className={styles.shortfallAmanMulai}>
                    {t('saldo.mode_bertahan_aman_mulai', lang)}
                    <br />
                    <span className={styles.shortfallDate}>{paydayLabel}</span>
                  </span>
                </div>
                <div className={styles.shortfallAmount}>{formatCurrency(shortfall, currency)}</div>
              </div>
              <p className={styles.bertahanNote}>{t('saldo.mode_bertahan_note', lang)}</p>
            </div>
          )}

          {/* Mode: Hari Terakhir */}
          {mode === 'hari-terakhir' && (
            <>
              <div className={styles.heroSublabel}>
                {t('saldo.mode_hariterakhir_sub_label', lang)}
              </div>
              <HeroAmount amount={sisaUang} currency={currency} />
              <p className={styles.hariterakhirNote}>{t('saldo.mode_hariterakhir_note', lang)}</p>
            </>
          )}

          {/* Mode: Normal */}
          {mode === 'normal' && (
            <>
              <HeroAmount amount={sisaUang} currency={currency} />
              <div className={styles.paydayPill}>
                <Clock size={11} strokeWidth={1.75} />
                <span>
                  {(daysUntilPayday === 1
                    ? t('home.day_to_payday', lang)
                    : t('home.days_to_payday', lang)
                  ).replace('{n}', String(daysUntilPayday))}
                </span>
              </div>
              {conditionLabel && (
                <span
                  className={styles.conditionBadge}
                  style={{ color: conditionColor ?? undefined }}
                >
                  {conditionLabel}
                </span>
              )}
              {cadanganState === 'makan-cadangan' && (
                <p className={styles.cadanganNote}>
                  {t('saldo.cadangan_makan', lang).replace(
                    '{n}',
                    formatCurrency(mengendap, currency),
                  )}
                </p>
              )}
              {cadanganState === 'cadangan-habis' && (
                <p className={styles.cadanganHabis}>{t('saldo.cadangan_habis', lang)}</p>
              )}
              <button className={styles.expandBtn} onClick={toggleExpanded}>
                {expanded ? (
                  <ChevronUp size={12} strokeWidth={1.75} className={styles.expandChevron} />
                ) : (
                  <ChevronDown size={12} strokeWidth={1.75} className={styles.expandChevron} />
                )}
                {expanded ? t('home.expand_hide', lang) : t('home.expand_show', lang)}
                {expanded ? (
                  <ChevronUp size={12} strokeWidth={1.75} className={styles.expandChevron} />
                ) : (
                  <ChevronDown size={12} strokeWidth={1.75} className={styles.expandChevron} />
                )}
              </button>

              {expanded && (
                <div className={styles.rincian}>
                  <p className={styles.rincianSectionLabel}>{t('home.duit_di_mana', lang)}</p>
                  <RincianRow
                    label={t('saldo.total_saldo_label', lang)}
                    value={formatCurrency(totalSaldo, currency)}
                  />
                  {tagihanUnpaid > 0 && (
                    <RincianRow
                      label={t('saldo.rincian_tagihan', lang)}
                      value={formatCurrency(tagihanUnpaid, currency)}
                      minus
                    />
                  )}
                  <RincianRow
                    label={
                      <span className={styles.rincianLabelMuted}>
                        <Lock size={10} strokeWidth={1.75} className={styles.lockIcon} />
                        {t('saldo.uang_mengendap_label', lang)}
                      </span>
                    }
                    value={formatCurrency(mengendap, currency)}
                    muted
                    minus
                  />
                  <div className={styles.rincianDivider} />
                  <div className={styles.rincianSisaRow}>
                    <span className={styles.rincianSisaLabel}>{t('home.sisa_uang', lang)}</span>
                    <div className={styles.rincianSisaRight}>
                      <span className={styles.rincianSisaAmt}>
                        {formatCurrency(sisaUang, currency)}
                      </span>
                      {onEditAlokasi && (
                        <button className={styles.aturBtn} onClick={onEditAlokasi}>
                          {t('home.atur_alokasi', lang)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        title={t('home.sisa_uang', lang)}
      >
        <p className={styles.tooltipBody}>{t('home.sisa_uang_why_1', lang)}</p>
        <p className={styles.tooltipBody} style={{ marginTop: '12px' }}>
          {t('home.sisa_uang_why_2', lang)}
        </p>
        <p className={styles.tooltipBody} style={{ marginTop: '12px' }}>
          {t('home.sisa_uang_why_3', lang)}
        </p>
      </BottomSheet>
    </>
  )
}

function RincianRow({
  label,
  value,
  minus,
  bold,
  muted,
}: {
  label: ReactNode
  value: string
  minus?: boolean
  bold?: boolean
  muted?: boolean
}) {
  return (
    <div className={`${styles.rincianRow} ${bold ? styles.rincianRowBold : ''}`}>
      <span className={styles.rincianLabel}>{label}</span>
      <span
        className={`${styles.rincianVal} ${minus ? styles.rincianValMinus : ''} ${muted ? styles.rincianValMuted : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
