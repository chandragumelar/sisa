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
import {
  getMonthlyFlowsByCurrency,
  getPeriodFlows,
  deleteTransactionAndRevertBalance,
  getTransactionsByDateRange,
} from '@/db/transactions.repository'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { getCurrencyLabel } from '@/constants/currencies'
import type { Language, Settings, Wallet, Tagihan, Allocation } from '@/db/database'
import {
  calcDaysUntilPayday,
  getPaydayDate,
  getPeriodStartDate,
  calcHariPeriode,
  shouldShowTransisiBanner,
  needsPaydayConfirmation,
  isHariPertamaMode,
  calcPemasukanFromAvg,
} from './home.utils'
import { calcUnpaidTagihanTotal, getTagihanUrgency } from './tagihan.utils'
import { sumExpense, sumIncome } from '@/features/insight/insight.utils'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'
import { calcBudgetPeriode, type BudgetMode } from '@/shared/utils/budget.utils'
import { BRAND_STUDIO_WITH_COLLAB } from '@/constants/brand'
import { CekDuluCard } from './components/CekDuluCard'
import { SaldoModule } from './components/SaldoModule'
import { MonthlyModule } from './components/MonthlyModule'
import { TagihanModule } from './components/TagihanModule'
import { BottomActionBar } from './components/BottomActionBar'
import { Toast } from './components/Toast'
import { MarkPaidSheet } from './components/MarkPaidSheet'
import { TagihanDetailSheet, UrgentTagihanSheet } from './components/TagihanDetailSheet'
import { HistorySheet } from './components/HistorySheet'
import { BackupCard } from './components/BackupCard'
import { TransisiPeriodeBanner } from './components/TransisiPeriodeBanner'
import { WalletEditSheet } from '@/features/wallet/WalletEditSheet'
import { ProfilTagihanSheet } from '@/features/profil/ProfilTagihanSheet'
import { ProfilWalletsSheet } from '@/features/profil/ProfilWalletsSheet'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import type { QuickLogMode } from '@/features/quickLog/quickLog.utils'
import { BerbagiKeamananSection } from '@/features/shared-profile/components/BerbagiKeamananSection'
import { AlokasiEditSheet } from '@/features/alokasi/AlokasiEditSheet'
import { getAllocation, putAllocation } from '@/db/allocation.repository'
import { relock, resolveBudgetView } from '@/shared/utils/budget.utils'
import { JatahHarianCard } from './components/JatahHarianCard'
import { WalletsCard } from './components/WalletsCard'
import { syncTagihanReminder, deleteTagihanReminder } from '@/lib/supabase/api'
import { shouldAskPush, markPushAsked } from '@/lib/push'
import { PushAskSheet } from '@/shared/components/PushAskSheet'
import styles from './HomePage.module.css'

interface HomeData {
  settings: Settings | null
  wallets: Wallet[]
  tagihan: Tagihan[]
  monthlyIncomeByCurrency: Record<string, number>
  monthlyExpenseByCurrency: Record<string, number>
  // allocation path
  allocation: Allocation | null
  sisaUang: number
  mengendap: number
  jatahHariIni: number
  spentToday: number
  spentSinceLock: number
  // legacy fields for CekDuluCard and other consumers
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
    monthlyIncomeByCurrency: {},
    monthlyExpenseByCurrency: {},
    allocation: null,
    sisaUang: 0,
    mengendap: 0,
    jatahHariIni: 0,
    spentToday: 0,
    spentSinceLock: 0,
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

