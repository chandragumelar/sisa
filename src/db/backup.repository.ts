import { db } from './database'

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

export async function localHasData(): Promise<boolean> {
  const [tx, w, t] = await Promise.all([
    db.transactions.count(),
    db.wallets.count(),
    db.tagihan.count(),
  ])
  return tx > 0 || w > 0 || t > 0
}
