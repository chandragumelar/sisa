import type Dexie from 'dexie'

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

  // v2: savedScenarios table for Pro Andai feature
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
}
