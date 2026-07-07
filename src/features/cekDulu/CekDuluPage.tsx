import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNow } from '@/app/providers/useNow'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getPeriodFlows } from '@/db/transactions.repository'
import { getAllocation } from '@/db/allocation.repository'
import type { Settings, Wallet } from '@/db/database'
import {
  calcDaysUntilPayday,
  getPaydayDate,
  getPeriodStartDate,
  calcHariPeriode,
  isHariPertamaMode,
  calcPemasukanFromAvg,
} from '@/features/home/home.utils'
import { calcUnpaidTagihanTotal } from '@/features/home/tagihan.utils'
import { calcBudgetPeriode, resolveBudgetView } from '@/shared/utils/budget.utils'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { calcCekDulu } from './cekDulu.utils'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import styles from './CekDuluPage.module.css'

type WarnTier = 'diam' | 'netral' | 'tier2' | 'tier2b' | 'tier3a' | 'tier3b' | 'tier3c'

const WARN_VARIANTS = 10

const T2_KEYS = [
  'cek_dulu.warn_t2_1',
  'cek_dulu.warn_t2_2',
  'cek_dulu.warn_t2_3',
  'cek_dulu.warn_t2_4',
  'cek_dulu.warn_t2_5',
  'cek_dulu.warn_t2_6',
  'cek_dulu.warn_t2_7',
  'cek_dulu.warn_t2_8',
  'cek_dulu.warn_t2_9',
  'cek_dulu.warn_t2_10',
] as const

const T2B_KEYS = [
  'cek_dulu.warn_t2b_1',
  'cek_dulu.warn_t2b_2',
  'cek_dulu.warn_t2b_3',
  'cek_dulu.warn_t2b_4',
  'cek_dulu.warn_t2b_5',
  'cek_dulu.warn_t2b_6',
  'cek_dulu.warn_t2b_7',
  'cek_dulu.warn_t2b_8',
  'cek_dulu.warn_t2b_9',
  'cek_dulu.warn_t2b_10',
] as const

const T3A_KEYS = [
  'cek_dulu.warn_t3a_1',
  'cek_dulu.warn_t3a_2',
  'cek_dulu.warn_t3a_3',
  'cek_dulu.warn_t3a_4',
  'cek_dulu.warn_t3a_5',
  'cek_dulu.warn_t3a_6',
  'cek_dulu.warn_t3a_7',
  'cek_dulu.warn_t3a_8',
  'cek_dulu.warn_t3a_9',
  'cek_dulu.warn_t3a_10',
] as const

const T3B_KEYS = [
  'cek_dulu.warn_t3b_1',
  'cek_dulu.warn_t3b_2',
  'cek_dulu.warn_t3b_3',
  'cek_dulu.warn_t3b_4',
  'cek_dulu.warn_t3b_5',
  'cek_dulu.warn_t3b_6',
  'cek_dulu.warn_t3b_7',
  'cek_dulu.warn_t3b_8',
  'cek_dulu.warn_t3b_9',
  'cek_dulu.warn_t3b_10',
] as const

const T3C_KEYS = [
  'cek_dulu.warn_t3c_1',
  'cek_dulu.warn_t3c_2',
  'cek_dulu.warn_t3c_3',
  'cek_dulu.warn_t3c_4',
  'cek_dulu.warn_t3c_5',
  'cek_dulu.warn_t3c_6',
  'cek_dulu.warn_t3c_7',
  'cek_dulu.warn_t3c_8',
  'cek_dulu.warn_t3c_9',
  'cek_dulu.warn_t3c_10',
] as const

interface PageData {
  settings: Settings
  wallets: Wallet[]
  totalSaldo: number
  sisaPeriode: number
  dailyBudget: number | null
  daysUntilPayday: number
  mengendap: number
  jatahHarian: number
}

