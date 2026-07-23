import type { Settings, Wallet, IncomeFrequency, IncomeType, Language } from '@/db/database'
import type { OnboardingStep, WalletInput } from './onboarding.types'

export function getPrevStep(
  current: OnboardingStep,
  incomeType: IncomeType | null,
): OnboardingStep | null {
  switch (current) {
    case 'langCurrency':
      return null
    case 'license':
      return 'langCurrency'
    case 'incomeType':
      return 'license'
    case 'incomeDetail':
      return 'incomeType'
    case 'payConfirm':
      return 'incomeDetail'
    case 'tagihan':
      return incomeType === 'freelance' ? 'incomeDetail' : 'payConfirm'
    case 'wallet':
      return 'tagihan'
    case 'alokasi':
      return 'wallet'
    case 'handoff':
      return null
  }
}

export const TOTAL_PROGRESS_DOTS = 5

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  langCurrency: 1,
  license: 2,
  incomeType: 3,
  incomeDetail: 3,
  payConfirm: 3,
  tagihan: 4,
  wallet: 4,
  alokasi: 5,
  handoff: 5,
}

export function getProgressCount(step: OnboardingStep): number {
  return STEP_PROGRESS[step]
}

export function getNextStep(
  current: OnboardingStep,
  incomeType: IncomeType | null,
): OnboardingStep | 'done' {
  switch (current) {
    case 'langCurrency':
      return 'license'
    case 'license':
      return 'incomeType'
    case 'incomeType':
      return 'incomeDetail'
    case 'incomeDetail':
      return incomeType === 'freelance' ? 'tagihan' : 'payConfirm'
    case 'payConfirm':
      return 'tagihan'
    case 'tagihan':
      return 'wallet'
    case 'wallet':
      return 'alokasi'
    case 'alokasi':
      return 'handoff'
    case 'handoff':
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
    weekendBehavior: 'tetap',
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
    currency: w.currency ?? currency,
    order: i,
    createdAt: nowMs,
  }))
}
