import { db } from './database'
import type { Settings } from './database'

export async function getSettings(): Promise<Settings | undefined> {
  return db.settings.get(1)
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put(settings)
}

export async function patchSettings(partial: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.settings.update(1, partial)
}
