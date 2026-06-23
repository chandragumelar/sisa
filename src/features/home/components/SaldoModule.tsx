import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Wallet } from '@/db/database'
import type { BudgetMode } from '@/shared/utils/budget.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './SaldoModule.module.css'

const WALLET_DOTS = ['#60a5fa', '#f97316', '#34d399', '#a78bfa', '#f472b6']

interface Props {
  wallets: Wallet[]
  currency: string
  sisaUang: number
  totalSaldo: number
  tagihanUnpaid: number
  mengendap: number
  monthlyIncome: number
  monthlyExpense: number
  totalNabung: number
  mode: BudgetMode
  shortfall: number
  daysUntilPayday: number
  nextPaydayMs: number
  conditionLabel: string | null
  conditionColor: string | null
  onWalletTap?: (wallet: Wallet) => void
  onHistoryTap?: () => void
  onAddWalletTap?: () => void
  onEditAlokasi?: () => void
}

export function SaldoModule({
  wallets,
  currency,
  sisaUang,
  totalSaldo,
  tagihanUnpaid,
  mengendap,
  monthlyIncome,
  monthlyExpense,
  totalNabung,
  mode,
  shortfall,
  daysUntilPayday,
  nextPaydayMs,
  conditionLabel,
  conditionColor,
  onWalletTap,
  onHistoryTap,
  onAddWalletTap,
  onEditAlokasi,
}: Props) {
  const lang = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const nextPaydayDate = new Date(nextPaydayMs)
  const paydayLabel = `${nextPaydayDate.getDate()} ${nextPaydayDate.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short' })} ${nextPaydayDate.getFullYear()}`

  return (
    <>
      <div className={styles.wrapper}>
        {/* ── Card 1: SISA UANG ── */}
        <div
          className={mode === 'bertahan' ? `${styles.card} ${styles.cardBertahan}` : styles.card}
        >
          <div className={styles.headerRow}>
            <div className={styles.heroLabelRow}>
              <span className={styles.label}>{t('home.sisa_uang', lang)}</span>
              <button
                className={styles.tooltipBtn}
                onClick={() => setTooltipOpen(true)}
                aria-label="Info sisa uang"
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
            {mode === 'bertahan' ? (
              <span className={styles.badgeBertahan}>{t('saldo.mode_bertahan_badge', lang)}</span>
            ) : mode === 'hari-terakhir' ? (
              <span className={styles.badgeHariTerakhir}>
                {t('saldo.mode_hariterakhir_badge', lang)}
              </span>
            ) : (
              <div className={styles.paydayPill}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M6 3.5V6L7.8 7.8" />
                </svg>
                <span>
                  {(daysUntilPayday === 1
                    ? t('home.day_to_payday', lang)
                    : t('home.days_to_payday', lang)
                  ).replace('{n}', String(daysUntilPayday))}
                </span>
              </div>
            )}
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
              <div className={styles.heroNum}>{formatCurrency(sisaUang, currency)}</div>
              <p className={styles.hariterakhirNote}>{t('saldo.mode_hariterakhir_note', lang)}</p>
            </>
          )}

          {/* Mode: Normal */}
          {mode === 'normal' && (
            <>
              <div className={styles.heroNum}>{formatCurrency(sisaUang, currency)}</div>
              {conditionLabel && (
                <span
                  className={styles.conditionBadge}
                  style={{ color: conditionColor ?? undefined }}
                >
                  {conditionLabel}
                </span>
              )}
              <div className={styles.heroSub}>
                {(daysUntilPayday === 1
                  ? t('home.day_to_payday', lang)
                  : t('home.days_to_payday', lang)
                ).replace('{n}', String(daysUntilPayday))}
              </div>

              <button className={styles.expandBtn} onClick={() => setExpanded((v) => !v)}>
                <span className={styles.expandChevron}>{expanded ? '∧' : '∨'}</span>
                {expanded ? t('home.expand_hide', lang) : t('home.expand_show', lang)}
                <span className={styles.expandChevron}>{expanded ? '∧' : '∨'}</span>
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
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className={styles.lockIcon}
                        >
                          <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
                          <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" strokeLinecap="round" />
                        </svg>
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
                          atur
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={styles.rincianSectionLabel}>{t('home.bulan_ini', lang)}</p>
                  <RincianRow
                    label={t('saldo.rincian_pemasukan', lang)}
                    value={formatCurrency(monthlyIncome, currency)}
                  />
                  <RincianRow
                    label={t('saldo.rincian_tagihan', lang)}
                    value={formatCurrency(monthlyExpense, currency)}
                    minus
                  />
                  {totalNabung > 0 && (
                    <RincianRow
                      label={t('saldo.rincian_nabung', lang)}
                      value={formatCurrency(totalNabung, currency)}
                      minus
                    />
                  )}
                  {onHistoryTap && (
                    <button className={styles.historyLink} onClick={onHistoryTap}>
                      {t('home.history_link', lang)}
                    </button>
                  )}

                  <p className={styles.rincianSectionLabel}>{t('home.dompet', lang)}</p>
                  {wallets.length > 0 && (
                    <div className={styles.walletList}>
                      {wallets.map((w, i) => (
                        <button
                          key={w.id}
                          className={styles.walletRow}
                          style={{
                            borderBottom:
                              i < wallets.length - 1 ? '1px solid var(--border-soft)' : 'none',
                          }}
                          onClick={() => onWalletTap?.(w)}
                        >
                          <div className={styles.walletLeft}>
                            <span
                              className={styles.walletDot}
                              style={{ background: WALLET_DOTS[i % WALLET_DOTS.length] }}
                            />
                            <span className={styles.walletName}>{w.name}</span>
                          </div>
                          <span className={styles.walletAmt}>
                            {formatCurrency(w.balance, w.currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {onAddWalletTap && (
                    <button className={styles.addWalletInline} onClick={onAddWalletTap}>
                      {t('saldo.add_wallet', lang)}
                    </button>
                  )}
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
        <p className={styles.tooltipBody}>{t('home.sisa_uang_tooltip', lang)}</p>
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
