import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
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
  addNabungDeduction,
} from '@/db/transactions.repository'
import { t } from '@/shared/strings/strings'
import type { Settings, Wallet, Tagihan, Goal, Transaction } from '@/db/database'
import {
  calcDailyBudget,
  calcSpentToday,
  calcDaysUntilPayday,
  calcGoalStatuses,
  getPaydayDate,
} from './home.utils'
import { calcUnpaidTagihanTotal, getTagihanUrgency } from './tagihan.utils'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'
import { SaldoModule } from './components/SaldoModule'
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
  totalNabung: number
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
    totalNabung: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    const now = new Date(nowMs)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const tomorrowStart = todayStart + 86_400_000

    Promise.all([
      getSettings(),
      getAllWallets(),
      getActiveTagihan(),
      getAllGoals(),
      getTransactionsByDateRange(todayStart, tomorrowStart),
    ]).then(([settings, wallets, tagihan, goals, todayTxsAll]) => {
      if (cancelled || !settings) return
      const currency = settings.activeCurrencyMode || settings.primaryCurrency
      const todayTxs = todayTxsAll.filter((tx) => tx.currency === currency)
      Promise.all([getTotalNabung(currency), getLastTransaction(currency)]).then(
        ([totalNabung, lastTx]) => {
          if (!cancelled) {
            setData({
              settings,
              wallets,
              tagihan,
              goals,
              lastTx,
              todayTxs,
              totalNabung,
            })
            setIsLoading(false)
          }
        },
      )
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
  const { settings, wallets, tagihan, goals, lastTx, todayTxs, totalNabung, isLoading, reload } =
    useHomeData(nowMs)

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
  // backup reminder
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

  async function handleCurrencySwitch(cur: string) {
    await patchSettings({ activeCurrencyMode: cur })
    reload()
  }

  const hasDualCurrency = settings.secondaryCurrency != null
  const currencies = hasDualCurrency ? [settings.primaryCurrency, settings.secondaryCurrency!] : []

  const currencyTagihan = tagihan.filter((tg) => tg.currency === currency)
  const lewatTempoCount = currencyTagihan.filter(
    (tg) => tg.isActive && getTagihanUrgency(tg, nowMs) === 'lewat-tempo',
  ).length

  return (
    <div className={styles.shell}>
      <main className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.wordmark}>SISA</span>

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
            {lewatTempoCount > 0 && (
              <button className={styles.urgencyBadge} onClick={() => setUrgentSheetOpen(true)}>
                <span className={styles.urgencyDot} />
                <span>{lewatTempoCount} lewat tempo</span>
              </button>
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

        {/* Backup reminder */}
        {showBackupCard && (
          <BackupCard
            urgency={backupUrgency}
            onDismiss={() => {
              localStorage.setItem(BACKUP_DISMISS_KEY, String(nowMs))
              reload()
            }}
          />
        )}

        {/* Bento grid: Saldo + Budget tiles */}
        <div className={styles.bentoGrid}>
          <SaldoModule
            wallets={wallets.filter((w) => w.currency === currency)}
            currency={currency}
            unpaidTagihanTotal={unpaidTagihanTotal}
            totalNabung={totalNabung}
            onWalletTap={(w) => setEditWallet(w)}
            onWalletManageTap={() => setWalletSheetOpen(true)}
          />
          <BudgetModule
            dailyBudget={dailyBudget}
            spentToday={spentToday}
            settings={settings}
            currency={currency}
            unpaidTagihanTotal={unpaidTagihanTotal}
            totalSaldo={totalSaldo}
            totalNabung={totalNabung}
            nowMs={nowMs}
          />
        </div>

        {/* Tagihan */}
        <TagihanModule
          tagihan={currencyTagihan}
          currency={currency}
          nowMs={nowMs}
          onPayTap={(tg) => setMarkPaidTagihan(tg)}
          onRowTap={(tg) => setDetailTagihan(tg)}
          onAddTap={() => setTagihanSheetOpen(true)}
        />

        {/* Goal */}
        <GoalModule
          goals={goals.filter((g) => g.currency === currency)}
          totalNabung={totalNabung}
          currency={currency}
          onAddTap={() => setGoalSheetOpen(true)}
          onGoalTap={() => setGoalSheetOpen(true)}
        />

        {/* Footer */}
        <FooterCatatan
          lastTransaction={lastTx}
          currency={currency}
          onShowHistory={() => setHistoryOpen(true)}
          nowMs={nowMs}
        />
      </main>

      <BottomActionBar
        onCatat={() => setQuickLogOpen(true)}
        onCekDulu={() => navigate('/cek-dulu')}
        onAndai={() => navigate('/andai')}
      />

      {/* Toast (position: fixed, DOM position irrelevant) */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onEdit={toast.onEdit}
          onDismiss={dismissToast}
        />
      )}

      {/* Sheets (position: fixed, DOM position irrelevant) */}
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
    </div>
  )
}
