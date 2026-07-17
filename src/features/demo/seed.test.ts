import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, it, expect, beforeEach } from 'vitest'
import { applyMigrations } from '@/db/migrations'
import type { Transaction } from '@/db/database'
import { seedDemoDb, type SisaDb } from './seed'

function createTestDb(): SisaDb {
  const raw = new Dexie(`sisa-seed-test-${Math.random()}`)
  applyMigrations(raw)
  return raw as unknown as SisaDb
}

const EXPENSE_CATEGORY_NAMES = new Set([
  'Food',
  'Groceries',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Shopping',
  'Coffee',
  'Transfer',
  'Other',
])

describe('seedDemoDb', () => {
  let db: SisaDb

  beforeEach(() => {
    db = createTestDb()
  })

  it('marks onboarding as completed and sets the AU persona settings', async () => {
    await seedDemoDb(db)
    const settings = await db.settings.get(1)
    expect(settings?.onboardingCompleted).toBe(true)
    expect(settings?.language).toBe('en')
    expect(settings?.primaryCurrency).toBe('AUD')
    expect(settings?.fixedIncome).toBe(5_400)
  })

  it('seeds 5 wallets whose balance matches summed transactions (nabung earmark excluded)', async () => {
    await seedDemoDb(db)
    const wallets = await db.wallets.toArray()
    expect(wallets).toHaveLength(5)

    const txs = await db.transactions.toArray()
    for (const w of wallets) {
      const expected = txs
        .filter((t) => t.walletId === w.id && !t.isEarmark)
        .reduce((sum, t) => sum + t.amount, 0)
      expect(w.balance).toBeCloseTo(expected, 6)
    }
  })

  it('BCA and Wise settle to their intended approximate balances', async () => {
    await seedDemoDb(db)
    const wallets = await db.wallets.toArray()
    const bca = wallets.find((w) => w.name === 'BCA')
    const wise = wallets.find((w) => w.name === 'Wise USD')
    expect(bca?.balance).toBe(4_500_000)
    expect(wise?.balance).toBe(320)
  })

  it('seeds FX cache rates for AUD → IDR and AUD → USD', async () => {
    await seedDemoDb(db)
    const rates = await db.rates.toArray()
    const idr = rates.find((r) => r.base === 'AUD' && r.target === 'IDR')
    const usd = rates.find((r) => r.base === 'AUD' && r.target === 'USD')
    expect(idr?.rate).toBe(10_500)
    expect(usd?.rate).toBe(0.66)
  })

  it('seeds the English AU category set (not the Indonesian defaults)', async () => {
    await seedDemoDb(db)
    const categories = await db.categories.toArray()
    expect(categories.some((c) => c.name === 'Makanan')).toBe(false)
    expect(categories.some((c) => c.name === 'Food')).toBe(true)
    expect(categories.some((c) => c.name === 'Salary')).toBe(true)
  })

  it('seeds 6 active tagihan', async () => {
    await seedDemoDb(db)
    const tagihan = await db.tagihan.toArray()
    expect(tagihan).toHaveLength(6)
    expect(tagihan.every((t) => t.isActive)).toBe(true)
    expect(tagihan.some((t) => t.name === 'BPJS for parents' && t.currency === 'IDR')).toBe(true)
  })

  it('seeds coherent transactions: signs, tagihanId presence, expense categories', async () => {
    await seedDemoDb(db)
    const txs = await db.transactions.toArray()
    expect(txs.length).toBeGreaterThanOrEqual(30)

    for (const t of txs) {
      if (t.type === 'keluar') expect(t.amount).toBeLessThan(0)
      if (t.type === 'masuk') expect(t.amount).toBeGreaterThan(0)
      if (t.type === 'tagihan') {
        expect(t.amount).toBeLessThan(0)
        expect(t.tagihanId).toBeDefined()
      }
      if (t.type === 'keluar' && t.category) {
        expect(EXPENSE_CATEGORY_NAMES.has(t.category)).toBe(true)
      }
    }
  })

  it('every day from the 1st to today has at least one expense log', async () => {
    await seedDemoDb(db)
    const txs = await db.transactions.toArray()
    const now = new Date()
    const today = now.getDate()

    for (let day = 1; day <= today; day++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), day).getTime()
      const dayEnd = dayStart + 86_400_000
      const hasExpense = txs.some(
        (t) => t.type === 'keluar' && t.date >= dayStart && t.date < dayEnd,
      )
      expect(hasExpense).toBe(true)
    }
  })

  it("today's total spend is positive but well under a day's allocation", async () => {
    await seedDemoDb(db)
    const txs = await db.transactions.toArray()
    const allocation = await db.allocation.get(1)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = todayStart + 86_400_000

    const spentToday = txs
      .filter(
        (t) =>
          t.type === 'keluar' &&
          t.currency === 'AUD' &&
          t.tagihanId == null &&
          t.date >= todayStart &&
          t.date < todayEnd,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    expect(spentToday).toBeGreaterThan(0)
    expect(allocation).toBeDefined()
    expect(spentToday).toBeLessThan((allocation?.jatahHarian ?? 0) * 0.6)
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

  it('clears stale categories/allocation/scenarios/rates before a re-seed', async () => {
    // Simulate: demo seeded once, then "Delete all data" clears settings/wallets/tagihan/
    // transactions but NOT categories/allocation/savedScenarios/rates (clearAllData does
    // not touch those tables) — re-seeding in the same session must not duplicate them.
    await seedDemoDb(db)
    await Promise.all([
      db.transactions.clear(),
      db.wallets.clear(),
      db.tagihan.clear(),
      db.settings.clear(),
    ])

    await seedDemoDb(db)

    const categories = await db.categories.toArray()
    const foodCount = categories.filter((c) => c.name === 'Food').length
    expect(foodCount).toBe(1)

    const allocations = await db.allocation.toArray()
    expect(allocations).toHaveLength(1)

    const scenarios = await db.savedScenarios.toArray()
    expect(scenarios).toHaveLength(2)

    const rates = await db.rates.toArray()
    expect(rates).toHaveLength(2)
  })
})
