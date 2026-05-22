import { db, SCHEMA_VERSION } from './database'
import type { BackupData } from './database'

export async function exportAllData(nowMs: number): Promise<BackupData> {
  const [settings, wallets, tagihan, goals, transactions] = await Promise.all([
    db.settings.get(1),
    db.wallets.toArray(),
    db.tagihan.toArray(),
    db.goals.toArray(),
    db.transactions.toArray(),
  ])
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowMs,
    settings: settings!,
    wallets,
    tagihan,
    goals,
    transactions,
  }
}

export async function importAllData(data: BackupData): Promise<void> {
  await db.transaction(
    'rw',
    [db.transactions, db.wallets, db.tagihan, db.goals, db.settings],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.wallets.clear(),
        db.tagihan.clear(),
        db.goals.clear(),
        db.settings.clear(),
      ])
      await db.settings.put(data.settings)
      if (data.wallets.length) await db.wallets.bulkPut(data.wallets)
      if (data.tagihan.length) await db.tagihan.bulkPut(data.tagihan)
      if (data.goals.length) await db.goals.bulkPut(data.goals)
      if (data.transactions.length) await db.transactions.bulkPut(data.transactions)
    },
  )
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.transactions, db.wallets, db.tagihan, db.goals, db.settings],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.wallets.clear(),
        db.tagihan.clear(),
        db.goals.clear(),
        db.settings.clear(),
      ])
    },
  )
}
