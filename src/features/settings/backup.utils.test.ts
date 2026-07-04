import { describe, it, expect } from 'vitest'
import { buildTransactionsCSV } from './backup.utils'
import type { Transaction } from '@/db/database'

const TX: Transaction = {
  id: 1,
  walletId: 1,
  amount: -50_000,
  type: 'keluar',
  currency: 'IDR',
  label: 'makan',
  note: '',
  date: 1_700_000_000_000,
  isFromSavings: false,
  isEarmark: false,
  createdAt: 1_700_000_000_000,
}

describe('buildTransactionsCSV', () => {
  it('produces header row', () => {
    const csv = buildTransactionsCSV([TX])
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toContain('id')
    expect(firstLine).toContain('date')
    expect(firstLine).toContain('amount')
    expect(firstLine).toContain('currency')
  })

  it('produces correct row count (header + n transactions)', () => {
    const csv = buildTransactionsCSV([TX, TX])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
  })

  it('empty transactions → only header', () => {
    const csv = buildTransactionsCSV([])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1)
  })

  it('escapes double-quotes inside values', () => {
    const txWithQuote: Transaction = { ...TX, note: 'dia bilang "halo"' }
    const csv = buildTransactionsCSV([txWithQuote])
    expect(csv).toContain('""halo""')
  })
})
