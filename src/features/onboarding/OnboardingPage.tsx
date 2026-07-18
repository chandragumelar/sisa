import { useEffect, useState } from 'react'
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
import { relock } from '@/shared/utils/budget.utils'
import { t } from '@/shared/strings/strings'
import type { IncomeFrequency, Language } from '@/db/database'

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

  // Presentation-only state — the chat transcript. Never read by advance/back/handleComplete.
  const [completed, setCompleted] = useState<Array<{ step: OnboardingStep; echo: string }>>([])
  const [extraBotLines, setExtraBotLines] = useState<string[]>([])
  // One-shot brand intro on fresh start — flips true once and never resets, so back-navigating
  // to langCurrency later never replays it (a page refresh remounts everything, which is fine).
  const [introDone, setIntroDone] = useState(false)

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
    if (nextStep === 'done') {
      void handleComplete(next)
    } else {
      setStep(nextStep)
    }
  }

  async function handleComplete(final: OnboardingAccumulated) {
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

    if (final.operasionalBudget != null) {
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
      const allocation = relock({
        totalSaldo: totalSaldoForAlokasi,
        tagihanUnpaid: tagihanTotal,
        buatDipakai: final.operasionalBudget,
        sisaHari,
        now: nowMs,
        periodEndDate: incomeType === 'freelance' ? final.periodEndDate : null,
      })
      await putAllocation(allocation)
    }

    navigate('/', { replace: true, viewTransition: true })
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
      onBack={step !== 'langCurrency' ? popCompletedAndBack : undefined}
      historyEntries={historyEntries}
      activeStepEntries={activeStepEntries}
      dock={dock}
      introActive={step === 'langCurrency' && !introDone}
      onIntroDone={() => setIntroDone(true)}
    />
  )
}
