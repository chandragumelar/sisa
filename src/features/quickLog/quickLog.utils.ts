import type { Transaction } from '@/db/database'
import { FALLBACK_CATEGORY } from '@/features/category/category.types'

export type QuickLogMode = 'keluar' | 'masuk'

export interface QuickLogInput {
  mode: QuickLogMode
  walletId: number
  amount: number
  label: string
  dateMs: number
  currency: string
  category: string
}

export function buildKeluar(input: QuickLogInput): Omit<Transaction, 'id'> {
  return {
    walletId: input.walletId,
    amount: -Math.abs(input.amount),
    type: 'keluar',
    currency: input.currency,
    label: input.label || undefined,
    date: input.dateMs,
    isFromSavings: false,
    isEarmark: false,
    createdAt: Date.now(),
    category: input.category || FALLBACK_CATEGORY,
  }
}

export function buildMasuk(input: QuickLogInput): Omit<Transaction, 'id'> {
  return {
    walletId: input.walletId,
    amount: Math.abs(input.amount),
    type: 'masuk',
    currency: input.currency,
    label: input.label || undefined,
    date: input.dateMs,
    isFromSavings: false,
    isEarmark: false,
    createdAt: Date.now(),
    category: input.category || FALLBACK_CATEGORY,
  }
}

export function buildTransaction(input: QuickLogInput): Omit<Transaction, 'id'> {
  switch (input.mode) {
    case 'keluar':
      return buildKeluar(input)
    case 'masuk':
      return buildMasuk(input)
  }
}
