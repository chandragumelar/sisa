import type { Settings, Wallet, IncomeType, Language } from '@/db/database'
import type { OnboardingStep, WalletInput } from './onboarding.types'

export const TOTAL_PROGRESS_DOTS = 6

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  language: 1,
  installGuide: 1,
  license: 2,
  mentalModel: 3,
  incomeType: 4,
  incomeDetail: 4,
  currency: 5,
  wallet: 6,
  currency2: 6,
}

export function getProgressCount(step: OnboardingStep): number {
  return STEP_PROGRESS[step]
}

export function getNextStep(
  current: OnboardingStep,
  _incomeType: IncomeType | null,
): OnboardingStep | 'done' {
  switch (current) {
    case 'language':
      return 'installGuide'
    case 'installGuide':
      return 'license'
    case 'license':
      return 'mentalModel'
    case 'mentalModel':
      return 'incomeType'
    case 'incomeType':
      return 'incomeDetail'
    case 'incomeDetail':
      return 'currency'
    case 'currency':
      return 'wallet'
    case 'wallet':
      return 'currency2'
    case 'currency2':
      return 'done'
  }
}

export interface CompletedOnboardingData {
  language: Language
  incomeType: IncomeType
  incomeDay: number | null
  freelanceMinBalance: number | null
  primaryCurrency: string
  secondaryCurrency: string | null
}

export function buildSettings(data: CompletedOnboardingData): Settings {
  return {
    id: 1,
    language: data.language,
    theme: 'system',
    incomeType: data.incomeType,
    incomeDay: data.incomeDay,
    freelanceMinBalance: data.freelanceMinBalance,
    primaryCurrency: data.primaryCurrency,
    secondaryCurrency: data.secondaryCurrency,
    activeCurrencyMode: data.primaryCurrency,
    weekendBehavior: null,
    onboardingCompleted: true,
    lastExportedAt: null,
  }
}

export function parseWalletBalance(input: string): number {
  const num = parseFloat(input.trim())
  if (isNaN(num) || num < 0) return 0
  return num
}

export function buildWalletRecords(
  inputs: WalletInput[],
  currency: string,
  nowMs: number,
): Omit<Wallet, 'id'>[] {
  return inputs.map((w, i) => ({
    name: w.name.trim(),
    balance: parseWalletBalance(w.balance),
    currency,
    order: i,
    createdAt: nowMs,
  }))
}
