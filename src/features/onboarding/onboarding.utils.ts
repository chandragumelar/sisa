import type { Settings, Wallet, IncomeFrequency, IncomeType, Language } from '@/db/database'
import type { OnboardingStep, WalletInput } from './onboarding.types'

export const TOTAL_PROGRESS_DOTS = 6

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  language: 1,
  installGuide: 1,
  license: 2,
  mentalModel: 3,
  currency: 4,
  incomeType: 5,
  incomeDetail: 5,
  payConfirm: 5,
  wallet: 6,
  currency2: 6,
}

export function getProgressCount(step: OnboardingStep): number {
  return STEP_PROGRESS[step]
}

export function getNextStep(
  current: OnboardingStep,
  incomeType: IncomeType | null,
): OnboardingStep | 'done' {
  switch (current) {
    case 'language':
      return 'installGuide'
    case 'installGuide':
      return 'license'
    case 'license':
      return 'mentalModel'
    case 'mentalModel':
      return 'currency'
    case 'currency':
      return 'incomeType'
    case 'incomeType':
      return 'incomeDetail'
    case 'incomeDetail':
      // tetap/mix need payConfirm; freelance goes straight to wallet
      return incomeType === 'freelance' ? 'wallet' : 'payConfirm'
    case 'payConfirm':
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
  incomeFrequency: IncomeFrequency
  incomeAnchorDate: number | null
  incomeDay: number | null
  freelanceMinBalance: number | null
  fixedIncome: number | null
  avgIncome: number | null
  avgIncomeBasis: IncomeFrequency | null
  lastPaydayConfirmed: number | null
  primaryCurrency: string
  secondaryCurrency: string | null
}

export function buildSettings(data: CompletedOnboardingData): Settings {
  return {
    id: 1,
    language: data.language,
    theme: 'system',
    incomeType: data.incomeType,
    incomeFrequency: data.incomeFrequency,
    incomeAnchorDate: data.incomeAnchorDate,
    incomeDay: data.incomeDay,
    freelanceMinBalance: data.freelanceMinBalance,
    fixedIncome: data.fixedIncome,
    avgIncome: data.avgIncome,
    avgIncomeBasis: data.avgIncomeBasis,
    lastPaydayConfirmed: data.lastPaydayConfirmed,
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
