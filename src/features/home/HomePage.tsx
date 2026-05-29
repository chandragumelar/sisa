import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { Language } from '@/db/database'
import { getSettings, patchSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import {
  getActiveTagihan,
  commitTagihanPayment,
  revertTagihanPayment,
  deleteTagihan,
} from '@/db/tagihan.repository'
import { getAllGoals, deleteGoal } from '@/db/goals.repository'
import {
  getLastTransaction,
  getTransactionsByDateRange,
  getTotalNabung,
  deleteTransactionAndRevertBalance,
  getMonthlyFlows,
  addNabungDeduction,
} from '@/db/transactions.repository'
import type { Settings, Wallet, Tagihan, Goal, Transaction } from '@/db/database'

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]
const MONTH_NAMES_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatHeaderSub(nowMs: number, daysUntilPayday: number, lang: Language): string {
  const d = new Date(nowMs)
  const dayNames = lang === 'en' ? DAY_NAMES_EN : DAY_NAMES_ID
  const monthNames = lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ID
  const dateStr = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`
  const paydayKey = daysUntilPayday === 1 ? 'home.day_to_payday' : 'home.days_to_payday'
  const paydayStr = t(paydayKey, lang).replace('{n}', String(daysUntilPayday))
  return `${dateStr} · ${paydayStr}`
}
import {
  calcDailyBudget,
  calcSpentToday,
  calcYesterdayStats,
  calcDaysUntilPayday,
  calcGoalStatuses,
  getPaydayDate,
} from './home.utils'
import { calcUnpaidTagihanTotal, hasUrgentTagihan } from './tagihan.utils'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
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
import { BackupCard } from './components/BackupCard'
import { WalletEditSheet } from '@/features/wallet/WalletEditSheet'
import { ProfilTagihanSheet } from '@/features/profil/ProfilTagihanSheet'
import { ProfilGoalSheet } from '@/features/profil/ProfilGoalSheet'
import { ProfilWalletsSheet } from '@/features/profil/ProfilWalletsSheet'
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
  monthlyIncome: number
  monthlyExpense: number
}

interface ToastState {
  message: string
  onUndo: () => void
  onEdit?: () => void
}

const BACKUP_DISMISS_KEY = 'sisa:backupDismissedAt'

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
    monthlyIncome: 0,
    monthlyExpense: 0,
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
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()

    Promise.all([
      getSettings(),
      getAllWallets(),
      getActiveTagihan(),
      getAllGoals(),
      getTransactionsByDateRange(todayStart, tomorrowStart),
      getTransactionsByDateRange(yesterdayStart, todayStart),
    ]).then(([settings, wallets, tagihan, goals, todayTxsAll, yesterdayTxsAll]) => {
      if (cancelled || !settings) return
      const currency = settings.activeCurrencyMode || settings.primaryCurrency
      const todayTxs = todayTxsAll.filter((tx) => tx.currency === currency)
      const yesterdayTxs = yesterdayTxsAll.filter((tx) => tx.currency === currency)
      Promise.all([
        getTotalNabung(currency),
        getMonthlyFlows(currency, monthStart, monthEnd),
        getLastTransaction(currency),
      ]).then(([totalNabung, { income: monthlyIncome, expense: monthlyExpense }, lastTx]) => {
        if (!cancelled) {
          setData({
            settings,
            wallets,
            tagihan,
            goals,
            lastTx,
            todayTxs,
            yesterdayTxs,
            totalNabung,
            monthlyIncome,
            monthlyExpense,
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
  const lang = useLanguage()
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
    monthlyIncome,
    monthlyExpense,
    isLoading,
    reload,
  } = useHomeData(nowMs)

  const [toast, setToast] = useState<ToastState | null>(null)
  const [markPaidTagihan, setMarkPaidTagihan] = useState<Tagihan | null>(null)
  const [detailTagihan, setDetailTagihan] = useState<Tagihan | null>(null)
  const [editTagihan, setEditTagihan] = useState<Tagihan | null>(null)
  const [urgentSheetOpen, setUrgentSheetOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const [editWallet, setEditWallet] = useState<Wallet | null>(null)
  const [tagihanSheetOpen, setTagihanSheetOpen] = useState(false)
  const [goalSheetOpen, setGoalSheetOpen] = useState(false)
  const [walletSheetOpen, setWalletSheetOpen] = useState(false)

  if (isLoading || !settings) return null

  const currency = settings.activeCurrencyMode || settings.primaryCurrency
  const totalSaldo = wallets
    .filter((w) => w.currency === currency)
    .reduce((sum, w) => sum + w.balance, 0)
  const nextPaydayMs = getPaydayDate(nowMs, settings).getTime()
  const unpaidTagihanTotal = calcUnpaidTagihanTotal(
    tagihan.filter((t) => t.currency === currency),
    nowMs,
    nextPaydayMs,
  )
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const dailyBudget = calcDailyBudget(totalSaldo, unpaidTagihanTotal, totalNabung, daysUntilPayday)
  const spentToday = calcSpentToday(todayTxs, nowMs)
  const { spent: yesterdaySpent, earned: yesterdayEarned } = calcYesterdayStats(yesterdayTxs, nowMs)
  // backup reminder (8.11)
  const backupDismissedAt = (() => {
    const raw = localStorage.getItem(BACKUP_DISMISS_KEY)
    return raw ? parseInt(raw, 10) : null
  })()
  const showBackupCard = shouldShowBackupReminder(settings.lastExportedAt, backupDismissedAt, nowMs)
  const backupUrgency = calcBackupUrgency(settings.lastExportedAt, nowMs)

  function dismissToast() {
    setToast(null)
  }

  async function handleTagihanPay(tg: Tagihan, walletId: number, amount: number, dateMs: number) {
    setMarkPaidTagihan(null)
    try {
      const result = await commitTagihanPayment(tg.id!, walletId, amount, tg.currency, dateMs)
      reload()
      setToast({
        message: t('home.toast_paid', lang).replace('{name}', tg.name),
        onUndo: async () => {
          await revertTagihanPayment(result)
          reload()
          dismissToast()
        },
        onEdit: () => setMarkPaidTagihan(tg),
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
          ? t('home.toast_nabung', lang)
          : mode === 'masuk'
            ? t('home.toast_masuk', lang)
            : t('home.toast_keluar', lang),
      onUndo: async () => {
        await deleteTransactionAndRevertBalance(txId)
        reload()
        dismissToast()
      },
    })
  }

  async function handleDeleteTagihan(t: Tagihan) {
    await deleteTagihan(t.id!)
    reload()
  }

  async function handleDeleteGoal(id: number) {
    const currencyGoals = goals.filter((g) => g.currency === currency)
    const currencyWallets = wallets.filter((w) => w.currency === currency)
    const goalStatuses = calcGoalStatuses(currencyGoals, totalNabung)
    const gs = goalStatuses.find((s) => s.goal.id === id)
    if (gs && gs.saved > 0 && currencyWallets.length > 0) {
      await addNabungDeduction(gs.saved, currency, currencyWallets[0].id!, nowMs)
    }
    await deleteGoal(id)
    reload()
  }

  function handleGoalReorder(_newGoals: Goal[]) {
    reload()
  }

  async function handleCurrencySwitch(cur: string) {
    await patchSettings({ activeCurrencyMode: cur })
    reload()
  }

  const hasDualCurrency = settings.secondaryCurrency != null
  const currencies = hasDualCurrency ? [settings.primaryCurrency, settings.secondaryCurrency!] : []

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.wordmarkRow}>
          <span className={styles.wordmark}>SISA</span>
          <span className={styles.wordmarkSub}>
            {formatHeaderSub(nowMs, daysUntilPayday, lang)}
          </span>
        </div>

        <div className={styles.headerRight}>
          {hasDualCurrency && (
            <div className={styles.currencySegmented}>
              {currencies.map((cur) => (
                <button
                  key={cur}
                  className={
                    cur === currency
                      ? `${styles.currencyBtn} ${styles.currencyBtnActive}`
                      : styles.currencyBtn
                  }
                  onClick={() => handleCurrencySwitch(cur)}
                >
                  {cur}
                </button>
              ))}
            </div>
          )}
          <button
            className={styles.settingsBtn}
            onClick={() => navigate('/settings')}
            aria-label="Pengaturan"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backup reminder (8.11) */}
      {showBackupCard && (
        <BackupCard
          urgency={backupUrgency}
          onDismiss={() => {
            localStorage.setItem(BACKUP_DISMISS_KEY, String(nowMs))
            reload()
          }}
        />
      )}

      {/* Notif */}
      {hasUrgentTagihan(
        tagihan.filter((t) => t.currency === currency),
        nowMs,
      ) && (
        <NotifCard
          tagihan={tagihan.filter((t) => t.currency === currency)}
          nowMs={nowMs}
          onClick={() => setUrgentSheetOpen(true)}
        />
      )}

      {/* Saldo */}
      <SaldoModule
        wallets={wallets.filter((w) => w.currency === currency)}
        currency={currency}
        unpaidTagihanTotal={unpaidTagihanTotal}
        totalNabung={totalNabung}
        daysUntilPayday={daysUntilPayday}
        yesterdaySpent={yesterdaySpent}
        yesterdayEarned={yesterdayEarned}
        onWalletTap={(w) => setEditWallet(w)}
        onAddWalletTap={() => setWalletSheetOpen(true)}
      />

      {/* Monthly flow cards */}
      {(monthlyIncome > 0 || monthlyExpense > 0) && (
        <div className={styles.flowCards}>
          <div className={styles.flowCard}>
            <span className={styles.flowLabel}>{t('saldo.income_month', lang)}</span>
            <span className={styles.flowAmountIn}>
              {monthlyIncome > 0 ? `+${formatCurrency(monthlyIncome, currency)}` : '—'}
            </span>
          </div>
          <div className={styles.flowCard}>
            <span className={styles.flowLabel}>{t('saldo.expense_month', lang)}</span>
            <span className={styles.flowAmountOut}>
              {monthlyExpense > 0 ? `−${formatCurrency(monthlyExpense, currency)}` : '—'}
            </span>
          </div>
        </div>
      )}

      <div className={styles.divider} />

      {/* Budget */}
      <BudgetModule
        dailyBudget={dailyBudget}
        spentToday={spentToday}
        settings={settings}
        currency={currency}
        unpaidTagihanTotal={unpaidTagihanTotal}
        totalSaldo={totalSaldo}
        nowMs={nowMs}
      />

      <div className={styles.divider} />

      {/* Tagihan */}
      <TagihanModule
        tagihan={tagihan.filter((t) => t.currency === currency)}
        currency={currency}
        nowMs={nowMs}
        onPayTap={(t) => setMarkPaidTagihan(t)}
        onRowTap={(t) => setDetailTagihan(t)}
        onAddTap={() => setTagihanSheetOpen(true)}
      />

      <div className={styles.divider} />

      {/* Goal */}
      <GoalModule
        goals={goals.filter((g) => g.currency === currency)}
        totalNabung={totalNabung}
        currency={currency}
        onReorder={handleGoalReorder}
        onAddTap={() => setGoalSheetOpen(true)}
        onGoalTap={() => setGoalSheetOpen(true)}
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
          onCommit={(walletId, amount, dateMs) =>
            handleTagihanPay(markPaidTagihan, walletId, amount, dateMs)
          }
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
          onEdit={(t) => {
            setDetailTagihan(null)
            setEditTagihan(t)
            setTagihanSheetOpen(true)
          }}
          onDelete={handleDeleteTagihan}
        />
      )}

      <UrgentTagihanSheet
        tagihan={tagihan.filter((t) => t.currency === currency)}
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
        totalNabung={totalNabung}
        onUpdate={reload}
      />

      {editWallet && (
        <WalletEditSheet
          wallet={editWallet}
          wallets={wallets}
          currency={currency}
          nowMs={nowMs}
          isOpen={!!editWallet}
          onClose={() => setEditWallet(null)}
          onUpdate={async () => {
            reload()
          }}
        />
      )}

      <ProfilWalletsSheet
        isOpen={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
        wallets={wallets}
        currency={currency}
        nowMs={nowMs}
        initialStep="add"
        onUpdate={async () => {
          reload()
        }}
      />

      <ProfilTagihanSheet
        isOpen={tagihanSheetOpen}
        onClose={() => {
          setTagihanSheetOpen(false)
          setEditTagihan(null)
        }}
        tagihan={tagihan}
        currency={currency}
        nowMs={nowMs}
        onUpdate={async () => {
          reload()
        }}
        initialEditTagihan={editTagihan}
      />

      <ProfilGoalSheet
        isOpen={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        goals={goals.filter((g) => g.currency === currency)}
        currency={currency}
        nowMs={nowMs}
        onUpdate={async () => {
          reload()
        }}
        onDeleteGoal={handleDeleteGoal}
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
