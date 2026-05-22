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
