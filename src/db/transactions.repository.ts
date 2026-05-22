import { db } from './database'
import type { Transaction } from './database'

export async function getLastTransaction(): Promise<Transaction | undefined> {
  const all = await db.transactions.orderBy('date').reverse().limit(1).toArray()
  return all[0]
}

export async function getTransactionsByDateRange(
  fromMs: number,
  toMs: number,
): Promise<Transaction[]> {
  return db.transactions.where('date').between(fromMs, toMs, true, false).toArray()
}

export async function getTotalNabung(currency: string): Promise<number> {
  const rows = await db.transactions
    .where('currency')
    .equals(currency)
    .filter((t) => t.type === 'nabung')
    .toArray()
  return rows.reduce((sum, t) => sum + t.amount, 0)
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<void> {
  await db.transactions.add(tx)
}
