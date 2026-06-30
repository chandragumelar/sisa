import type Dexie from 'dexie'
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  FALLBACK_CATEGORY,
} from '@/features/category/category.types'

/**
 * Apply all Dexie schema versions to the database instance.
 * Each version() call defines the schema for that version.
 * Upgrade callbacks (v2+) run only when an older DB is opened.
 *
 * Rules:
 *   - Never modify a past version's stores() string in-place.
 *   - Each new version must be additive or explicitly migrate data in upgrade().
 *   - Upgrade functions must be idempotent and non-destructive.
 */

/**
 * Compute the fields added in v3 from a legacy tagihan record.
 * Exported for unit testing — called inside the Dexie upgrade callback.
 *
 * anchorDate uses dueDay (the user's chosen due date) as the day component,
 * and createdAt's month/year as the month component. This gives a deterministic
 * cycle reference tied to the real due date, not the arbitrary creation timestamp.
 * Note: dueDay 29/30/31 is NOT clamped here — JS Date overflow is intentional
 * and consistent with how calcNextDueDate handles short months.
 */
export function buildV3MigrationPatch(record: {
  recurrenceType: string
  dueDay: number
  createdAt: number
}): { frequency: string; anchorDate: number } {
  const frequency = record.recurrenceType === 'sekali' ? 'sekali' : 'bulanan'
  const created = new Date(record.createdAt)
  const anchorDate = new Date(created.getFullYear(), created.getMonth(), record.dueDay).getTime()
  return { frequency, anchorDate }
}

/**
 * Backfill weekendBehavior for v12: null and 'tidak-konsisten' → 'tetap'.
 * Exported for unit testing — called inside the Dexie upgrade callback.
 */
export function applyV12WeekendBehaviorFix(row: Record<string, unknown>): void {
  if (row.weekendBehavior == null || row.weekendBehavior === 'tidak-konsisten') {
    row.weekendBehavior = 'tetap'
  }
}

