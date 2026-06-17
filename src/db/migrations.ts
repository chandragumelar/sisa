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
}
