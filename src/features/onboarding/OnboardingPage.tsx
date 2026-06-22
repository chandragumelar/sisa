import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './step.css'
import { useClock } from '@/app/providers/useClock'
import { useSetLanguage } from '@/app/providers/useLanguage'
import { saveSettings } from '@/db/settings.repository'
import { addWallet } from '@/db/wallets.repository'
import { OnboardingShell } from './components/OnboardingShell'
import { Step1Language } from './steps/Step1Language'
import { StepInstallGuide } from './steps/StepInstallGuide'
import { Step2License } from './steps/Step2License'
import { Step3MentalModel } from './steps/Step3MentalModel'
import { Step4aIncomeType } from './steps/Step4aIncomeType'
import { Step4bIncomeDetail } from './steps/Step4bIncomeDetail'
import { StepPayConfirm } from './steps/StepPayConfirm'
import { Step4cCurrency } from './steps/Step4cCurrency'
import { Step4dWallet } from './steps/Step4dWallet'
import { Step4eCurrency2 } from './steps/Step4eCurrency2'
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
import { getPaydayDate } from '@/features/home/home.utils'
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
      secondaryCurrency: final.secondaryCurrency,
    })

    const walletRecords = buildWalletRecords(
      final.wallets.filter((w) => w.name.trim()),
      primaryCurrency,
      clock.now(),
    )

    await saveSettings(settings)
    for (const wallet of walletRecords) {
      await addWallet(wallet)
    }

    navigate('/', { replace: true })
  }

  return (
    <OnboardingShell step={step}>
      {step === 'language' && <Step1Language onNext={(lang) => advance({ language: lang })} />}
      {step === 'installGuide' && <StepInstallGuide onNext={() => advance()} />}
      {step === 'license' && <Step2License onNext={() => advance()} />}
      {step === 'mentalModel' && <Step3MentalModel onNext={() => advance()} />}
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
      {step === 'wallet' && (
        <Step4dWallet
          primaryCurrency={data.primaryCurrency ?? 'IDR'}
          language={data.language}
          wallets={data.wallets}
          onChange={(wallets) => setData((d) => ({ ...d, wallets }))}
          onNext={() => advance()}
        />
      )}
      {step === 'currency2' && (
        <Step4eCurrency2
          primaryCurrencyCode={data.primaryCurrency ?? 'IDR'}
          onNext={(secondaryCurrency) => advance({ secondaryCurrency })}
        />
      )}
    </OnboardingShell>
  )
}
