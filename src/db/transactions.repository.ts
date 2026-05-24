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

export async function addNabungDeduction(
  amount: number,
  currency: string,
  walletId: number,
  nowMs: number,
): Promise<void> {
  if (amount <= 0) return
  await db.transactions.add({
    walletId,
    amount: -amount,
    type: 'nabung',
    currency,
    label: 'koreksi goal',
    date: nowMs,
    isFromSavings: false,
    isEarmark: true,
    createdAt: nowMs,
  })
}

export async function replaceTransaction(
  txId: number,
  newTx: Omit<Transaction, 'id'>,
): Promise<number> {
  let newId = 0
  await db.transaction('rw', [db.transactions, db.wallets], async () => {
    const old = await db.transactions.get(txId)
    if (!old) throw new Error('Transaksi tidak ditemukan')

    const oldWallet = await db.wallets.get(old.walletId)
    if (oldWallet) {
      const oldDelta = old.isEarmark ? 0 : old.amount
      await db.wallets.update(old.walletId, { balance: oldWallet.balance - oldDelta })
    }

    await db.transactions.delete(txId)

    const id = await db.transactions.add(newTx)
    newId = id as number

    const newWallet = await db.wallets.get(newTx.walletId)
    if (!newWallet) throw new Error('Wallet tidak ditemukan')
    const newDelta = newTx.isEarmark ? 0 : newTx.amount
    await db.wallets.update(newTx.walletId, { balance: newWallet.balance + newDelta })
  })
  return newId
}

export async function getRecentTransactions(limit = 100): Promise<Transaction[]> {
  return db.transactions.orderBy('date').reverse().limit(limit).toArray()
}

export async function getMonthlyIncomeSummary(currency: string, monthCount = 3): Promise<number> {
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - monthCount, 1).getTime()
  const rows = await db.transactions
    .where('date')
    .aboveOrEqual(cutoff)
    .filter((t) => t.type === 'masuk' && t.currency === currency)
    .toArray()
  if (rows.length === 0) return 0
  const total = rows.reduce((sum, t) => sum + t.amount, 0)
  return total / monthCount
}
