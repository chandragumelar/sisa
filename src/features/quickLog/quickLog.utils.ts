import type { Transaction } from '@/db/database'

export type QuickLogMode = 'keluar' | 'masuk' | 'nabung'
export type NabungMode = 'earmark' | 'pindah'

export const LABELS_KELUAR = ['makan', 'transport', 'belanja', 'tagihan', 'lainnya']
export const LABELS_MASUK = ['gaji', 'freelance', 'bonus', 'lainnya']

export interface QuickLogInput {
  mode: QuickLogMode
  walletId: number
  amount: number
  label: string
  note: string
  dateMs: number
  currency: string
  isFromSavings: boolean
  nabungMode?: NabungMode
}

export function buildKeluar(input: QuickLogInput): Omit<Transaction, 'id'> {
  return {
    walletId: input.walletId,
    amount: -Math.abs(input.amount),
    type: 'keluar',
    currency: input.currency,
    label: input.label || undefined,
    note: input.note || undefined,
    date: input.dateMs,
    isFromSavings: input.isFromSavings,
    isEarmark: false,
    createdAt: Date.now(),
  }
}

export function buildMasuk(input: QuickLogInput): Omit<Transaction, 'id'> {
  return {
    walletId: input.walletId,
    amount: Math.abs(input.amount),
    type: 'masuk',
    currency: input.currency,
    label: input.label || undefined,
    note: input.note || undefined,
    date: input.dateMs,
    isFromSavings: false,
    isEarmark: false,
    createdAt: Date.now(),
  }
}

export function buildNabung(input: QuickLogInput): Omit<Transaction, 'id'> {
  const isEarmark = input.nabungMode === 'earmark'
  return {
    walletId: input.walletId,
    amount: Math.abs(input.amount),
    type: 'nabung',
    currency: input.currency,
    label: input.label || undefined,
    note: input.note || undefined,
    date: input.dateMs,
    isFromSavings: false,
    isEarmark,
    createdAt: Date.now(),
  }
}

export function buildTransaction(input: QuickLogInput): Omit<Transaction, 'id'> {
  switch (input.mode) {
    case 'keluar':
      return buildKeluar(input)
    case 'masuk':
      return buildMasuk(input)
    case 'nabung':
      return buildNabung(input)
  }
}
