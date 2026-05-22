import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getAllGoals } from '@/db/goals.repository'
import {
  getLastTransaction,
  getTransactionsByDateRange,
  getTotalNabung,
} from '@/db/transactions.repository'
import type { Settings, Wallet, Tagihan, Goal, Transaction } from '@/db/database'
import {
  calcDailyBudget,
  calcUnpaidTagihanTotal,
  calcSpentToday,
  calcYesterdayStats,
  hasUrgentTagihan,
  calcDaysUntilPayday,
} from './home.utils'
import { SaldoModule } from './components/SaldoModule'
import { NotifCard } from './components/NotifCard'
import { BudgetModule } from './components/BudgetModule'
import { TagihanModule } from './components/TagihanModule'
import { GoalModule } from './components/GoalModule'
import { FooterCatatan } from './components/FooterCatatan'
import { BottomActionBar } from './components/BottomActionBar'
import styles from './HomePage.module.css'

interface HomeData {
  settings: Settings | null
  wallets: Wallet[]
  tagihan: Tagihan[]
  goals: Goal[]
  lastTx: Transaction | undefined
  todayTxs: Transaction[]
  yesterdayTxs: Transaction[]
  totalNabung: number
}

function useHomeData(nowMs: number): HomeData & { isLoading: boolean } {
  const [data, setData] = useState<HomeData>({
    settings: null,
    wallets: [],
    tagihan: [],
    goals: [],
    lastTx: undefined,
    todayTxs: [],
    yesterdayTxs: [],
    totalNabung: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const now = new Date(nowMs)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterdayStart = todayStart - 86_400_000
    const tomorrowStart = todayStart + 86_400_000

    Promise.all([
      getSettings(),
      getAllWallets(),
      getActiveTagihan(),
      getAllGoals(),
      getLastTransaction(),
      getTransactionsByDateRange(todayStart, tomorrowStart),
      getTransactionsByDateRange(yesterdayStart, todayStart),
    ]).then(([settings, wallets, tagihan, goals, lastTx, todayTxs, yesterdayTxs]) => {
      if (cancelled) return
      const currency = settings?.primaryCurrency ?? 'IDR'
      getTotalNabung(currency).then((totalNabung) => {
        if (!cancelled) {
          setData({
            settings: settings ?? null,
            wallets,
            tagihan,
            goals,
            lastTx,
            todayTxs,
            yesterdayTxs,
            totalNabung,
          })
          setIsLoading(false)
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [nowMs])

  return { ...data, isLoading }
}

export function HomePage() {
  const clock = useClock()
  const navigate = useNavigate()
  const nowMs = clock.now()
  const {
    settings,
    wallets,
    tagihan,
    goals,
    lastTx,
    todayTxs,
    yesterdayTxs,
    totalNabung,
    isLoading,
  } = useHomeData(nowMs)

  if (isLoading || !settings) return null

  const currency = settings.primaryCurrency
  const totalSaldo = wallets.reduce((sum, w) => sum + w.balance, 0)
  const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const dailyBudget = calcDailyBudget(totalSaldo, unpaidTagihanTotal, 0, daysUntilPayday)
  const spentToday = calcSpentToday(todayTxs, nowMs)
  const { spent: yesterdaySpent, earned: yesterdayEarned } = calcYesterdayStats(yesterdayTxs, nowMs)

  return (
    <main className={styles.page}>
      {/* Header 4.1 */}
      <div className={styles.header}>
        <span className={styles.wordmark}>SISA</span>
        <button
          className={styles.settingsBtn}
          onClick={() => navigate('/settings')}
          aria-label="Pengaturan"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9" cy="6" r="2" fill="var(--canvas)" />
            <circle cx="15" cy="12" r="2" fill="var(--canvas)" />
            <circle cx="11" cy="18" r="2" fill="var(--canvas)" />
          </svg>
        </button>
      </div>

      {/* Notif 4.6 */}
      {hasUrgentTagihan(tagihan, nowMs) && (
        <NotifCard tagihan={tagihan} nowMs={nowMs} onClick={() => {}} />
      )}

      {/* Saldo 4.2 */}
      <SaldoModule
        wallets={wallets}
        currency={currency}
        yesterdaySpent={yesterdaySpent}
        yesterdayEarned={yesterdayEarned}
      />

      <div className={styles.divider} />

      {/* Budget 4.3 + 4.4 */}
      <BudgetModule
        dailyBudget={dailyBudget}
        spentToday={spentToday}
        settings={settings}
        unpaidTagihanTotal={unpaidTagihanTotal}
        totalSaldo={totalSaldo}
        nowMs={nowMs}
      />

      <div className={styles.divider} />

      {/* Tagihan 4.5 */}
      <TagihanModule tagihan={tagihan} currency={currency} nowMs={nowMs} />

      <div className={styles.divider} />

      {/* Goal 4.7 */}
      <GoalModule goals={goals} totalNabung={totalNabung} currency={currency} />

      <div className={styles.divider} />

      {/* Footer 4.8 */}
      <FooterCatatan
        lastTransaction={lastTx}
        currency={currency}
        onShowHistory={() => {}}
        nowMs={nowMs}
      />

      {/* Bottom action 4.9 */}
      <BottomActionBar
        onCatat={() => {}}
        onCekDulu={() => navigate('/cek-dulu')}
        onAndai={() => navigate('/andai')}
      />
    </main>
  )
}
