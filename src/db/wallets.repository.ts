import { db } from './database'
import type { Wallet } from './database'

export async function addWallet(wallet: Omit<Wallet, 'id'>): Promise<void> {
  await db.wallets.add(wallet)
}

export async function getAllWallets(): Promise<Wallet[]> {
  return db.wallets.orderBy('order').toArray()
}

export async function updateWalletBalance(id: number, delta: number): Promise<void> {
  await db.transaction('rw', db.wallets, async () => {
    const wallet = await db.wallets.get(id)
    if (!wallet) return
    await db.wallets.update(id, { balance: wallet.balance + delta })
  })
}

export async function getWallet(id: number): Promise<Wallet | undefined> {
  return db.wallets.get(id)
}
