import { db } from './database'
import type { LicenseRecord } from './database'

export async function getLicense(): Promise<LicenseRecord | undefined> {
  return db.license.get(1)
}

export async function saveLicense(record: LicenseRecord): Promise<void> {
  await db.license.put(record)
}

export async function updateLastSeenAt(nowMs: number): Promise<void> {
  await db.license.update(1, { lastSeenAt: nowMs })
}