export function applyMigrations(db: Dexie): void {
  // v1 — initial schema. No upgrade callback (nothing to migrate from).
  db.version(1).stores({
    // Indexed fields listed after primary key are secondary indexes.
    // Only index fields used in .where() / .orderBy() queries.
    transactions: '++id, walletId, date, type, currency',
    wallets: '++id, currency, order',
    tagihan: '++id, currency, recurrenceType, isActive',
    goals: '++id, currency, order',
    settings: 'id', // singleton (always id=1), no auto-increment
    license: 'id', // singleton (always id=1), no auto-increment
    meta: 'key', // string primary key (e.g. 'schemaVersion', 'installId')
  })

  // v2: savedScenarios table for Andai saved scenarios
  db.version(2).stores({
    transactions: '++id, walletId, date, type, currency',
    wallets: '++id, currency, order',
    tagihan: '++id, currency, recurrenceType, isActive',
    goals: '++id, currency, order',
    settings: 'id',
    license: 'id',
    meta: 'key',
    savedScenarios: '++id, savedAt',
  })

  // v3: tagihan gains frequency + anchorDate; recurrenceType kept (additive only).
  // Upgrade maps legacy recurrenceType → frequency and derives anchorDate from dueDay + createdAt.
  db.version(3)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
    })
    .upgrade((tx) => {
      return tx
        .table('tagihan')
        .toCollection()
        .modify((row) => {
          if (row.frequency == null) {
            const patch = buildV3MigrationPatch({
              recurrenceType: row.recurrenceType ?? 'rutin',
              dueDay: row.dueDay,
              createdAt: row.createdAt,
            })
            row.frequency = patch.frequency
            row.anchorDate = patch.anchorDate
          }
        })
    })

  // v4: settings gains incomeFrequency + incomeAnchorDate.
  // Upgrade sets defaults for existing users: 'bulanan' + null (preserves old monthly behavior).
  db.version(4)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
    })
    .upgrade((tx) => {
      return tx
        .table('settings')
        .toCollection()
        .modify((row) => {
          if (row.incomeFrequency == null) {
            row.incomeFrequency = 'bulanan'
            row.incomeAnchorDate = null
          }
        })
    })

  // v5: settings gains lastPaydayConfirmed, avgIncome, avgIncomeBasis.
  db.version(5)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
    })
    .upgrade((tx) => {
      return tx
        .table('settings')
        .toCollection()
        .modify((row) => {
          if (row.lastPaydayConfirmed === undefined) row.lastPaydayConfirmed = null
          if (row.avgIncome === undefined) row.avgIncome = null
          if (row.avgIncomeBasis === undefined) row.avgIncomeBasis = null
        })
    })

  // v6: settings gains fixedIncome (tetap/mix nominal salary per period).
  db.version(6)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
    })
    .upgrade((tx) => {
      return tx
        .table('settings')
        .toCollection()
        .modify((row) => {
          if (row.fixedIncome === undefined) row.fixedIncome = null
        })
    })

  // v7: categories table + transaction.category field.
  // Seeded with defaults on first open; existing transactions default to 'Lainnya'.
  db.version(7)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
      categories: '++id, type',
    })
    .upgrade(async (tx) => {
      // Set category on all existing transactions that lack it
      await tx
        .table('transactions')
        .toCollection()
        .modify((row) => {
          if (row.category === undefined) row.category = FALLBACK_CATEGORY
        })

      // Seed default categories (only if table is empty to support re-runs)
      const count = await tx.table('categories').count()
      if (count === 0) {
        const seed = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
        await tx.table('categories').bulkAdd(seed)
      }
    })

  // v8: settings gains operasionalBudget, periodEndDate, jatahHarianLocked (alokasi model).
  // Existing users get null → income-based fallback path stays active.
  db.version(8)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
      categories: '++id, type',
    })
    .upgrade((tx) => {
      return tx
        .table('settings')
        .toCollection()
        .modify((row) => {
          if (row.operasionalBudget === undefined) row.operasionalBudget = null
          if (row.periodEndDate === undefined) row.periodEndDate = null
          if (row.jatahHarianLocked === undefined) row.jatahHarianLocked = null
        })
    })

  // v9: allocation table replaces settings.operasionalBudget/periodEndDate/jatahHarianLocked.
  // No upgrade callback needed — allocation table starts empty;
  // existing users without allocation fall back to income-based path.
  db.version(9).stores({
    transactions: '++id, walletId, date, type, currency',
    wallets: '++id, currency, order',
    tagihan: '++id, currency, isActive',
    goals: '++id, currency, order',
    settings: 'id',
    license: 'id',
    meta: 'key',
    savedScenarios: '++id, savedAt',
    categories: '++id, type',
    allocation: 'id',
  })

  // v10: add rates table (FX cache) + remove secondaryCurrency/activeCurrencyMode from settings.
  db.version(10)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
      categories: '++id, type',
      allocation: 'id',
      rates: '[base+target], base',
    })
    .upgrade((tx) => {
      return tx
        .table('settings')
        .toCollection()
        .modify((row) => {
          delete row.secondaryCurrency
          delete row.activeCurrencyMode
        })
    })

  // v11: allocation gains buatDipakai (original operasional before division).
  // Backfill existing rows: best approximation is jatahHarian * daysAtLock.
  // No retroactive correction — small rounding delta preserved as-is; fix takes
  // effect from next lock event onward.
  db.version(11)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
      categories: '++id, type',
      allocation: 'id',
      rates: '[base+target], base',
    })
    .upgrade((tx) => {
      return tx
        .table('allocation')
        .toCollection()
        .modify((row) => {
          if (row.buatDipakai == null) {
            row.buatDipakai = row.jatahHarian * row.daysAtLock
          }
        })
    })

  db.version(12)
    .stores({
      transactions: '++id, walletId, date, type, currency',
      wallets: '++id, currency, order',
      tagihan: '++id, currency, isActive',
      goals: '++id, currency, order',
      settings: 'id',
      license: 'id',
      meta: 'key',
      savedScenarios: '++id, savedAt',
      categories: '++id, type',
      allocation: 'id',
      rates: '[base+target], base',
    })
    .upgrade((tx) => {
      return tx.table('settings').toCollection().modify(applyV12WeekendBehaviorFix)
    })
}
