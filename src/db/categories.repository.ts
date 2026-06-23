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

/** Ensures defaults exist — called on app init if categories table is empty. */
export async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  const count = await db.categories.count()
  if (count > 0) return
  const seed = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
  await db.categories.bulkAdd(seed)
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
