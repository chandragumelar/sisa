import { db } from './database'
import type { SavedScenario } from './database'

export const MAX_SAVED_SCENARIOS = 10

export async function getSavedScenarios(): Promise<SavedScenario[]> {
  return db.savedScenarios.orderBy('savedAt').reverse().toArray()
}

export async function saveScenario(name: string, itemsJson: string): Promise<number> {
  const all = await getSavedScenarios()
  if (all.length >= MAX_SAVED_SCENARIOS) {
    const oldest = all[all.length - 1]
    if (oldest.id != null) await db.savedScenarios.delete(oldest.id)
  }
  return (await db.savedScenarios.add({
    name,
    items: itemsJson,
    savedAt: Date.now(),
  })) as number
}

export async function deleteScenario(id: number): Promise<void> {
  await db.savedScenarios.delete(id)
}
