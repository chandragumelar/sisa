import { Step4bIncomeDetail } from '../steps/Step4bIncomeDetail'
import { StepTagihan } from '../steps/StepTagihan'
import { Step4dWallet } from '../steps/Step4dWallet'
import { StepAlokasi } from '../steps/StepAlokasi'
import { StepHandoff } from '../steps/StepHandoff'
import type {
  HandoffView,
  OnboardingAccumulated,
  OnboardingStep,
  WalletInput,
} from '../onboarding.types'
import type { FormState } from '@/features/profil/ProfilTagihanSheet.utils'
import { parseWalletBalance } from '../onboarding.utils'
import { parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { calcDaysUntilPayday } from '@/features/home/home.utils'
import type { IncomeType } from '@/db/database'

interface Props {
  step: OnboardingStep
  data: OnboardingAccumulated
  nowMs: number
  onDataChange: (updater: (d: OnboardingAccumulated) => OnboardingAccumulated) => void
  onIncomeDetailNext: (vals: {
    incomeDay: number | null
    freelanceMinBalance: string
    fixedIncome: string
    incomeFrequency: OnboardingAccumulated['incomeFrequency']
    incomeAnchorDate: number | null
    avgIncome: string
    avgIncomeBasis: OnboardingAccumulated['avgIncomeBasis']
  }) => void
  onTagihanNext: () => void
  onWalletNext: () => void
  onAlokasiNext: (operasionalBudget: number, periodEndDate: number | null) => void
  handoffView: HandoffView | null
  onHandoffCta: () => void
}

/** Renders the current complex step's existing form component unchanged, for embedding in a chat card. */
export function StepCardSlot({
  step,
  data,
  nowMs,
  onDataChange,
  onIncomeDetailNext,
  onTagihanNext,
  onWalletNext,
  onAlokasiNext,
  handoffView,
  onHandoffCta,
}: Props) {
  if (step === 'handoff') {
    return <StepHandoff view={handoffView} onCta={onHandoffCta} />
  }

  if (step === 'incomeDetail') {
    return (
      <Step4bIncomeDetail
        incomeType={data.incomeType ?? 'tetap'}
        currency={data.primaryCurrency ?? 'IDR'}
        onNext={onIncomeDetailNext}
      />
    )
  }

  if (step === 'tagihan') {
    return (
      <StepTagihan
        tagihan={data.tagihanInputs}
        currency={data.primaryCurrency ?? 'IDR'}
        onChange={(tagihanInputs) => onDataChange((d) => ({ ...d, tagihanInputs }))}
        onNext={onTagihanNext}
      />
    )
  }

  if (step === 'wallet') {
    return (
      <Step4dWallet
        primaryCurrency={data.primaryCurrency ?? 'IDR'}
        language={data.language}
        wallets={data.wallets}
        onChange={(wallets) => onDataChange((d) => ({ ...d, wallets }))}
        onNext={onWalletNext}
      />
    )
  }

  // alokasi
  const currency = data.primaryCurrency ?? 'IDR'
  const namedWallets = data.wallets.filter((w) => w.name.trim())
  const resolveWCur = (w: WalletInput) => w.currency?.trim() || currency
  const resolveTCur = (tg: FormState) => tg.currency?.trim() || currency
  const primaryWallets = namedWallets
    .filter((w) => resolveWCur(w) === currency)
    .map((w) => ({ name: w.name.trim(), amount: parseWalletBalance(w.balance) }))
  const otherWallets = namedWallets
    .filter((w) => resolveWCur(w) !== currency)
    .map((w) => ({
      name: w.name.trim(),
      amount: parseWalletBalance(w.balance),
      currency: resolveWCur(w),
    }))
  const primaryTagihan = data.tagihanInputs
    .filter((tg) => resolveTCur(tg) === currency)
    .map((tg) => ({
      name: tg.name.trim(),
      amount: parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0,
    }))
  const otherTagihan = data.tagihanInputs
    .filter((tg) => resolveTCur(tg) !== currency)
    .map((tg) => ({
      name: tg.name.trim(),
      amount: parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0,
      currency: resolveTCur(tg),
    }))
  const totalSaldo = primaryWallets.reduce((s, w) => s + w.amount, 0)
  const tagihanTotal = primaryTagihan.reduce((s, tg) => s + tg.amount, 0)
  const nowDate = new Date(nowMs)
  const effectivePeriodEnd =
    data.periodEndDate ?? new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getTime()
  const sisaHari =
    data.incomeType === 'freelance'
      ? Math.max(1, Math.round((effectivePeriodEnd - nowMs) / 86_400_000))
      : calcDaysUntilPayday(nowMs, {
          incomeType: data.incomeType ?? ('tetap' as IncomeType),
          incomeFrequency: data.incomeFrequency ?? 'bulanan',
          incomeAnchorDate: data.incomeAnchorDate,
          incomeDay: data.incomeDay,
          weekendBehavior: 'tetap',
        } as import('@/db/database').Settings)

  return (
    <StepAlokasi
      incomeType={data.incomeType ?? 'tetap'}
      totalSaldo={totalSaldo}
      tagihanTotal={tagihanTotal}
      sisaHari={sisaHari}
      currency={currency}
      periodEndDate={data.periodEndDate}
      primaryWallets={primaryWallets}
      primaryTagihan={primaryTagihan}
      otherWallets={otherWallets}
      otherTagihan={otherTagihan}
      onPeriodEndDateChange={(ms) => onDataChange((d) => ({ ...d, periodEndDate: ms }))}
      onNext={onAlokasiNext}
    />
  )
}
