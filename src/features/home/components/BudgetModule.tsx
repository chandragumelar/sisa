import { useState } from 'react'
import type { Settings } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { TAGIHAN_BURDEN_LOW, TAGIHAN_BURDEN_HIGH } from '@/constants/budget'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { Language } from '@/db/database'
import {
  calcDaysUntilPayday,
  calcWeeklyBudget,
  getDaysUntilEndOfWeek,
  getPaydayDate,
} from '../home.utils'
import styles from './BudgetModule.module.css'

interface Props {
  dailyBudget: number
  spentToday: number
  settings: Settings
  currency: string
  unpaidTagihanTotal: number
  totalSaldo: number
  nowMs: number
}

type VerdictKey = 'aman' | 'mepet' | 'bahaya'

function getBurdenVerdict(
  pct: number,
  lang: Language,
): { label: string; key: VerdictKey; textClass: string; ribbonClass: string; badgeClass: string } {
  if (pct < TAGIHAN_BURDEN_LOW)
    return {
      label: t('budget.verdict_good', lang),
      key: 'aman',
      textClass: styles.statusAman,
      ribbonClass: styles.ribbonAman,
      badgeClass: styles.badgeAman,
    }
  if (pct < TAGIHAN_BURDEN_HIGH)
    return {
      label: t('budget.verdict_ok', lang),
      key: 'mepet',
      textClass: styles.statusKetat,
      ribbonClass: styles.ribbonMepet,
      badgeClass: styles.badgeMepet,
    }
  return {
    label: t('budget.verdict_tight', lang),
    key: 'bahaya',
    textClass: styles.statusBerat,
    ribbonClass: styles.ribbonBahaya,
    badgeClass: styles.badgeBahaya,
  }
}

export function BudgetModule({
  dailyBudget,
  spentToday,
  settings,
  currency,
  unpaidTagihanTotal,
  totalSaldo,
  nowMs,
}: Props) {
  const lang = useLanguage()
  const [infoOpen, setInfoOpen] = useState(false)
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const paydayDate = getPaydayDate(nowMs, settings)
  const daysUntilWeekEnd = getDaysUntilEndOfWeek(nowMs)
  const weeklyBudget = calcWeeklyBudget(dailyBudget, daysUntilWeekEnd, daysUntilPayday)

  const sisaHariIni = Math.max(0, dailyBudget - spentToday)

  const burdenPct = totalSaldo > 0 ? (unpaidTagihanTotal / totalSaldo) * 100 : null
  const burden = burdenPct !== null ? getBurdenVerdict(burdenPct, lang) : null

  const ribbonClass = burden ? burden.ribbonClass : styles.ribbonEmpty
  const badgeClass = burden ? burden.badgeClass : ''

  // Format daily budget for ribbon — show amount without currency prefix for compact display
  const dailyFmt = formatCurrency(dailyBudget, currency)
  const sisaFmt = formatCurrency(sisaHariIni, currency)

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.ribbon} ${ribbonClass}`}>
        <div className={styles.ribbonLeft}>
          <span className={styles.ribbonEyebrow}>{t('budget.title', lang)}</span>
          <div className={styles.ribbonAmount}>
            {dailyFmt}
            <span className={styles.ribbonAmountSub}>/hr</span>
          </div>
        </div>
        <div className={styles.ribbonRight}>
          {burden && <span className={`${styles.verdictBadge} ${badgeClass}`}>{burden.label}</span>}
          <span className={styles.ribbonMeta}>{sisaFmt} sisa</span>
        </div>
      </div>

      <div className={styles.infoRow}>
        <button
          className={styles.infoDot}
          onClick={() => setInfoOpen(true)}
          aria-label={t('budget.info_aria', lang)}
        >
          i
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>{t('budget.week_title', lang)}</div>
          <div className={styles.cardNum}>{formatCurrency(weeklyBudget, currency)}</div>
          <div className={styles.cardSub}>
            {t('budget.week_days', lang).replace('{days}', String(daysUntilWeekEnd))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>{t('budget.bills_title', lang)}</div>
          {burden !== null ? (
            <>
              <div className={styles.cardNum}>{Math.round(burdenPct!)}%</div>
              <div className={styles.cardSub}>
                <span className={burden.textClass}>{burden.label}</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardNumEmpty}>—</div>
              <div className={styles.cardSub}>{t('budget.empty_balance', lang)}</div>
            </>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={t('budget.sheet_title', lang)}
      >
        <div className={styles.infoContent}>
          {lang === 'en' ? (
            <>
              <p>
                <strong>Daily budget</strong> = (Balance − Bills − Savings) ÷ Days until payday.{' '}
                {t('budget.desc_line', lang)
                  .replace('{days}', String(daysUntilPayday))
                  .replace('{date}', String(paydayDate.getDate()))}
              </p>
              <p>
                <strong>Bills vs your money</strong> = Unpaid bills ÷ Total balance × 100%
              </p>
              <p className={styles.infoNote}>
                Bills and savings targets are deducted before splitting across days. Balance
                includes all active wallets.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Budget harian</strong> = (Saldo − Tagihan − Tabungan) ÷ Hari sampai gajian.{' '}
                {t('budget.desc_line', lang)
                  .replace('{days}', String(daysUntilPayday))
                  .replace('{date}', String(paydayDate.getDate()))}
              </p>
              <p>
                <strong>Tagihan vs uangmu</strong> = Tagihan belum dibayar ÷ Total saldo × 100%
              </p>
              <p className={styles.infoNote}>
                Tagihan dan target tabungan dikurangi dulu sebelum dibagi ke hari. Saldo dihitung
                dari semua dompet aktif.
              </p>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
