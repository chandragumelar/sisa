import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import {
  getActiveTagihan,
  commitTagihanPayment,
  revertTagihanPayment,
} from '@/db/tagihan.repository'
import { getAllGoals } from '@/db/goals.repository'
import {
  getLastTransaction,
  getTransactionsByDateRange,
  getTotalNabung,
  deleteTransactionAndRevertBalance,
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
import { Toast } from './components/Toast'
import { MarkPaidSheet } from './components/MarkPaidSheet'
import { TagihanDetailSheet, UrgentTagihanSheet } from './components/TagihanDetailSheet'
import { HistorySheet } from './components/HistorySheet'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import type { QuickLogMode } from '@/features/quickLog/quickLog.utils'
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

interface ToastState {
  message: string
  onUndo: () => void
  onEdit?: () => void
}

function useHomeData(nowMs: number): HomeData & { isLoading: boolean; reload: () => void } {
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
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

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
  }, [nowMs, tick])

  return { ...data, isLoading, reload }
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
    reload,
  } = useHomeData(nowMs)

  const [toast, setToast] = useState<ToastState | null>(null)
  const [markPaidTagihan, setMarkPaidTagihan] = useState<Tagihan | null>(null)
  const [detailTagihan, setDetailTagihan] = useState<Tagihan | null>(null)
  const [urgentSheetOpen, setUrgentSheetOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  if (isLoading || !settings) return null

  const currency = settings.primaryCurrency
  const totalSaldo = wallets.reduce((sum, w) => sum + w.balance, 0)
  const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const dailyBudget = calcDailyBudget(totalSaldo, unpaidTagihanTotal, 0, daysUntilPayday)
  const spentToday = calcSpentToday(todayTxs, nowMs)
  const { spent: yesterdaySpent, earned: yesterdayEarned } = calcYesterdayStats(yesterdayTxs, nowMs)

  function dismissToast() {
    setToast(null)
  }

  async function handleTagihanPay(t: Tagihan, walletId: number, amount: number) {
    setMarkPaidTagihan(null)
    try {
      const result = await commitTagihanPayment(t.id!, walletId, amount, t.currency, nowMs)
      reload()
      setToast({
        message: `${t.name} ditandai dibayar`,
        onUndo: async () => {
          await revertTagihanPayment(result)
          reload()
          dismissToast()
        },
        onEdit: () => setMarkPaidTagihan(t),
      })
    } catch {
      // TODO: error toast
    }
  }

  async function handleQuickLogCommit(txId: number, mode: QuickLogMode) {
    reload()
    setToast({
      message:
        mode === 'nabung'
          ? 'Nabung dicatat'
          : mode === 'masuk'
            ? 'Pemasukan dicatat'
            : 'Pengeluaran dicatat',
      onUndo: async () => {
        await deleteTransactionAndRevertBalance(txId)
        reload()
        dismissToast()
      },
    })
  }

  function handleGoalReorder(_newGoals: Goal[]) {
    reload()
  }

  return (
    <main className={styles.page}>
      {/* Header */}
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

      {/* Notif */}
      {hasUrgentTagihan(tagihan, nowMs) && (
        <NotifCard tagihan={tagihan} nowMs={nowMs} onClick={() => setUrgentSheetOpen(true)} />
      )}

      {/* Saldo */}
      <SaldoModule
        wallets={wallets}
        currency={currency}
        yesterdaySpent={yesterdaySpent}
        yesterdayEarned={yesterdayEarned}
      />

      <div className={styles.divider} />

      {/* Budget */}
      <BudgetModule
        dailyBudget={dailyBudget}
        spentToday={spentToday}
        settings={settings}
        unpaidTagihanTotal={unpaidTagihanTotal}
        totalSaldo={totalSaldo}
        nowMs={nowMs}
      />

      <div className={styles.divider} />

      {/* Tagihan */}
      <TagihanModule
        tagihan={tagihan}
        currency={currency}
        nowMs={nowMs}
        onPayTap={(t) => setMarkPaidTagihan(t)}
        onRowTap={(t) => setDetailTagihan(t)}
      />

      <div className={styles.divider} />

      {/* Goal */}
      <GoalModule
        goals={goals}
        totalNabung={totalNabung}
        currency={currency}
        onReorder={handleGoalReorder}
      />

      <div className={styles.divider} />

      {/* Footer */}
      <FooterCatatan
        lastTransaction={lastTx}
        currency={currency}
        onShowHistory={() => setHistoryOpen(true)}
        nowMs={nowMs}
      />

      {/* Bottom action */}
      <BottomActionBar
        onCatat={() => setQuickLogOpen(true)}
        onCekDulu={() => navigate('/cek-dulu')}
        onAndai={() => navigate('/andai')}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onEdit={toast.onEdit}
          onDismiss={dismissToast}
        />
      )}

      {/* Sheets */}
      {markPaidTagihan && (
        <MarkPaidSheet
          tagihan={markPaidTagihan}
          wallets={wallets}
          nowMs={nowMs}
          isOpen={!!markPaidTagihan}
          onClose={() => setMarkPaidTagihan(null)}
          onCommit={(walletId, amount) => handleTagihanPay(markPaidTagihan, walletId, amount)}
        />
      )}

      {detailTagihan && (
        <TagihanDetailSheet
          tagihan={detailTagihan}
          nowMs={nowMs}
          isOpen={!!detailTagihan}
          onClose={() => setDetailTagihan(null)}
          onPay={(t) => {
            setDetailTagihan(null)
            setMarkPaidTagihan(t)
          }}
        />
      )}

      <UrgentTagihanSheet
        tagihan={tagihan}
        nowMs={nowMs}
        isOpen={urgentSheetOpen}
        onClose={() => setUrgentSheetOpen(false)}
        onPay={(t) => setMarkPaidTagihan(t)}
      />

      <HistorySheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        wallets={wallets}
        currency={currency}
        nowMs={nowMs}
      />

      <QuickLogSheet
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        wallets={wallets}
        currency={currency}
        totalNabung={totalNabung}
        nowMs={nowMs}
        onCommit={handleQuickLogCommit}
      />
    </main>
  )
}
