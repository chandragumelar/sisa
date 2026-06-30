import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Transaction } from './database'

vi.mock('./database', () => ({
  db: {
    transactions: {
      where: vi.fn(),
    },
  },
}))

import { getPeriodFlows } from './transactions.repository'
import { db } from './database'

const NOW = new Date('2026-06-15T14:00:00').getTime()
const TODAY_START = new Date('2026-06-15T00:00:00').getTime()
const PERIOD_START = new Date('2026-06-01T00:00:00').getTime()

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    walletId: 1,
    amount: -50000,
    type: 'keluar',
    currency: 'IDR',
    date: TODAY_START + 3600_000, // 01:00 today
    isFromSavings: false,
    isEarmark: false,
    createdAt: TODAY_START,
    ...overrides,
  }
}

function mockDbReturn(txs: Transaction[]) {
  const toArray = vi.fn().mockResolvedValue(txs)
  const filter = vi.fn().mockReturnValue({ toArray })
  const between = vi.fn().mockReturnValue({ filter })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(db.transactions.where).mockReturnValue({ between } as any)
}

describe('getPeriodFlows — settlement tagihan exclusion from spentToday', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tagihan settlement (tagihanId set) counts in expense but NOT spentToday', async () => {
    const settlement = makeTx({ type: 'tagihan', amount: -200000, tagihanId: 5 })
    mockDbReturn([settlement])

    const { income, expense, spentToday } = await getPeriodFlows('IDR', PERIOD_START, NOW)

    expect(income).toBe(0)
    expect(expense).toBe(200000)
    expect(spentToday).toBe(0)
  })

  it('manual keluar (no tagihanId) counts in both expense and spentToday', async () => {
    const manual = makeTx({ type: 'keluar', amount: -75000 })
    mockDbReturn([manual])

    const { income, expense, spentToday } = await getPeriodFlows('IDR', PERIOD_START, NOW)

    expect(income).toBe(0)
    expect(expense).toBe(75000)
    expect(spentToday).toBe(75000)
  })

  it('mixed: spentToday only from manual keluar, expense includes both', async () => {
    const settlement = makeTx({ type: 'tagihan', amount: -200000, tagihanId: 5 })
    const manual = makeTx({ type: 'keluar', amount: -80000 })
    mockDbReturn([settlement, manual])

    const { income, expense, spentToday } = await getPeriodFlows('IDR', PERIOD_START, NOW)

    expect(income).toBe(0)
    expect(expense).toBe(280000)
    expect(spentToday).toBe(80000)
  })
})
