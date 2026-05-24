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

export async function renameWallet(id: number, name: string): Promise<void> {
  await db.wallets.update(id, { name })
}

export async function deleteWallet(id: number): Promise<void> {
  await db.wallets.delete(id)
}

export async function setWalletBalance(id: number, newBalance: number): Promise<void> {
  await db.wallets.update(id, { balance: newBalance })
}

export async function hasCurrencyData(currency: string): Promise<boolean> {
  const [wallets, tagihan, goals] = await Promise.all([
    db.wallets.where('currency').equals(currency).count(),
    db.tagihan.where('currency').equals(currency).count(),
    db.goals.where('currency').equals(currency).count(),
  ])
  return wallets > 0 || tagihan > 0 || goals > 0
}
