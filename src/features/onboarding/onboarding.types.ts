import type { IncomeFrequency, IncomeType, Language } from '@/db/database'

export type OnboardingStep =
  | 'language'
  | 'installGuide'
  | 'license'
  | 'mentalModel'
  | 'incomeType'
  | 'incomeDetail'
  | 'payConfirm'
  | 'currency'
  | 'wallet'
  | 'currency2'

export interface WalletInput {
  id: string
  name: string
  balance: string
}

export interface OnboardingAccumulated {
  language: Language | null
  incomeType: IncomeType | null
  incomeFrequency: IncomeFrequency | null
  incomeAnchorDate: number | null
  incomeDay: number | null
  freelanceMinBalance: string
  fixedIncome: string
  avgIncome: string
  avgIncomeBasis: IncomeFrequency
  /** null = hari pertama (gaji belum pernah masuk), number = epoch ms of last confirmed payday */
  lastPaydayConfirmed: number | null
  primaryCurrency: string | null
  wallets: WalletInput[]
  secondaryCurrency: string | null
}

export const INITIAL_ACCUMULATED: OnboardingAccumulated = {
  language: null,
  incomeType: null,
  incomeFrequency: null,
  incomeAnchorDate: null,
  incomeDay: null,
  freelanceMinBalance: '',
  fixedIncome: '',
  avgIncome: '',
  avgIncomeBasis: 'bulanan',
  lastPaydayConfirmed: null,
  primaryCurrency: null,
  wallets: [{ id: crypto.randomUUID(), name: '', balance: '' }],
  secondaryCurrency: null,
}