    Promise.all([getSettings(), getAllWallets(), getActiveTagihan(), getAllocation()]).then(
      ([settings, wallets, tagihan, allocation]) => {
        if (cancelled || !settings) return
        const currency = settings.primaryCurrency
        const totalSaldoForCalc = wallets
          .filter((w) => w.currency === currency)
          .reduce((sum, w) => sum + w.balance, 0)
        const nextPaydayMsForCalc = getPaydayDate(nowMs, settings, allocation).getTime()
        const unpaidForCalc = calcUnpaidTagihanTotal(
          tagihan.filter((tg) => tg.currency === currency),
          nowMs,
          nextPaydayMsForCalc,
        )
        const periodStartMs = getPeriodStartDate(nowMs, settings).getTime()
        const hariPeriode = calcHariPeriode(nowMs, settings)

        Promise.all([
          getMonthlyFlowsByCurrency(monthStart, monthEnd),
          getPeriodFlows(currency, periodStartMs, nowMs),
        ]).then(
          async ([
            { income: monthlyIncomeByCurrency, expense: monthlyExpenseByCurrency },
            { income, expense, spentToday },
          ]) => {
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
              hariPeriode,
              spentThisPeriode: expense,
              spentToday,
              totalSaldo: totalSaldoForCalc,
              useSaldoFloor: settings.incomeType === 'freelance',
            })

            const view = resolveBudgetView(allocation, budget, {
              totalSaldo: totalSaldoForCalc,
              tagihanUnpaid: unpaidForCalc,
              spentSinceLock,
              spentToday,
            })
            const sisaUang = view.sisaUang
            const mengendap = view.mengendap
            const jatahHariIni = view.jatahHariIni

            setData({
              settings,
              wallets,
              tagihan,
              monthlyIncomeByCurrency,
              monthlyExpenseByCurrency,
              allocation,
              sisaUang,
              mengendap,
              jatahHariIni,
              spentToday,
              spentSinceLock,
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
    monthlyIncomeByCurrency,
    monthlyExpenseByCurrency,
    allocation,
    sisaUang,
    mengendap,
    jatahHariIni,
    spentToday,
    sisaPeriode,
    mode,
    shortfall,
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
  const [walletSheetOpen, setWalletSheetOpen] = useState(false)
  const [alokasiSheetOpen, setAlokasiSheetOpen] = useState(false)
  const [pushAskOpen, setPushAskOpen] = useState(false)
  const [teaserExpense, setTeaserExpense] = useState(0)
  const [teaserIncome, setTeaserIncome] = useState(0)

  useEffect(() => {
    void shouldAskPush().then((v) => {
      if (v) {
        void markPushAsked()
        setPushAskOpen(true)
      }
    })
  }, [])

  useEffect(() => {
    const today = new Date(nowMs)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime()
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime()
    getTransactionsByDateRange(monthStart, monthEnd)
      .then((txs) => {
        setTeaserExpense(sumExpense(txs))
        setTeaserIncome(sumIncome(txs))
      })
      .catch(() => {})
  }, [nowMs])

  if (isLoading || !settings) return null

  const currency = settings.primaryCurrency
  const nextPaydayMs = getPaydayDate(nowMs, settings, allocation).getTime()
  const unpaidTagihanTotal = calcUnpaidTagihanTotal(
    tagihan.filter((tg) => tg.currency === currency),
    nowMs,
    nextPaydayMs,
  )
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings, allocation)
  const condition = getConditionInfo(settings, sisaUang, lang)

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
      void syncTagihanReminder({ ...tg, lastPaidAt: dateMs }).catch(() => {})
      reload()
      setToast({
        message: t('home.toast_paid', lang).replace('{name}', tg.name),
        onUndo: async () => {
          await revertTagihanPayment(result)
          void syncTagihanReminder({ ...tg, lastPaidAt: null }).catch(() => {})
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
      message: mode === 'masuk' ? t('home.toast_masuk', lang) : t('home.toast_keluar', lang),
      onUndo: async () => {
        await deleteTransactionAndRevertBalance(txId)
        reload()
        dismissToast()
      },
    })
  }

  async function handleDeleteTagihan(tg: Tagihan) {
    await deleteTagihan(tg.id!)
    void deleteTagihanReminder(tg.id!).catch(() => {})
    reload()
  }

  async function handleSaveAlokasi(operasional: number) {
    if (!settings) return
    const totalSaldoForAlokasi = wallets
      .filter((w) => w.currency === currency)
      .reduce((s, w) => s + w.balance, 0)
    const sisaHari = allocation?.periodEndDate
      ? Math.max(1, Math.round((allocation.periodEndDate - nowMs) / 86_400_000))
      : daysUntilPayday
    const newAllocation = relock({
      totalSaldo: totalSaldoForAlokasi,
      tagihanUnpaid: unpaidTagihanTotal,
      buatDipakai: operasional,
      sisaHari,
      now: nowMs,
      periodEndDate: allocation?.periodEndDate ?? null,
    })
    await putAllocation(newAllocation)
    if (
      settings.incomeType !== 'freelance' &&
      needsPaydayConfirmation(nowMs, settings, allocation)
    ) {
      await patchSettings({ lastPaydayConfirmed: nowMs })
    }
    reload()
  }

  const lewatTempoCount = tagihan.filter(
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
          allocation != null &&
          needsPaydayConfirmation(nowMs, settings, allocation) && (
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
            tagihanCount={tagihan.length}
            sisa={sisaPeriode}
            unpaidTagihanTotal={unpaidTagihanTotal}
            onCekDulu={(amount) => navigate('/cek-dulu', { state: { initialAmount: amount } })}
            onAndai={() => navigate('/andai')}
            onAddTagihan={() => setTagihanSheetOpen(true)}
            onAddWallet={() => setWalletSheetOpen(true)}
          />

          <SaldoModule
            currency={currency}
            sisaUang={sisaUang}
            totalSaldo={wallets
              .filter((w) => w.currency === currency)
              .reduce((s, w) => s + w.balance, 0)}
            tagihanUnpaid={unpaidTagihanTotal}
            mengendap={mengendap}
            mode={mode}
            shortfall={shortfall}
            daysUntilPayday={daysUntilPayday}
            nextPaydayMs={nextPaydayMs}
            conditionLabel={condition?.label ?? null}
            conditionColor={condition?.color ?? null}
            onEditAlokasi={() => setAlokasiSheetOpen(true)}
          />

          {allocation && (
            <JatahHarianCard
              jatahHariIni={jatahHariIni}
              spentToday={spentToday}
              sisaUang={sisaUang}
              sisaHari={daysUntilPayday}
              currency={currency}
            />
          )}

          <MonthlyModule
            incomeByCurrency={monthlyIncomeByCurrency}
            expenseByCurrency={monthlyExpenseByCurrency}
            primaryCurrency={currency}
            nowMs={nowMs}
            onHistoryTap={() => setHistoryOpen(true)}
          />

          <WalletsCard
            wallets={wallets}
            primaryCurrency={currency}
            onWalletTap={(w) => setEditWallet(w)}
            onAddWallet={() => setWalletSheetOpen(true)}
          />

          <TagihanModule
            tagihan={tagihan}
            currency={currency}
            nowMs={nowMs}
            onPayTap={(tg) => setMarkPaidTagihan(tg)}
            onRowTap={(tg) => setDetailTagihan(tg)}
            onAddTap={() => setTagihanSheetOpen(true)}
          />

          <button className={styles.insightCard} onClick={() => navigate('/insight')}>
            <div className={styles.insightCardTop}>
              <span className={styles.insightCardLabel}>
                {t('home.insight_card_label_dynamic', lang).replace(
                  '{cur}',
                  getCurrencyLabel(currency, lang),
                )}
              </span>
            </div>
            {teaserExpense === 0 && teaserIncome === 0 ? (
              <span className={styles.insightCardText}>
                {t('home.insight_teaser_generic', lang)}
              </span>
            ) : (
              <>
                {(() => {
                  const net = teaserIncome - teaserExpense
                  const denom = Math.max(teaserIncome, teaserExpense, 1)
                  const spendPct = Math.min((teaserExpense / denom) * 100, 100)
                  return (
                    <>
                      <div className={styles.insightNet}>
                        {(net >= 0 ? '+' : '') + formatCurrency(net, currency)}
                      </div>
                      <div className={styles.insightNetSub}>{t('home.insight_net_sub', lang)}</div>
                      <div className={styles.insightSplitTrack}>
                        <div
                          className={styles.insightSplitSpend}
                          style={{ width: `${spendPct}%` }}
                        />
                        <div className={styles.insightSplitSafe} />
                      </div>
                    </>
                  )
                })()}
              </>
            )}
            <span className={styles.insightCardCta}>{t('home.insight_card_cta', lang)}</span>
          </button>

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

      <QuickLogSheet
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        wallets={wallets}
        currency={currency}
        nowMs={nowMs}
        onCommit={handleQuickLogCommit}
      />

      {alokasiSheetOpen &&
        (() => {
          const totalSaldoForAlokasi = wallets
            .filter((w) => w.currency === currency)
            .reduce((s, w) => s + w.balance, 0)
          const bisaDialokasi = Math.max(0, totalSaldoForAlokasi - unpaidTagihanTotal)
          const sisaHari = allocation?.periodEndDate
            ? Math.max(1, Math.round((allocation.periodEndDate - nowMs) / 86_400_000))
            : daysUntilPayday
          return (
            <AlokasiEditSheet
              isOpen
              onClose={() => setAlokasiSheetOpen(false)}
              bisaDialokasi={bisaDialokasi}
              sisaHari={sisaHari}
              currency={currency}
              initialOperasional={
                allocation ? allocation.jatahHarian * allocation.daysAtLock : bisaDialokasi
              }
              periodeLabel={
                settings.incomeType === 'freelance'
                  ? t('alokasi.sampai_akhir_bulan', lang)
                  : t('alokasi.sampai_gajian', lang)
              }
              onSave={handleSaveAlokasi}
            />
          )
        })()}

      <PushAskSheet isOpen={pushAskOpen} onClose={() => setPushAskOpen(false)} />
    </div>
  )
}
