import { useCallback, useEffect, useRef, useState } from 'react'
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
import { getAllGoals, deleteGoal, updateGoalsOrder } from '@/db/goals.repository'
import {
  getTotalNabung,
  getMonthlyFlows,
  getPeriodFlows,
  deleteTransactionAndRevertBalance,
  addNabungDeduction,
} from '@/db/transactions.repository'
import { t } from '@/shared/strings/strings'
import type { Language, Settings, Wallet, Tagihan, Goal } from '@/db/database'
import {
  calcDaysUntilPayday,
  calcGoalStatuses,
  getPaydayDate,
  getPeriodStartDate,
  calcHariPeriode,
  shouldShowTransisiBanner,
  needsPaydayConfirmation,
  isHariPertamaMode,
  calcPemasukanFromAvg,
} from './home.utils'
import { calcUnpaidTagihanTotal, getTagihanUrgency } from './tagihan.utils'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'
import { calcBudgetPeriode, type BudgetMode } from '@/shared/utils/budget.utils'
import { BRAND_STUDIO_WITH_COLLAB } from '@/constants/brand'
import { CekDuluCard } from './components/CekDuluCard'
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
import { TransisiPeriodeBanner } from './components/TransisiPeriodeBanner'
import { WalletEditSheet } from '@/features/wallet/WalletEditSheet'
import { ProfilTagihanSheet } from '@/features/profil/ProfilTagihanSheet'
import { ProfilGoalSheet } from '@/features/profil/ProfilGoalSheet'
import { ProfilWalletsSheet } from '@/features/profil/ProfilWalletsSheet'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import type { QuickLogMode } from '@/features/quickLog/quickLog.utils'
import { BerbagiKeamananSection } from '@/features/shared-profile/components/BerbagiKeamananSection'
import { AlokasiEditSheet } from '@/features/alokasi/AlokasiEditSheet'
import { recomputeAlokasi } from '@/shared/utils/budget.utils'
import styles from './HomePage.module.css'

interface HomeData {
  settings: Settings | null
  wallets: Wallet[]
  tagihan: Tagihan[]
  goals: Goal[]
  totalNabung: number
  monthlyIncome: number
  monthlyExpense: number
  sisaPeriode: number
  jatahHarian: number | null
  anggaranOperasional: number
  uangMengendap: number
  mode: BudgetMode
  shortfall: number
  pemasukanPeriode: number
  hariPeriode: number
  spentThisPeriode: number
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
    sisaPeriode: 0,
    jatahHarian: null,
    anggaranOperasional: 0,
    uangMengendap: 0,
    mode: 'normal',
    shortfall: 0,
    pemasukanPeriode: 0,
    hariPeriode: 0,
    spentThisPeriode: 0,
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
        const totalSaldoForCalc = wallets
          .filter((w) => w.currency === currency)
          .reduce((sum, w) => sum + w.balance, 0)
        const nextPaydayMsForCalc = getPaydayDate(nowMs, settings).getTime()
        const unpaidForCalc = calcUnpaidTagihanTotal(
          tagihan.filter((tg) => tg.currency === currency),
          nowMs,
          nextPaydayMsForCalc,
        )
        const periodStartMs = getPeriodStartDate(nowMs, settings).getTime()
        const hariPeriode = calcHariPeriode(nowMs, settings)

