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

    const settings = buildSettings({
      language,
      incomeType,
      incomeDay: final.incomeDay,
      freelanceMinBalance: final.freelanceMinBalance
        ? parseWalletBalance(final.freelanceMinBalance)
        : null,
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
          onNext={({ incomeDay, freelanceMinBalance }) =>
            advance({ incomeDay, freelanceMinBalance })
          }
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
