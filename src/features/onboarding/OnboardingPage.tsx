import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './step.css'
import { useClock } from '@/app/providers/useClock'
import { useSetLanguage } from '@/app/providers/useLanguage'
import { saveSettings } from '@/db/settings.repository'
import { addWallet } from '@/db/wallets.repository'
import { addTagihan } from '@/db/tagihan.repository'
import { syncTagihanReminder } from '@/lib/supabase/api'
import { putAllocation } from '@/db/allocation.repository'
import { computeAnchor } from '@/features/profil/ProfilTagihanSheet.utils'
import { parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { ChatShell } from './components/ChatShell'
import { StepCardSlot } from './components/StepCardSlot'
import { DockLangCurrency } from './components/docks/DockLangCurrency'
import { DockLicense } from './components/docks/DockLicense'
import { DockIncomeType } from './components/docks/DockIncomeType'
import { DockPayConfirm } from './components/docks/DockPayConfirm'
import { getBaseBotLines, CARD_STEPS } from './components/chatScript'
import type { TranscriptEntry } from './components/chatTranscript.types'
import {
  INITIAL_ACCUMULATED,
  type HandoffView,
  type OnboardingAccumulated,
  type OnboardingStep,
} from './onboarding.types'
import {
  buildSettings,
  buildWalletRecords,
  getNextStep,
  getPrevStep,
  parseWalletBalance,
} from './onboarding.utils'
import { getPaydayDate, calcDaysUntilPayday } from '@/features/home/home.utils'
import { relock, calcBudgetPeriode, resolveBudgetView } from '@/shared/utils/budget.utils'
import { t } from '@/shared/strings/strings'
import type { IncomeFrequency, Language } from '@/db/database'

function buildHandoffLines(lang: Language, view: HandoffView): string[] {
  const sisaFmt = formatCurrency(view.sisaUang, view.currency)
  const jatahFmt = formatCurrency(view.jatahHariIni, view.currency)
  return [
    t('ob.handoff.line1', lang),
    t('ob.handoff.line2', lang).replace('{sisa}', sisaFmt),
    t('ob.handoff.line3', lang)
      .replace('{hari}', String(view.sisaHari))
      .replace('{jatah}', jatahFmt),
    t('ob.handoff.line4', lang),
  ]
}

function getPreviousPaydayMs(nextPaydayMs: number, frequency: IncomeFrequency): number {
  const d = new Date(nextPaydayMs)
  if (frequency === 'mingguan') d.setDate(d.getDate() - 7)
  else if (frequency === '2mingguan') d.setDate(d.getDate() - 14)
  else d.setMonth(d.getMonth() - 1)
  return d.getTime()
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const clock = useClock()
  const setLang = useSetLanguage()
  const [step, setStep] = useState<OnboardingStep>('langCurrency')
  const [data, setData] = useState<OnboardingAccumulated>(INITIAL_ACCUMULATED)

  // Presentation-only state — the chat transcript. Never read by advance/back/persistOnboarding.
  const [completed, setCompleted] = useState<Array<{ step: OnboardingStep; echo: string }>>([])
  const [extraBotLines, setExtraBotLines] = useState<string[]>([])
  // One-shot brand intro on fresh start — flips true once and never resets, so back-navigating
  // to langCurrency later never replays it (a page refresh remounts everything, which is fine).
  const [introDone, setIntroDone] = useState(false)
  // Numbers shown on the handoff card — null while persistOnboarding is still writing to DB.
  const [handoffView, setHandoffView] = useState<HandoffView | null>(null)
  // Guards against persisting twice (e.g. a double-tap on alokasi's CTA before the
  // step transition commits) — writes to DB, so unlike every other step it can't be redone.
  const persistedRef = useRef(false)

  useEffect(() => {
    setExtraBotLines([])
  }, [step])

  function back() {
    const prev = getPrevStep(step, data.incomeType)
    if (prev !== null) setStep(prev)
  }

  function advance(patch: Partial<OnboardingAccumulated> = {}) {
    const next = { ...data, ...patch }
    if (patch.language) setLang(patch.language)
    setData(next)
    const nextStep = getNextStep(step, next.incomeType)
    // 'done' is unreachable in practice — the handoff card's CTA navigates directly
    // instead of calling advance() again. Kept only so the switch stays exhaustive.
    if (nextStep === 'done') {
      navigate('/', { replace: true, viewTransition: true })
      return
    }
    setStep(nextStep)
    if (nextStep === 'handoff' && !persistedRef.current) {
      persistedRef.current = true
      void persistOnboarding(next).then((view) => {
        setHandoffView(view)
        setExtraBotLines(buildHandoffLines(next.language ?? 'id', view))
      })
    }
  }

  function handleHandoffCta() {
    navigate('/', { replace: true, viewTransition: true })
  }

  async function persistOnboarding(final: OnboardingAccumulated): Promise<HandoffView> {
    const language = final.language ?? 'id'
    const incomeType = final.incomeType ?? 'tetap'
    const primaryCurrency = final.primaryCurrency ?? 'IDR'
    const avgIncomeNum = final.avgIncome ? parseWalletBalance(final.avgIncome) : null
    const fixedIncomeNum = final.fixedIncome ? parseWalletBalance(final.fixedIncome) : null
    const nowMs = clock.now()

    const settings = buildSettings({
      language,
      incomeType,
      incomeFrequency: final.incomeFrequency ?? 'bulanan',
      incomeAnchorDate: final.incomeAnchorDate,
      incomeDay: final.incomeDay,
      freelanceMinBalance: final.freelanceMinBalance
        ? parseWalletBalance(final.freelanceMinBalance)
        : null,
      fixedIncome: fixedIncomeNum && fixedIncomeNum > 0 ? fixedIncomeNum : null,
      avgIncome: avgIncomeNum && avgIncomeNum > 0 ? avgIncomeNum : null,
      avgIncomeBasis: avgIncomeNum && avgIncomeNum > 0 ? final.avgIncomeBasis : null,
      lastPaydayConfirmed: final.lastPaydayConfirmed,
      primaryCurrency,
    })

    const walletRecords = buildWalletRecords(
      final.wallets.filter((w) => w.name.trim()),
      primaryCurrency,
      nowMs,
    )

    await saveSettings(settings)
    for (const wallet of walletRecords) {
      await addWallet(wallet)
    }
    for (const tg of final.tagihanInputs) {
      const nominal = parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0
      const { anchorDate, dueDay } = computeAnchor(tg, nowMs)
      const newTagihan = {
        name: tg.name.trim(),
        nominalType: tg.nominalType,
        nominalEstimate: nominal,
        dueDay,
        frequency: tg.frequency,
        anchorDate,
        currency: tg.currency || primaryCurrency,
        isActive: true,
        lastPaidAt: null,
        lastPaidAmount: null,
        createdAt: nowMs,
      }
      const newId = await addTagihan(newTagihan)
      void syncTagihanReminder({ id: newId, ...newTagihan }).catch(() => {})
    }

    const partialSettings = {
      incomeType,
      incomeFrequency: final.incomeFrequency ?? 'bulanan',
      incomeAnchorDate: final.incomeAnchorDate,
      incomeDay: final.incomeDay,
      weekendBehavior: 'tetap',
    } as import('@/db/database').Settings
    const totalSaldoForAlokasi = final.wallets
      .filter((w) => w.name.trim())
      .reduce((s, w) => s + parseWalletBalance(w.balance), 0)
    const tagihanTotal = final.tagihanInputs.reduce(
      (s, tg) => s + (parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0),
      0,
    )
    const sisaHari = final.periodEndDate
      ? Math.max(1, Math.round((final.periodEndDate - nowMs) / 86_400_000))
      : calcDaysUntilPayday(nowMs, partialSettings)

    let allocation = null
    if (final.operasionalBudget != null) {
      allocation = relock({
        totalSaldo: totalSaldoForAlokasi,
        tagihanUnpaid: tagihanTotal,
        buatDipakai: final.operasionalBudget,
        sisaHari,
        now: nowMs,
        periodEndDate: incomeType === 'freelance' ? final.periodEndDate : null,
      })
      await putAllocation(allocation)
    }

    // spentSinceLock/spentToday are 0 — this is a brand-new user, nothing spent yet.
    const budget = calcBudgetPeriode({
      pemasukanPeriode: 0,
      unpaidTagihanTotal: tagihanTotal,
      hariPeriode: sisaHari,
      spentThisPeriode: 0,
      spentToday: 0,
      totalSaldo: totalSaldoForAlokasi,
      useSaldoFloor: incomeType === 'freelance',
      operasionalBudget: final.operasionalBudget,
      jatahHarianLocked: allocation?.jatahHarian,
    })
    const view = resolveBudgetView(allocation, budget, {
      totalSaldo: totalSaldoForAlokasi,
      tagihanUnpaid: tagihanTotal,
      spentSinceLock: 0,
      spentToday: 0,
    })

    return {
      sisaUang: view.sisaUang,
      jatahHariIni: view.jatahHariIni,
      currency: primaryCurrency,
      sisaHari,
    }
  }

  // ── Presentation wiring: pushes the just-answered step into the transcript, then ──
  // ── defers to the untouched advance()/back() above for the actual state machine. ──
  function pushCompletedAndAdvance(patch: Partial<OnboardingAccumulated>, echo: string) {
    setCompleted((c) => [...c, { step, echo }])
    advance(patch)
  }

  function popCompletedAndBack() {
    setCompleted((c) => c.slice(0, -1))
    back()
  }

  const lang: Language = data.language ?? 'id'

  const historyEntries: TranscriptEntry[] = completed.flatMap(({ step: s, echo }) => {
    const botEntries: TranscriptEntry[] = getBaseBotLines(s, lang).map((text, i) => ({
      id: `${s}-bot-${i}`,
      role: 'bot',
      text,
    }))
    return [...botEntries, { id: `${s}-echo`, role: 'user', text: echo }]
  })

  const activeBotEntries: TranscriptEntry[] = getBaseBotLines(step, lang).map((text, i) => ({
    id: `${step}-bot-${i}`,
    role: 'bot',
    text,
  }))
  const activeExtraEntries: TranscriptEntry[] = extraBotLines.map((text, i) => ({
    id: `${step}-extra-${i}`,
    role: 'bot',
    text,
  }))
  const activeCardEntry: TranscriptEntry[] = CARD_STEPS.includes(step)
    ? [
        {
          id: `${step}-card`,
          role: 'bot',
          card: (
            <StepCardSlot
              step={step}
              data={data}
              nowMs={clock.now()}
              onDataChange={setData}
              onIncomeDetailNext={(vals) =>
                pushCompletedAndAdvance(vals, t('ob.chat.echo_income_detail', lang))
              }
              onTagihanNext={() => {
                const n = data.tagihanInputs.length
                const echo =
                  n > 0
                    ? t('ob.chat.echo_tagihan', lang).replace('{n}', String(n))
                    : t('ob.chat.echo_tagihan_skip', lang)
                pushCompletedAndAdvance({}, echo)
              }}
              onWalletNext={() => {
                const n = data.wallets.filter((w) => w.name.trim()).length
                pushCompletedAndAdvance(
                  {},
                  t('ob.chat.echo_wallet', lang).replace('{n}', String(n)),
                )
              }}
              onAlokasiNext={(operasionalBudget, periodEndDate) =>
                advance({ operasionalBudget, periodEndDate })
              }
              handoffView={handoffView}
              onHandoffCta={handleHandoffCta}
            />
          ),
        },
      ]
    : []

  const activeStepEntries: TranscriptEntry[] = [
    ...activeBotEntries,
    ...activeExtraEntries,
    ...activeCardEntry,
  ]

  const onBotSay = (text: string) => setExtraBotLines((prev) => [...prev, text])

  let dock: React.ReactNode = null
  if (step === 'langCurrency') {
    dock = (
      <DockLangCurrency
        onBotSay={onBotSay}
        onNext={(result, echo) => pushCompletedAndAdvance(result, echo)}
      />
    )
  } else if (step === 'license') {
    dock = <DockLicense onBotSay={onBotSay} onNext={(echo) => pushCompletedAndAdvance({}, echo)} />
  } else if (step === 'incomeType') {
    dock = (
      <DockIncomeType
        onNext={(incomeType, echo) => pushCompletedAndAdvance({ incomeType }, echo)}
      />
    )
  } else if (step === 'payConfirm') {
    dock = (
      <DockPayConfirm
        previousPaydayMs={getPreviousPaydayMs(
          getPaydayDate(clock.now(), {
            incomeType: data.incomeType ?? 'tetap',
            incomeFrequency: data.incomeFrequency ?? 'bulanan',
            incomeAnchorDate: data.incomeAnchorDate,
            incomeDay: data.incomeDay,
            weekendBehavior: 'tetap',
          } as import('@/db/database').Settings).getTime(),
          data.incomeFrequency ?? 'bulanan',
        )}
        onNext={(lastPaydayConfirmed, echo) =>
          pushCompletedAndAdvance({ lastPaydayConfirmed }, echo)
        }
      />
    )
  }

  return (
    <ChatShell
      step={step}
      onBack={step !== 'langCurrency' && step !== 'handoff' ? popCompletedAndBack : undefined}
      historyEntries={historyEntries}
      activeStepEntries={activeStepEntries}
      dock={dock}
      introActive={step === 'langCurrency' && !introDone}
      onIntroDone={() => setIntroDone(true)}
    />
  )
}
