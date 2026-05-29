import type { IncomeType, Language } from '@/db/database'

export type OnboardingStep =
  | 'language'
  | 'installGuide'
  | 'license'
  | 'pwaInstall'
  | 'mentalModel'
  | 'incomeType'
  | 'incomeDetail'
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
  incomeDay: number | null
  freelanceMinBalance: string
  primaryCurrency: string | null
  wallets: WalletInput[]
  secondaryCurrency: string | null
}

export const INITIAL_ACCUMULATED: OnboardingAccumulated = {
  language: null,
  incomeType: null,
  incomeDay: null,
  freelanceMinBalance: '',
  primaryCurrency: null,
  wallets: [{ id: crypto.randomUUID(), name: '', balance: '' }],
  secondaryCurrency: null,
}
