import { db } from './database'
import type { Transaction } from './database'

export async function getLastTransaction(currency: string): Promise<Transaction | undefined> {
  const all = await db.transactions.where('currency').equals(currency).sortBy('date')
  return all[all.length - 1]
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

export async function getTransactionCount(): Promise<number> {
  return db.transactions.count()
}

/**
 * Aggregate income and expense for a pay period [periodStartMs, nowMs].
 * Used as inputs for calcBudgetPeriode.
 *
 * income       = sum of masuk amounts in window
 * expense      = sum of abs(keluar + tagihan) amounts in window, excluding isFromSavings
 * spentToday   = daily spend subset: date >= today midnight, excludes tagihan settlements
 *                (tagihanId != null). Tagihan settlements are already accounted for in
 *                tagihanUnpaid — counting them in spentToday would double-penalise jatah harian.
 *                Manual keluar (no tagihanId) still counts toward spentToday.
 */
export async function getPeriodFlows(
  currency: string,
  periodStartMs: number,
  nowMs: number,
): Promise<{ income: number; expense: number; spentToday: number }> {
  const d = new Date(nowMs)
  const todayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const txs = await db.transactions
    .where('date')
    .between(periodStartMs, nowMs, true, true)
    .filter((t) => t.currency === currency && !t.isEarmark)
    .toArray()

  const income = txs.filter((t) => t.type === 'masuk').reduce((s, t) => s + t.amount, 0)

  const isOperationalSpend = (t: (typeof txs)[number]) =>
    (t.type === 'keluar' || t.type === 'tagihan') && !t.isFromSavings

  const isDailySpend = (t: (typeof txs)[number]) => isOperationalSpend(t) && t.tagihanId == null

  const expense = txs.filter(isOperationalSpend).reduce((s, t) => s + Math.abs(t.amount), 0)

  const spentToday = txs
    .filter((t) => t.date >= todayStart && isDailySpend(t))
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  return { income, expense, spentToday }
}

export async function getMonthlyFlows(
  currency: string,
  monthStartMs: number,
  monthEndMs: number,
): Promise<{ income: number; expense: number }> {
  const txs = await db.transactions
    .where('date')
    .between(monthStartMs, monthEndMs, true, false)
    .filter((t) => t.currency === currency && !t.isEarmark)
    .toArray()
  const income = txs.filter((t) => t.type === 'masuk').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === 'keluar').reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expense }
}

export async function getMonthlyFlowsByCurrency(
  monthStartMs: number,
  monthEndMs: number,
): Promise<{ income: Record<string, number>; expense: Record<string, number> }> {
  const txs = await db.transactions
    .where('date')
    .between(monthStartMs, monthEndMs, true, false)
    .filter((t) => !t.isEarmark)
    .toArray()

  const income: Record<string, number> = {}
  const expense: Record<string, number> = {}

  for (const t of txs) {
    if (t.type === 'masuk') {
      income[t.currency] = (income[t.currency] ?? 0) + t.amount
    } else if (t.type === 'keluar') {
      expense[t.currency] = (expense[t.currency] ?? 0) + Math.abs(t.amount)
    }
  }

  return { income, expense }
}
