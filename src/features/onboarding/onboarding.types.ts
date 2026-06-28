import type { IncomeFrequency, IncomeType, Language } from '@/db/database'
import type { FormState } from '@/features/profil/ProfilTagihanSheet.utils'

export type OnboardingStep =
  | 'langCurrency'
  | 'license'
  | 'incomeType'
  | 'incomeDetail'
  | 'payConfirm'
  | 'tagihan'
  | 'wallet'
  | 'alokasi'

export interface WalletInput {
  id: string
  name: string
  balance: string
  currency?: string
}

export type { FormState as TagihanFormState }

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
  tagihanInputs: FormState[]
  operasionalBudget: number | null
  periodEndDate: number | null
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
  tagihanInputs: [],
  operasionalBudget: null,
  periodEndDate: null,
}
