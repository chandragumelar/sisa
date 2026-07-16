import { db } from './database'
import type { Category } from './database'
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  FALLBACK_CATEGORY,
} from '@/features/category/category.types'

export async function getCategoriesByType(type: 'expense' | 'income'): Promise<Category[]> {
  return db.categories.where('type').equals(type).sortBy('order')
}

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.orderBy('order').toArray()
}

let seedPromise: Promise<void> | null = null

/** Ensures defaults exist — called on app init if categories table is empty. */
export async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise
  seedPromise = runSeed()
  return seedPromise
}

async function runSeed(): Promise<void> {
  await db.transaction('rw', db.categories, async () => {
    const count = await db.categories.count()
    if (count > 0) return
    const seed = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
    await db.categories.bulkAdd(seed)
  })
  await dedupeCategories()
}

/** Self-heal: collapse duplicate (type, name) categories left over from past races, keep lowest id. */
export async function dedupeCategories(): Promise<void> {
  const all = await db.categories.toArray()
  const groups = new Map<string, Category[]>()
  for (const cat of all) {
    const key = `${cat.type}::${cat.name}`
    const group = groups.get(key) ?? []
    group.push(cat)
    groups.set(key, group)
  }

  const idsToDelete: number[] = []
  for (const group of groups.values()) {
    if (group.length <= 1) continue
    const sorted = [...group].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    for (const dup of sorted.slice(1)) {
      if (dup.id !== undefined) idsToDelete.push(dup.id)
    }
  }
  if (idsToDelete.length > 0) {
    await db.categories.bulkDelete(idsToDelete)
  }
}

export async function addCategory(
  category: Omit<Category, 'id' | 'isDefault' | 'order'>,
): Promise<void> {
  const existing = await getCategoriesByType(category.type)
  const order = existing.length
  await db.categories.add({ ...category, isDefault: false, order })
}

export async function updateCategory(
  id: number,
  patch: Partial<Pick<Category, 'name' | 'iconName'>>,
): Promise<void> {
  await db.categories.update(id, patch)
}

export async function deleteCategory(id: number): Promise<void> {
  const cat = await db.categories.get(id)
  if (!cat || cat.isDefault) return // never delete defaults; 'Lainnya' is always default

  await db.transaction('rw', [db.categories, db.transactions], async () => {
    // Fallback orphaned transactions to 'Lainnya'
    await db.transactions
      .where('type')
      .anyOf(cat.type === 'expense' ? ['keluar', 'tagihan'] : ['masuk'])
      .filter((tx) => tx.category === cat.name)
      .modify({ category: FALLBACK_CATEGORY })
    await db.categories.delete(id)
  })
}

export async function resolveCategoryName(
  name: string,
  type: 'expense' | 'income',
): Promise<string> {
  const cats = await getCategoriesByType(type)
  const exists = cats.some((c) => c.name === name)
  return exists ? name : FALLBACK_CATEGORY
}
