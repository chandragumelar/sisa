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
  getTotalNabung,
  getMonthlyFlows,
  deleteTransactionAndRevertBalance,
  addNabungDeduction,
} from '@/db/transactions.repository'
import { t } from '@/shared/strings/strings'
import type { Language, Settings, Wallet, Tagihan, Goal } from '@/db/database'
import { calcDaysUntilPayday, calcGoalStatuses, getPaydayDate } from './home.utils'
import { calcUnpaidTagihanTotal, getTagihanUrgency } from './tagihan.utils'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { BRAND_STUDIO_WITH_COLLAB } from '@/constants/brand'
import { DecisionHero } from './components/DecisionHero'
import { SaldoModule } from './components/SaldoModule'
import { MonthlyModule } from './components/MonthlyModule'
import { TagihanModule } from './components/TagihanModule'
import { GoalModule } from './components/GoalModule'
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
const NEAR_LIMIT_MARGIN = 0.2 // 20% above min balance = "approaching"

function getConditionInfo(
  settings: Settings,
  sisa: number,
  lang: Language,
): { label: string; color: string } | null {
  const { incomeType, freelanceMinBalance } = settings
  if (incomeType === 'tetap' || freelanceMinBalance == null || freelanceMinBalance <= 0) return null

  const nearThreshold = freelanceMinBalance * (1 + NEAR_LIMIT_MARGIN)
  if (sisa > nearThreshold) return null
  if (sisa > freelanceMinBalance) {
    return { label: t('saldo.verdict_near_limit', lang), color: 'var(--signal-caution)' }
  }
  return { label: t('saldo.verdict_below_limit', lang), color: 'var(--signal-danger)' }
}

function useHomeData(nowMs: number): HomeData & { isLoading: boolean; reload: () => void } {
  const [data, setData] = useState<HomeData>({
    settings: null,
    wallets: [],
    tagihan: [],
    goals: [],
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
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()

    Promise.all([getSettings(), getAllWallets(), getActiveTagihan(), getAllGoals()]).then(
      ([settings, wallets, tagihan, goals]) => {
        if (cancelled || !settings) return
        const currency = settings.activeCurrencyMode || settings.primaryCurrency
        Promise.all([
          getTotalNabung(currency),
          getMonthlyFlows(currency, monthStart, monthEnd),
        ]).then(([totalNabung, { income: monthlyIncome, expense: monthlyExpense }]) => {
          if (!cancelled) {
            setData({
              settings,
              wallets,
              tagihan,
              goals,
              totalNabung,
              monthlyIncome,
              monthlyExpense,
            })
            setIsLoading(false)
          }
        })
      },
    )

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
    tagihan.filter((tg) => tg.currency === currency),
    nowMs,
    nextPaydayMs,
  )
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const sisa = calcSisa(totalSaldo, unpaidTagihanTotal, totalNabung)
  const condition = getConditionInfo(settings, sisa, lang)

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

  async function handleDeleteTagihan(tg: Tagihan) {
    await deleteTagihan(tg.id!)
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
          <div className={styles.wordmark}>
            <span className={styles.wordmarkName}>sisa</span>
            <span className={styles.wordmarkBy}>by {BRAND_STUDIO_WITH_COLLAB}</span>
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
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <line x1="2.5" y1="4.5" x2="15.5" y2="4.5" />
                <line x1="2.5" y1="9" x2="15.5" y2="9" />
                <line x1="5.5" y1="13.5" x2="15.5" y2="13.5" />
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

        {/* Cards */}
        <div className={styles.cards}>
          <DecisionHero
            currency={currency}
            onCekDulu={(amount) => navigate('/cek-dulu', { state: { initialAmount: amount } })}
            onAndai={() => navigate('/andai')}
          />

          <SaldoModule
            wallets={wallets.filter((w) => w.currency === currency)}
            currency={currency}
            unpaidTagihanTotal={unpaidTagihanTotal}
            totalNabung={totalNabung}
            daysUntilPayday={daysUntilPayday}
            conditionLabel={condition?.label ?? null}
            conditionColor={condition?.color ?? null}
            onWalletTap={(w) => setEditWallet(w)}
            onHistoryTap={() => setHistoryOpen(true)}
            onAddWalletTap={() => setWalletSheetOpen(true)}
          />

          <MonthlyModule
            income={monthlyIncome}
            expense={monthlyExpense}
            totalNabung={totalNabung}
            currency={currency}
            nowMs={nowMs}
          />

          <TagihanModule
            tagihan={currencyTagihan}
            currency={currency}
            nowMs={nowMs}
            onPayTap={(tg) => setMarkPaidTagihan(tg)}
            onRowTap={(tg) => setDetailTagihan(tg)}
            onAddTap={() => setTagihanSheetOpen(true)}
          />

          <GoalModule
            goals={goals.filter((g) => g.currency === currency)}
            totalNabung={totalNabung}
            currency={currency}
            onAddTap={() => setGoalSheetOpen(true)}
            onGoalTap={() => setGoalSheetOpen(true)}
          />
        </div>
      </main>

      <BottomActionBar onCatat={() => setQuickLogOpen(true)} />

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
          onPay={(tg) => {
            setDetailTagihan(null)
            setMarkPaidTagihan(tg)
          }}
          onEdit={(tg) => {
            setDetailTagihan(null)
            setEditTagihan(tg)
            setTagihanSheetOpen(true)
          }}
          onDelete={handleDeleteTagihan}
        />
      )}

      <UrgentTagihanSheet
        tagihan={tagihan.filter((tg) => tg.currency === currency)}
        nowMs={nowMs}
        isOpen={urgentSheetOpen}
        onClose={() => setUrgentSheetOpen(false)}
        onPay={(tg) => setMarkPaidTagihan(tg)}
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
