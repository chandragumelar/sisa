import { db } from './database'
import type { SnapshotData } from './database'
import { getLicense } from '@/db/license.repository'
import { serializeSnapshot } from './snapshot.serializer'
import { activateLicense } from '@/features/license/license.utils'
import type { Clock } from '@/shared/types/clock'

export async function collectSnapshot(nowMs: number): Promise<SnapshotData> {
  const [
    settings,
    wallets,
    tagihan,
    goals,
    transactions,
    allCategories,
    savedScenarios,
    licenseRecord,
  ] = await Promise.all([
    db.settings.get(1),
    db.wallets.toArray(),
    db.tagihan.toArray(),
    db.goals.toArray(),
    db.transactions.toArray(),
    db.categories.toArray(),
    db.savedScenarios.toArray(),
    getLicense(),
  ])
  return serializeSnapshot({
    settings: settings!,
    wallets,
    tagihan,
    goals,
    transactions,
    allCategories,
    savedScenarios,
    licenseRawKey: licenseRecord?.rawKey ?? null,
    nowMs,
  })
}

export async function applySnapshot(data: SnapshotData, clock: Clock): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.transactions,
      db.wallets,
      db.tagihan,
      db.goals,
      db.settings,
      db.categories,
      db.savedScenarios,
    ],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.wallets.clear(),
        db.tagihan.clear(),
        db.goals.clear(),
        db.settings.clear(),
        db.savedScenarios.clear(),
      ])
      // Delete only custom categories — leave defaults for seedDefaultCategoriesIfEmpty
      const customIds = (await db.categories.toArray())
        .filter((c) => !c.isDefault)
        .map((c) => c.id!)
      if (customIds.length) await db.categories.bulkDelete(customIds)

      await db.settings.put(data.settings)
      if (data.wallets.length) await db.wallets.bulkPut(data.wallets)
      if (data.tagihan.length) await db.tagihan.bulkPut(data.tagihan)
      if (data.goals.length) await db.goals.bulkPut(data.goals)
      if (data.transactions.length) await db.transactions.bulkPut(data.transactions)
      if (data.customCategories.length) await db.categories.bulkAdd(data.customCategories)
      if (data.savedScenarios.length) await db.savedScenarios.bulkPut(data.savedScenarios)
    },
  )
  if (data.licenseRawKey) {
    await activateLicense(data.licenseRawKey, clock)
  }
}
