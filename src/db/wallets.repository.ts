import { db } from './database'
import type { Wallet } from './database'

export async function addWallet(wallet: Omit<Wallet, 'id'>): Promise<number> {
  return db.wallets.add(wallet)
}

export async function getAllWallets(): Promise<Wallet[]> {
  return db.wallets.orderBy('order').toArray()
}
