import type { IncomeType, Language, Tier } from '@/db/database'

export type OnboardingStep =
  | 'language'
  | 'license'
  | 'mentalModel'
  | 'incomeType'
  | 'incomeDetail'
  | 'currency'
  | 'wallet'
  | 'currency2'

export interface WalletInput {
  name: string
  balance: string
}

export interface OnboardingAccumulated {
  language: Language | null
  tier: Tier | null
  incomeType: IncomeType | null
  incomeDay: number | null
  freelanceMinBalance: string
  primaryCurrency: string | null
  wallets: WalletInput[]
  secondaryCurrency: string | null
}

export const INITIAL_ACCUMULATED: OnboardingAccumulated = {
  language: null,
  tier: null,
  incomeType: null,
  incomeDay: null,
  freelanceMinBalance: '',
  primaryCurrency: null,
  wallets: [{ name: '', balance: '' }],
  secondaryCurrency: null,
}