        Promise.all([
          getTotalNabung(currency),
          getMonthlyFlows(currency, monthStart, monthEnd),
          getPeriodFlows(currency, periodStartMs, nowMs),
        ]).then(
          ([
            totalNabung,
            { income: monthlyIncome, expense: monthlyExpense },
            { income, expense, spentToday },
          ]) => {
            if (!cancelled) {
              const hariPertama = isHariPertamaMode(settings.lastPaydayConfirmed, income)
              let effectivePemasukan = income
              if (hariPertama) {
                effectivePemasukan = totalSaldoForCalc
              } else if (income === 0 && settings.fixedIncome && settings.fixedIncome > 0) {
                effectivePemasukan = settings.fixedIncome
              } else if (
                (settings.incomeType === 'freelance' || settings.incomeType === 'mix') &&
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
                unpaidTagihanTotal: unpaidForCalc,
                targetTabungan: totalNabung,
                hariPeriode,
                spentThisPeriode: expense,
                spentToday,
                totalSaldo: totalSaldoForCalc,
                useSaldoFloor: settings.incomeType === 'freelance',
                operasionalBudget: settings.operasionalBudget ?? null,
                jatahHarianLocked: settings.jatahHarianLocked ?? null,
              })
              setData({
                settings,
                wallets,
                tagihan,
                goals,
                totalNabung,
                monthlyIncome,
                monthlyExpense,
                sisaPeriode: budget.sisaPeriode,
                jatahHarian: budget.jatahHarian,
                anggaranOperasional: budget.anggaranOperasional,
                uangMengendap: budget.uangMengendap,
                mode: budget.mode,
                shortfall: budget.shortfall,
                pemasukanPeriode: budget.pemasukanPeriode,
                hariPeriode: budget.hariPeriode,
                spentThisPeriode: expense,
              })
              setIsLoading(false)
            }
          },
        )
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
    sisaPeriode,
    jatahHarian,
    uangMengendap,
    mode,
    shortfall,
    pemasukanPeriode,
    spentThisPeriode,
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
  const [quickLogInitialMode, setQuickLogInitialMode] = useState<QuickLogMode | undefined>(
    undefined,
  )
  const [showGoalToast, setShowGoalToast] = useState(false)
  const [firstGoalName, setFirstGoalName] = useState('')
  const prevGoalsLengthRef = useRef<number | null>(null)
  const [alokasiSheetOpen, setAlokasiSheetOpen] = useState(false)

  useEffect(() => {
    const prev = prevGoalsLengthRef.current
    if (prev === 0 && goals.length === 1) {
      setFirstGoalName(goals[0].name)
      setShowGoalToast(true)
    }
    prevGoalsLengthRef.current = goals.length
  }, [goals])

  if (isLoading || !settings) return null

  const currency = settings.activeCurrencyMode || settings.primaryCurrency
  const nextPaydayMs = getPaydayDate(nowMs, settings).getTime()
  const unpaidTagihanTotal = calcUnpaidTagihanTotal(
    tagihan.filter((tg) => tg.currency === currency),
    nowMs,
    nextPaydayMs,
  )
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const condition = getConditionInfo(settings, sisaPeriode, lang)

  const backupDismissedAt = (() => {
    const raw = localStorage.getItem(BACKUP_DISMISS_KEY)
    return raw ? parseInt(raw, 10) : null
  })()
  const showBackupCard = shouldShowBackupReminder(settings.lastExportedAt, backupDismissedAt, nowMs)
  const backupUrgency = calcBackupUrgency(settings.lastExportedAt, nowMs)

  const showTransisiBanner = shouldShowTransisiBanner(nowMs, settings)

  async function handleTransisiConfirm(lastPaydayConfirmed: number, fixedIncome: number | null) {
    await patchSettings({
      lastPaydayConfirmed,
      ...(fixedIncome !== null ? { fixedIncome } : {}),
    })
    reload()
  }

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

  async function handleSaveAlokasi(operasional: number) {
    const totalSaldoForAlokasi = wallets
      .filter((w) => w.currency === currency)
      .reduce((s, w) => s + w.balance, 0)
    const sisaHari = settings.periodEndDate
      ? Math.max(1, Math.round((settings.periodEndDate - nowMs) / 86_400_000))
      : daysUntilPayday
    const { jatahHarianLocked } = recomputeAlokasi({
      totalSaldo: totalSaldoForAlokasi,
      unpaidTagihanTotal,
      operasionalBudget: operasional,
      sisaHari,
    })
    const patch: Partial<import('@/db/database').Settings> = {
      operasionalBudget: operasional,
      jatahHarianLocked,
    }
    // Re-divide event also confirms payday if it's pending
    if (needsPaydayConfirmation(nowMs, settings)) {
      patch.lastPaydayConfirmed = nowMs
    }
    await patchSettings(patch)
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

        {/* Transisi periode banner (H-2) */}
        {showTransisiBanner && (
          <TransisiPeriodeBanner
            currency={currency}
            defaultNominal={settings.fixedIncome}
            nowMs={nowMs}
            onConfirm={handleTransisiConfirm}
          />
        )}

        {/* Payday alokasi banner — shown when alokasi model active + payday unconfirmed */}
        {!showTransisiBanner &&
          settings.operasionalBudget != null &&
          needsPaydayConfirmation(nowMs, settings) && (
            <div className={styles.paydayAlokasiCard}>
              <div className={styles.paydayAlokasiBody}>
                <p className={styles.paydayAlokasiTag}>Gajian masuk?</p>
                <p className={styles.paydayAlokasiTitle}>Atur ulang alokasi lo</p>
                <p className={styles.paydayAlokasiMsg}>
                  Saldo lo kayaknya naik nih. Mau langsung tentuin jatah operasional baru?
                </p>
                <button
                  className={styles.paydayAlokasiCta}
                  onClick={() => setAlokasiSheetOpen(true)}
                >
                  Atur alokasi →
                </button>
              </div>
            </div>
          )}

        {/* Cards */}
        <div className={styles.cards}>
          <CekDuluCard
            currency={currency}
            walletCount={wallets.filter((w) => w.currency === currency).length}
            tagihanCount={currencyTagihan.length}
            hasNabung={totalNabung > 0}
            sisa={sisaPeriode}
            unpaidTagihanTotal={unpaidTagihanTotal}
            onCekDulu={(amount) => navigate('/cek-dulu', { state: { initialAmount: amount } })}
            onAndai={() => navigate('/andai')}
            onAddTagihan={() => setTagihanSheetOpen(true)}
            onAddWallet={() => setWalletSheetOpen(true)}
            onNabungTap={() => {
              setQuickLogInitialMode('nabung')
              setQuickLogOpen(true)
            }}
          />

          <SaldoModule
            wallets={wallets.filter((w) => w.currency === currency)}
            currency={currency}
            sisaPeriode={sisaPeriode}
            jatahHarian={jatahHarian}
            pemasukanPeriode={pemasukanPeriode}
            uangMengendap={uangMengendap}
            mode={mode}
            shortfall={shortfall}
            unpaidTagihanTotal={unpaidTagihanTotal}
            totalNabung={totalNabung}
            spentThisPeriode={spentThisPeriode}
            daysUntilPayday={daysUntilPayday}
            nextPaydayMs={nextPaydayMs}
            conditionLabel={condition?.label ?? null}
            conditionColor={condition?.color ?? null}
            onWalletTap={(w) => setEditWallet(w)}
            onHistoryTap={() => setHistoryOpen(true)}
            onAddWalletTap={() => setWalletSheetOpen(true)}
            onEditAlokasi={() => setAlokasiSheetOpen(true)}
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
            onReorder={(ids) => updateGoalsOrder(ids).then(reload)}
            onNabungTap={() => {
              setQuickLogInitialMode('nabung')
              setQuickLogOpen(true)
            }}
            showGoalToast={showGoalToast}
            newGoalName={firstGoalName}
            onGoalToastNabung={() => {
              setShowGoalToast(false)
              setQuickLogInitialMode('nabung')
              setQuickLogOpen(true)
            }}
            onGoalToastDismiss={() => setShowGoalToast(false)}
          />

          <BerbagiKeamananSection />
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
        onClose={() => {
          setQuickLogOpen(false)
          setQuickLogInitialMode(undefined)
        }}
        wallets={wallets}
        currency={currency}
        totalNabung={totalNabung}
        nowMs={nowMs}
        onCommit={handleQuickLogCommit}
        initialMode={quickLogInitialMode}
      />

      {alokasiSheetOpen &&
        (() => {
          const totalSaldoForAlokasi = wallets
            .filter((w) => w.currency === currency)
            .reduce((s, w) => s + w.balance, 0)
          const bisaDialokasi = Math.max(0, totalSaldoForAlokasi - unpaidTagihanTotal)
          const sisaHari = settings.periodEndDate
            ? Math.max(1, Math.round((settings.periodEndDate - nowMs) / 86_400_000))
            : daysUntilPayday
          return (
            <AlokasiEditSheet
              isOpen
              onClose={() => setAlokasiSheetOpen(false)}
              bisaDialokasi={bisaDialokasi}
              sisaHari={sisaHari}
              currency={currency}
              initialOperasional={settings.operasionalBudget ?? bisaDialokasi}
              onSave={handleSaveAlokasi}
            />
          )
        })()}
    </div>
  )
}