export function CekDuluPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const lang = useLanguage()
  const { nowMs } = useNow()

  const [data, setData] = useState<PageData | null>(null)
  const [amountStr, setAmountStr] = useState(() => {
    const initial = (location.state as { initialAmount?: number } | null)?.initialAmount
    return initial ? formatNominalDisplay(parseNominalRaw(String(initial))) : ''
  })
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getAllWallets(), getActiveTagihan(), getAllocation()]).then(
      ([settings, wallets, tagihan, allocation]) => {
        if (cancelled || !settings) return
        const currency = settings.primaryCurrency
        const totalSaldo = wallets
          .filter((w) => w.currency === currency)
          .reduce((s, w) => s + w.balance, 0)
        const nextPaydayMs = getPaydayDate(nowMs, settings, allocation).getTime()
        const unpaidTagihanTotal = calcUnpaidTagihanTotal(
          tagihan.filter((tg) => tg.currency === currency),
          nowMs,
          nextPaydayMs,
        )
        const daysUntilPayday = calcDaysUntilPayday(nowMs, settings, allocation)
        const periodStartMs = getPeriodStartDate(nowMs, settings).getTime()
        const hariPeriode = calcHariPeriode(nowMs, settings)

        getPeriodFlows(currency, periodStartMs, nowMs).then(
          async ({ income, expense, spentToday }) => {
            if (cancelled) return
            let spentSinceLock = 0
            if (allocation) {
              const { expense: sinceLock } = await getPeriodFlows(
                currency,
                allocation.lockedAt,
                nowMs,
              )
              spentSinceLock = sinceLock
            }
            if (cancelled) return

            const hariPertama = isHariPertamaMode(settings.lastPaydayConfirmed, income)
            let effectivePemasukan = income
            if (hariPertama) {
              effectivePemasukan = totalSaldo
            } else if (
              settings.incomeType === 'freelance' &&
              settings.avgIncome &&
              settings.avgIncomeBasis
            ) {
              effectivePemasukan = calcPemasukanFromAvg(
                settings.avgIncome,
                settings.avgIncomeBasis,
                hariPeriode,
              )
            }
            const budget = calcBudgetPeriode({
              pemasukanPeriode: effectivePemasukan,
              unpaidTagihanTotal,
              hariPeriode,
              spentThisPeriode: expense,
              spentToday,
              totalSaldo,
              useSaldoFloor: settings.incomeType === 'freelance',
            })

            const view = resolveBudgetView(allocation, budget, {
              totalSaldo,
              tagihanUnpaid: unpaidTagihanTotal,
              spentSinceLock,
              spentToday,
            })
            const dailyBudget =
              daysUntilPayday > 0 ? view.sisaUang / daysUntilPayday : view.jatahHariIni
            setData({
              settings,
              wallets,
              totalSaldo,
              sisaPeriode: view.sisaUang,
              dailyBudget,
              daysUntilPayday,
              mengendap: view.mengendap,
              jatahHarian: view.jatahHariIni,
            })
          },
        )
      },
    )
    return () => {
      cancelled = true
    }
  }, [nowMs])

  const nominal = parseInt(parseNominalRaw(amountStr), 10) || 0

  const result = data
    ? calcCekDulu({
        nominal,
        sisaUang: data.sisaPeriode,
        dailyBudget: data.dailyBudget,
        daysUntilPayday: data.daysUntilPayday,
        mengendap: data.mengendap,
        jatahHarian: data.jatahHarian,
      })
    : null

  const dropPct =
    result && result.dailyBefore > 0
      ? Math.round((-result.dailyDelta / result.dailyBefore) * 100)
      : 0

  let tier: WarnTier = 'diam'
  if (result) {
    const { mengendapDrawn, mengendapAfter, dailyBefore } = result
    if (dropPct < 5 && mengendapDrawn === 0) {
      tier = 'diam'
    } else if (dropPct >= 5 && dropPct < 15 && mengendapDrawn === 0) {
      tier = 'netral'
    } else if (dropPct >= 15 && dropPct <= 30 && mengendapDrawn === 0) {
      tier = 'tier2'
    } else if (mengendapDrawn > 0 && mengendapAfter >= dailyBefore) {
      tier = 'tier3a'
    } else if (mengendapDrawn > 0 && mengendapAfter >= 0 && mengendapAfter < dailyBefore) {
      tier = 'tier3b'
    } else if (mengendapAfter < 0) {
      tier = 'tier3c'
    } else if (dropPct > 30 && mengendapDrawn === 0) {
      tier = 'tier2b'
    } else {
      tier = 'diam'
    }
  }

  const isGated = tier === 'tier2b' || tier === 'tier3a' || tier === 'tier3b' || tier === 'tier3c'

  const [gateConfirmed, setGateConfirmed] = useState(false)

  useEffect(() => {
    setGateConfirmed(false)
  }, [nominal])

  // eslint-disable-next-line react-hooks/exhaustive-deps -- tier is a re-roll trigger, not read in the callback
  const variantIndex = useMemo(() => Math.floor(Math.random() * WARN_VARIANTS), [tier])

  if (!data || !result) return null

  const { settings, wallets, totalSaldo, daysUntilPayday } = data
  const currency = settings.primaryCurrency
  const inputFontSize = amountStr.length > 11 ? 26 : amountStr.length > 8 ? 36 : 48

  const warnKey =
    tier === 'tier2'
      ? T2_KEYS[variantIndex]
      : tier === 'tier2b'
        ? T2B_KEYS[variantIndex]
        : tier === 'tier3a'
          ? T3A_KEYS[variantIndex]
          : tier === 'tier3b'
            ? T3B_KEYS[variantIndex]
            : tier === 'tier3c'
              ? T3C_KEYS[variantIndex]
              : null

  const warnText = warnKey
    ? t(warnKey, lang)
        .replace('{dropPct}', String(dropPct))
        .replace('{recoveryDays}', String(result.recoveryDays))
        .replace('{daysUntilPayday}', String(daysUntilPayday))
    : null

  const warnBoxClass = tier === 'tier2' ? styles.warnCaution : isGated ? styles.warnDanger : ''
  const warnLineClass =
    tier === 'tier2' ? styles.warnLineCaution : isGated ? styles.warnLineDanger : ''

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('common.back_aria', lang)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className={styles.title}>{t('cek_dulu.title', lang)}</span>
        <button
          className={styles.closeBtn}
          onClick={() => navigate(-1)}
          aria-label={t('cek_dulu.close_aria', lang)}
        >
          ✕
        </button>
      </div>

      {/* Nominal card */}
      <div className={styles.nominalBlock}>
        <div className={styles.nominalLabel}>{t('cek_dulu.price_label', lang)}</div>
        <div className={styles.nominalRow}>
          <span className={styles.nominalPrefix}>{getCurrencySymbol(currency)}</span>
          <input
            className={styles.nominalInput}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amountStr}
            onChange={(e) => setAmountStr(formatNominalDisplay(parseNominalRaw(e.target.value)))}
            style={{ fontSize: inputFontSize }}
            autoFocus
          />
          <span className={styles.nominalCaret} />
        </div>
        <div className={styles.nominalContext}>
          {t('cek_dulu.context_line', lang).replace('{days}', String(daysUntilPayday))}
        </div>
      </div>

      {/* Comparison frame */}
      <div className={styles.cmpFrame}>
        <div className={styles.cmpColHead}>
          <span>{t('cek_dulu.col_now', lang)}</span>
          <span className={styles.headArrow}>→</span>
          <span className={styles.headAfter}>{t('cek_dulu.col_after', lang)}</span>
        </div>

        {/* Row 1 — always */}
        <div className={styles.cmpRow}>
          <div className={styles.rowLabel}>{t('cek_dulu.daily_label', lang)}</div>
          <div className={styles.cmpValues}>
            <span className={styles.valueBefore}>
              {formatCurrency(result.dailyBefore, currency)}
              <span className={styles.valueUnit}>{t('cek_dulu.daily_unit', lang)}</span>
            </span>
            <span className={styles.cmpArrow}>→</span>
            <span className={styles.valueAfter}>
              {nominal > 0 ? formatCurrency(result.dailyAfter, currency) : '—'}
              {nominal > 0 && (
                <span className={styles.valueUnit}>{t('cek_dulu.daily_unit', lang)}</span>
              )}
            </span>
          </div>
        </div>

        {/* Row 2 — muncul saat nembus operasional */}
        {result.showSisaRow && (
          <>
            <div className={styles.cmpDivider} />
            <div className={styles.cmpRow}>
              <div className={styles.rowLabel}>{t('cek_dulu.sisa_label', lang)}</div>
              <div className={styles.cmpValues}>
                <span className={styles.valueBefore}>
                  {formatCurrency(result.sisaBefore, currency)}
                </span>
                <span className={styles.cmpArrow}>→</span>
                <span className={styles.valueAfter}>
                  {formatCurrency(result.sisaAfter, currency)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Row 3 — muncul saat nyentuh uang mengendap */}
        {result.showMengendapRow && (
          <>
            <div className={styles.cmpDivider} />
            <div className={styles.cmpRow}>
              <div className={styles.rowLabel}>
                {t('cek_dulu.mengendap_label', lang)}
                <span className={styles.newFlag}>{t('cek_dulu.new_flag', lang)}</span>
              </div>
              <div className={styles.cmpValues}>
                <span className={styles.valueBefore}>
                  {formatCurrency(result.mengendapBefore, currency)}
                </span>
                <span className={styles.cmpArrow}>→</span>
                <span className={styles.valueAfter}>
                  {formatCurrency(result.mengendapAfter, currency)}
                </span>
              </div>
              <div className={styles.rowSubNote}>
                {t('cek_dulu.mengendap_note', lang).replace(
                  '{amount}',
                  formatCurrency(result.mengendapDrawn, currency),
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Insights */}
      {nominal > 0 && (
        <div className={styles.insightList}>
          {result.daysEquivalent > 0 && (
            <div className={styles.insightRow}>
              <span className={styles.insightDot} />
              <span>
                {t('cek_dulu.insight_days', lang).replace('{n}', String(result.daysEquivalent))}
              </span>
            </div>
          )}
          {result.portionPct > 0 && (
            <div className={styles.insightRow}>
              <span className={styles.insightDot} />
              <span>
                {t('cek_dulu.insight_portion', lang).replace('{pct}', String(result.portionPct))}
              </span>
            </div>
          )}
          {result.recoveryDays > 0 && (
            <div className={styles.insightRow}>
              <span className={styles.insightDot} />
              <span>
                {t('cek_dulu.insight_recovery', lang).replace('{n}', String(result.recoveryDays))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tiered warning */}
      {warnText && (
        <div className={`${styles.warnBox} ${warnBoxClass}`}>
          <p className={`${styles.warnLine} ${warnLineClass}`}>{warnText}</p>
          {isGated && !gateConfirmed && (
            <button className={styles.warnGateBtn} onClick={() => setGateConfirmed(true)}>
              {t('cek_dulu.warn_gate_confirm', lang)}
            </button>
          )}
        </div>
      )}

      <div className={styles.srcLine}>
        <span>{t('cek_dulu.src_label', lang)}</span>
        <span className={styles.srcVal}>
          {t('cek_dulu.src_wallets', lang)
            .replace('{n}', String(wallets.length))
            .replace('{amount}', formatCurrency(totalSaldo, currency))}
        </span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.closeAction} onClick={() => navigate(-1)}>
          {t('cek_dulu.close_btn', lang)}
        </button>
        <button
          className={styles.buyAction}
          onClick={() => setQuickLogOpen(true)}
          disabled={nominal === 0 || (isGated && !gateConfirmed)}
        >
          <span className={styles.buyLabel}>{t('cek_dulu.buy_label', lang)}</span>
          <span className={styles.buySub}>{t('cek_dulu.buy_sub', lang)}</span>
        </button>
      </div>

      <QuickLogSheet
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        wallets={wallets}
        currency={currency}
        nowMs={nowMs}
        initialAmount={nominal}
        initialMode="keluar"
        onCommit={() => {
          setQuickLogOpen(false)
          navigate('/')
        }}
        uangMengendap={data.mengendap}
      />
    </div>
  )
}
