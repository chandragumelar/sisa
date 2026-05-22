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

export async function addTransactionAndUpdateBalance(tx: Omit<Transaction, 'id'>): Promise<number> {
  let txId = 0
  await db.transaction('rw', [db.transactions, db.wallets], async () => {
    const id = await db.transactions.add(tx)
    txId = id as number

    const wallet = await db.wallets.get(tx.walletId)
    if (!wallet) throw new Error('Wallet tidak ditemukan')

    const balanceDelta = tx.isEarmark ? 0 : tx.amount
    await db.wallets.update(tx.walletId, { balance: wallet.balance + balanceDelta })
  })
  return txId
}

export async function deleteTransactionAndRevertBalance(txId: number): Promise<void> {
  await db.transaction('rw', [db.transactions, db.wallets], async () => {
    const tx = await db.transactions.get(txId)
    if (!tx) return

    await db.transactions.delete(txId)

    const wallet = await db.wallets.get(tx.walletId)
    if (!wallet) return

    const balanceDelta = tx.isEarmark ? 0 : tx.amount
    await db.wallets.update(tx.walletId, { balance: wallet.balance - balanceDelta })
  })
}

export async function getRecentTransactions(limit = 100): Promise<Transaction[]> {
  return db.transactions.orderBy('date').reverse().limit(limit).toArray()
}
