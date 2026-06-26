import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './step.css'
import { useClock } from '@/app/providers/useClock'
import { useSetLanguage } from '@/app/providers/useLanguage'
import { saveSettings } from '@/db/settings.repository'
import { addWallet } from '@/db/wallets.repository'
import { addTagihan } from '@/db/tagihan.repository'
import { putAllocation } from '@/db/allocation.repository'
import { computeAnchor } from '@/features/profil/ProfilTagihanSheet.utils'
import { parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { OnboardingShell } from './components/OnboardingShell'
import { Step1Language } from './steps/Step1Language'
import { Step2License } from './steps/Step2License'
import { Step4aIncomeType } from './steps/Step4aIncomeType'
import { Step4bIncomeDetail } from './steps/Step4bIncomeDetail'
import { StepPayConfirm } from './steps/StepPayConfirm'
import { Step4cCurrency } from './steps/Step4cCurrency'
import { Step4dWallet } from './steps/Step4dWallet'
import { StepTagihan } from './steps/StepTagihan'
import { StepAlokasi } from './steps/StepAlokasi'
import {
  INITIAL_ACCUMULATED,
  type OnboardingAccumulated,
  type OnboardingStep,
} from './onboarding.types'
import {
  buildSettings,
  buildWalletRecords,
  getNextStep,
  parseWalletBalance,
} from './onboarding.utils'
import { getPaydayDate, calcDaysUntilPayday } from '@/features/home/home.utils'
import { relock } from '@/shared/utils/budget.utils'
import type { IncomeFrequency } from '@/db/database'

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
  const [step, setStep] = useState<OnboardingStep>('language')
  const [data, setData] = useState<OnboardingAccumulated>(INITIAL_ACCUMULATED)

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
      await addTagihan({
        name: tg.name.trim(),
        nominalType: tg.nominalType,
        nominalEstimate: nominal,
        dueDay,
        frequency: tg.frequency,
        anchorDate,
        currency: primaryCurrency,
        isActive: true,
        lastPaidAt: null,
        lastPaidAmount: null,
        createdAt: nowMs,
      })
    }

    if (final.operasionalBudget != null) {
      const partialSettings = {
        incomeType,
        incomeFrequency: final.incomeFrequency ?? 'bulanan',
        incomeAnchorDate: final.incomeAnchorDate,
        incomeDay: final.incomeDay,
        weekendBehavior: null,
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

    navigate('/', { replace: true })
  }

  return (
    <OnboardingShell step={step}>
      {step === 'language' && <Step1Language onNext={(lang) => advance({ language: lang })} />}
      {step === 'license' && <Step2License onNext={() => advance()} />}
      {step === 'incomeType' && (
        <Step4aIncomeType onNext={(incomeType) => advance({ incomeType })} />
      )}
      {step === 'incomeDetail' && (
        <Step4bIncomeDetail
          incomeType={data.incomeType ?? 'tetap'}
          currency={data.primaryCurrency ?? 'IDR'}
          onNext={({
            incomeDay,
            freelanceMinBalance,
            fixedIncome,
            incomeFrequency,
            incomeAnchorDate,
            avgIncome,
            avgIncomeBasis,
          }) =>
            advance({
              incomeDay,
              freelanceMinBalance,
              fixedIncome,
              incomeFrequency,
              incomeAnchorDate,
              avgIncome,
              avgIncomeBasis,
            })
          }
        />
      )}
      {step === 'payConfirm' && (
        <StepPayConfirm
          previousPaydayMs={getPreviousPaydayMs(
            getPaydayDate(clock.now(), {
              incomeType: data.incomeType ?? 'tetap',
              incomeFrequency: data.incomeFrequency ?? 'bulanan',
              incomeAnchorDate: data.incomeAnchorDate,
              incomeDay: data.incomeDay,
              weekendBehavior: null,
            } as import('@/db/database').Settings).getTime(),
            data.incomeFrequency ?? 'bulanan',
          )}
          onNext={(lastPaydayConfirmed) => advance({ lastPaydayConfirmed })}
        />
      )}
      {step === 'currency' && (
        <Step4cCurrency onNext={(primaryCurrency) => advance({ primaryCurrency })} />
      )}
      {step === 'tagihan' && (
        <StepTagihan
          tagihan={data.tagihanInputs}
          currency={data.primaryCurrency ?? 'IDR'}
          onChange={(tagihanInputs) => setData((d) => ({ ...d, tagihanInputs }))}
          onNext={() => advance()}
        />
      )}
      {step === 'wallet' && (
        <Step4dWallet
          primaryCurrency={data.primaryCurrency ?? 'IDR'}
          language={data.language}
          wallets={data.wallets}
          onChange={(wallets) => setData((d) => ({ ...d, wallets }))}
          onNext={() => advance()}
        />
      )}
      {step === 'alokasi' &&
        (() => {
          const currency = data.primaryCurrency ?? 'IDR'
          const totalSaldo = data.wallets
            .filter((w) => w.name.trim())
            .reduce((s, w) => s + parseWalletBalance(w.balance), 0)
          const tagihanTotal = data.tagihanInputs.reduce(
            (s, tg) => s + (parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0),
            0,
          )
          const nowMs = clock.now()
          const nowDate = new Date(nowMs)
          const effectivePeriodEnd =
            data.periodEndDate ??
            new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getTime()
          const sisaHari =
            data.incomeType === 'freelance'
              ? Math.max(1, Math.round((effectivePeriodEnd - nowMs) / 86_400_000))
              : calcDaysUntilPayday(nowMs, {
                  incomeType: data.incomeType ?? 'tetap',
                  incomeFrequency: data.incomeFrequency ?? 'bulanan',
                  incomeAnchorDate: data.incomeAnchorDate,
                  incomeDay: data.incomeDay,
                  weekendBehavior: null,
                } as import('@/db/database').Settings)
          return (
            <StepAlokasi
              incomeType={data.incomeType ?? 'tetap'}
              totalSaldo={totalSaldo}
              tagihanTotal={tagihanTotal}
              sisaHari={sisaHari}
              currency={currency}
              periodEndDate={data.periodEndDate}
              onPeriodEndDateChange={(ms) => setData((d) => ({ ...d, periodEndDate: ms }))}
              onNext={(operasionalBudget, periodEndDate) =>
                advance({ operasionalBudget, periodEndDate })
              }
            />
          )
        })()}
    </OnboardingShell>
  )
}
