import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, it, expect, beforeEach } from 'vitest'
import { applyMigrations } from '@/db/migrations'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/features/category/category.types'
import type { Transaction } from '@/db/database'
import { seedDemoDb, type SisaDb } from './seed'

function createTestDb(): SisaDb {
  const raw = new Dexie(`sisa-seed-test-${Math.random()}`)
  applyMigrations(raw)
  return raw as unknown as SisaDb
}

describe('seedDemoDb', () => {
  let db: SisaDb

  beforeEach(() => {
    db = createTestDb()
  })

  it('marks onboarding as completed', async () => {
    await seedDemoDb(db)
    const settings = await db.settings.get(1)
    expect(settings?.onboardingCompleted).toBe(true)
  })

  it('seeds 3 wallets whose balance matches summed transactions (nabung earmark excluded)', async () => {
    await seedDemoDb(db)
    const wallets = await db.wallets.toArray()
    expect(wallets).toHaveLength(3)

    const txs = await db.transactions.toArray()
    for (const w of wallets) {
      const expected = txs
        .filter((t) => t.walletId === w.id && !t.isEarmark)
        .reduce((sum, t) => sum + t.amount, 0)
      expect(w.balance).toBe(expected)
    }
  })

  it('seeds 5 active tagihan', async () => {
    await seedDemoDb(db)
    const tagihan = await db.tagihan.toArray()
    expect(tagihan).toHaveLength(5)
    expect(tagihan.every((t) => t.isActive)).toBe(true)
  })

  it('seeds coherent transactions: signs, tagihanId presence, expense categories', async () => {
    await seedDemoDb(db)
    const txs = await db.transactions.toArray()
    expect(txs.length).toBeGreaterThanOrEqual(30)

    const expenseNames = new Set(DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name))
    for (const t of txs) {
      if (t.type === 'keluar') expect(t.amount).toBeLessThan(0)
      if (t.type === 'masuk') expect(t.amount).toBeGreaterThan(0)
      if (t.type === 'tagihan') {
        expect(t.amount).toBeLessThan(0)
        expect(t.tagihanId).toBeDefined()
      }
      if ((t.type === 'keluar' || t.type === 'tagihan') && t.category) {
        expect(expenseNames.has(t.category)).toBe(true)
      }
    }
  })

  it('transfer legs are paired 2x per transferPairId and net to zero', async () => {
    await seedDemoDb(db)
    const txs = await db.transactions.toArray()

    const byPair = new Map<string, Transaction[]>()
    for (const t of txs) {
      if (!t.transferPairId) continue
      const list = byPair.get(t.transferPairId) ?? []
      list.push(t)
      byPair.set(t.transferPairId, list)
    }

    expect(byPair.size).toBeGreaterThan(0)
    for (const legs of byPair.values()) {
      expect(legs).toHaveLength(2)
      expect(legs.reduce((sum, t) => sum + t.amount, 0)).toBe(0)
    }
  })

  it('is idempotent — calling twice does not duplicate rows', async () => {
    await seedDemoDb(db)
    const before = await db.transactions.count()

    await seedDemoDb(db)
    const after = await db.transactions.count()

    expect(after).toBe(before)
  })
})
