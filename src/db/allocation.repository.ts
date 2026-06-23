import { db } from './database'
import type { Allocation } from './database'

export async function getAllocation(): Promise<Allocation | null> {
  return (await db.allocation.get(1)) ?? null
}

export async function putAllocation(a: Allocation): Promise<void> {
  await db.allocation.put(a)
}

export async function patchAllocation(patch: Partial<Omit<Allocation, 'id'>>): Promise<void> {
  const existing = await getAllocation()
  if (!existing) return
  await db.allocation.put({ ...existing, ...patch, id: 1 })
}
