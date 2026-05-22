import { db } from './database'
import type { Tagihan } from './database'

export async function getActiveTagihan(): Promise<Tagihan[]> {
  return db.tagihan.where('isActive').equals(1).sortBy('dueDay')
}

export async function addTagihan(tagihan: Omit<Tagihan, 'id'>): Promise<void> {
  await db.tagihan.add(tagihan)
}

export async function markTagihanPaid(id: number, paidAt: number, amount: number): Promise<void> {
  await db.tagihan.update(id, { lastPaidAt: paidAt, lastPaidAmount: amount })
}

export interface TagihanPaymentResult {
  txId: number
  prevBalance: number
  walletId: number
  amount: number
  tagihanId: number
}

export async function commitTagihanPayment(
  tagihanId: number,
  walletId: number,
  amount: number,
  currency: string,
  nowMs: number,
): Promise<TagihanPaymentResult> {
  let txId = 0
  let prevBalance = 0

  await db.transaction('rw', [db.transactions, db.wallets, db.tagihan], async () => {
    const wallet = await db.wallets.get(walletId)
    if (!wallet) throw new Error('Wallet tidak ditemukan')
    prevBalance = wallet.balance

    const id = await db.transactions.add({
      walletId,
      amount: -amount,
      type: 'tagihan',
      currency,
      tagihanId,
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    txId = id as number

    await db.wallets.update(walletId, { balance: wallet.balance - amount })
    await db.tagihan.update(tagihanId, { lastPaidAt: nowMs, lastPaidAmount: amount })
  })

  return { txId, prevBalance, walletId, amount, tagihanId }
}

export async function revertTagihanPayment(result: TagihanPaymentResult): Promise<void> {
  await db.transaction('rw', [db.transactions, db.wallets, db.tagihan], async () => {
    await db.transactions.delete(result.txId)
    await db.wallets.update(result.walletId, { balance: result.prevBalance })
    await db.tagihan.update(result.tagihanId, { lastPaidAt: null, lastPaidAmount: null })
  })
}
