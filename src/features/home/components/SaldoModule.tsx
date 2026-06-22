import { useState } from 'react'
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
  sisaPeriode: number
  jatahHarian: number | null
  anggaranOperasional: number
  pemasukanPeriode: number
  uangMengendap: number
  mode: BudgetMode
  shortfall: number
  hariPeriode: number
  unpaidTagihanTotal: number
  totalNabung: number
  daysUntilPayday: number
  nextPaydayMs: number
  conditionLabel: string | null
  conditionColor: string | null
  showPaydayPrompt: boolean
  onPaydayConfirm: () => void
  onPaydayDecline: () => void
  onWalletTap?: (wallet: Wallet) => void
  onHistoryTap?: () => void
  onAddWalletTap?: () => void
}

export function SaldoModule({
  wallets,
  currency,
  sisaPeriode,
  jatahHarian,
  anggaranOperasional,
  pemasukanPeriode,
  uangMengendap,
  mode,
  shortfall,
  hariPeriode,
  unpaidTagihanTotal,
  totalNabung,
  daysUntilPayday,
  nextPaydayMs,
  conditionLabel,
  conditionColor,
  showPaydayPrompt,
  onPaydayConfirm,
  onPaydayDecline,
  onWalletTap,
  onHistoryTap,
  onAddWalletTap,
}: Props) {
  const lang = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [walletExpanded, setWalletExpanded] = useState(false)
  const [jatahTooltipOpen, setJatahTooltipOpen] = useState(false)
  const [anggaranTooltipOpen, setAnggaranTooltipOpen] = useState(false)

  const totalSaldo = wallets.reduce((sum, w) => sum + w.balance, 0)
  const effectiveMode = showPaydayPrompt ? 'hari-gajian' : mode
  const hariTerlewat = Math.max(0, hariPeriode - daysUntilPayday)
  const nextPaydayDate = new Date(nextPaydayMs)
  const paydayLabel = `${nextPaydayDate.getDate()} ${nextPaydayDate.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short' })} ${nextPaydayDate.getFullYear()}`

  return (
    <>
      <div className={styles.wrapper}>
        <div
          className={
            effectiveMode === 'bertahan'
              ? `${styles.card} ${styles.cardBertahan}`
              : effectiveMode === 'hari-gajian'
                ? `${styles.card} ${styles.cardHariGajian}`
                : styles.card
          }
        >
          {/* ── Header row ── */}
          <div className={styles.headerRow}>
            <span className={styles.label}>{t('home.saldo_bebas', lang)}</span>
            {effectiveMode === 'bertahan' ? (
              <span className={styles.badgeBertahan}>{t('saldo.mode_bertahan_badge', lang)}</span>
            ) : effectiveMode === 'hari-gajian' ? (
              <span className={styles.badgeHariGajian}>
                {t('saldo.mode_harigajian_badge', lang)}
              </span>
            ) : effectiveMode === 'hari-terakhir' ? (
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

          {/* ── Mode: Bertahan ── */}
          {effectiveMode === 'bertahan' && (
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

          {/* ── Mode: Hari Gajian ── */}
          {effectiveMode === 'hari-gajian' && (
            <div className={styles.hariGajianBody}>
              <h2 className={styles.hariGajianHeading}>
                {t('saldo.mode_harigajian_heading', lang)}
              </h2>
              <p className={styles.hariGajianSub}>{t('saldo.mode_harigajian_sub', lang)}</p>
              <div className={styles.hariGajianBtns}>
                <button className={styles.btnConfirmNo} onClick={onPaydayDecline}>
                  {t('saldo.mode_harigajian_no', lang)}
                </button>
                <button className={styles.btnConfirmYes} onClick={onPaydayConfirm}>
                  {t('saldo.mode_harigajian_yes', lang)}
                </button>
              </div>
              <div className={styles.ringkasanDivider} />
              <div className={styles.ringkasanLabel}>
                {t('saldo.mode_harigajian_ringkasan', lang)}
              </div>
              <div className={styles.ringkasanRow}>
                <span className={styles.ringkasanKey}>
                  {t('saldo.mode_harigajian_sisa_anggaran', lang)}
                </span>
                <span className={styles.ringkasanValGreen}>
                  {formatCurrency(Math.max(0, sisaPeriode), currency)}
                </span>
              </div>
              <div className={styles.ringkasanRow}>
                <span className={styles.ringkasanKey}>
                  {t('saldo.mode_harigajian_total_saldo', lang)}
                </span>
                <span className={styles.ringkasanVal}>{formatCurrency(totalSaldo, currency)}</span>
              </div>
              <div className={styles.ringkasanRow}>
                <span className={styles.ringkasanKey}>
                  {t('saldo.mode_harigajian_uang_mengendap', lang)}
                </span>
                <span className={styles.ringkasanVal}>
                  {formatCurrency(uangMengendap, currency)}
                </span>
              </div>
            </div>
          )}

          {/* ── Mode: Hari Terakhir ── */}
          {effectiveMode === 'hari-terakhir' && (
            <>
              <div className={styles.heroSublabel}>
                {t('saldo.mode_hariterakhir_sub_label', lang)}
              </div>
              <div className={styles.heroNum}>{formatCurrency(sisaPeriode, currency)}</div>
              <p className={styles.hariterakhirNote}>{t('saldo.mode_hariterakhir_note', lang)}</p>
            </>
          )}

          {/* ── Mode: Normal (hero) ── */}
          {effectiveMode === 'normal' && (
            <>
              <div className={styles.heroLabelRow}>
                <span className={styles.heroLabel}>{t('saldo.jatah_harian_label', lang)}</span>
                <button
                  className={styles.tooltipBtn}
                  onClick={() => setJatahTooltipOpen(true)}
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
                {conditionLabel && (
                  <span
                    className={styles.conditionBadge}
                    style={{ color: conditionColor ?? undefined }}
                  >
                    {conditionLabel}
                  </span>
                )}
              </div>
              <div className={styles.heroNum}>
                {formatCurrency(jatahHarian ?? 0, currency)}
                <span className={styles.heroUnit}>/hari</span>
              </div>
              <div className={styles.heroSub}>
                {formatCurrency(sisaPeriode, currency)}
                <span className={styles.heroSubSep}>·</span>
                {(daysUntilPayday === 1
                  ? t('home.day_to_payday', lang)
                  : t('home.days_to_payday', lang)
                ).replace('{n}', String(daysUntilPayday))}
              </div>

              {/* Expand / collapse rincian */}
              <button className={styles.expandBtn} onClick={() => setExpanded((v) => !v)}>
                <span className={styles.expandChevron}>{expanded ? '∧' : '∨'}</span>
                {expanded ? t('saldo.collapse_btn', lang) : t('saldo.expand_btn', lang)}
                <span className={styles.expandChevron}>{expanded ? '∧' : '∨'}</span>
              </button>

              {expanded && (
                <div className={styles.rincian}>
                  <RincianRow
                    label={t('saldo.rincian_pemasukan', lang)}
                    value={formatCurrency(pemasukanPeriode, currency)}
                  />
                  {unpaidTagihanTotal > 0 && (
                    <RincianRow
                      label={t('saldo.rincian_tagihan', lang)}
                      value={formatCurrency(unpaidTagihanTotal, currency)}
                      minus
                    />
                  )}
                  {totalNabung > 0 && (
                    <RincianRow
                      label={t('saldo.rincian_nabung', lang)}
                      value={formatCurrency(totalNabung, currency)}
                      minus
                    />
                  )}
                  <RincianRow
                    label={t('saldo.rincian_anggaran', lang)}
                    value={formatCurrency(anggaranOperasional, currency)}
                    bold
                    infoBtn={() => setAnggaranTooltipOpen(true)}
                  />
                  <div className={styles.rincianMeta}>
                    {t('saldo.rincian_hari_periode', lang).replace('{n}', String(hariPeriode))}
                  </div>
                  <RincianRow
                    label={t('saldo.rincian_jatah', lang)}
                    value={`${formatCurrency(jatahHarian ?? 0, currency)}/hari`}
                    bold
                  />
                  <div className={styles.rincianProgress}>
                    {t('saldo.rincian_udah_jalan', lang)
                      .replace('{x}', String(hariTerlewat))
                      .replace('{amount}', formatCurrency(sisaPeriode, currency))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Lapis 3: Konteks (semua mode kecuali hari-gajian) ── */}
          {effectiveMode !== 'hari-gajian' && (
            <div className={styles.konteks}>
              <button className={styles.konteksRow} onClick={() => setWalletExpanded((v) => !v)}>
                <span className={styles.konteksLabel}>{t('saldo.total_saldo_label', lang)}</span>
                <span className={styles.konteksVal}>
                  {formatCurrency(totalSaldo, currency)}
                  <span className={styles.konteksArrow}>{walletExpanded ? ' ∧' : ' >'}</span>
                </span>
              </button>

              {walletExpanded && (
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

              <div className={styles.konteksRow}>
                <span className={styles.konteksLabel}>
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
                  <span className={styles.konteksSubLabel}>
                    {t('saldo.uang_mengendap_sub', lang)}
                  </span>
                </span>
                <span className={styles.konteksValMuted}>
                  {formatCurrency(uangMengendap, currency)}
                </span>
              </div>

              {onHistoryTap && (
                <>
                  <div className={styles.divider} />
                  <button className={styles.historyLink} onClick={onHistoryTap}>
                    {t('home.history_link', lang)}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {onAddWalletTap && (
          <button className={styles.addWalletBtn} onClick={onAddWalletTap}>
            {t('saldo.add_wallet', lang)}
          </button>
        )}
      </div>

      {/* Tooltip sheets */}
      <BottomSheet
        isOpen={jatahTooltipOpen}
        onClose={() => setJatahTooltipOpen(false)}
        title={t('saldo.jatah_harian_label', lang)}
      >
        <p className={styles.tooltipBody}>{t('saldo.jatah_harian_tooltip', lang)}</p>
      </BottomSheet>
      <BottomSheet
        isOpen={anggaranTooltipOpen}
        onClose={() => setAnggaranTooltipOpen(false)}
        title={t('saldo.rincian_anggaran', lang)}
      >
        <p className={styles.tooltipBody}>{t('saldo.anggaran_tooltip', lang)}</p>
      </BottomSheet>
    </>
  )
}

function RincianRow({
  label,
  value,
  minus,
  bold,
  infoBtn,
}: {
  label: string
  value: string
  minus?: boolean
  bold?: boolean
  infoBtn?: () => void
}) {
  return (
    <div className={`${styles.rincianRow} ${bold ? styles.rincianRowBold : ''}`}>
      <span className={styles.rincianLabel}>
        {label}
        {infoBtn && (
          <button className={styles.tooltipBtn} onClick={infoBtn} aria-label="Info">
            <svg
              width="11"
              height="11"
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
        )}
      </span>
      <span className={`${styles.rincianVal} ${minus ? styles.rincianValMinus : ''}`}>{value}</span>
    </div>
  )
}
