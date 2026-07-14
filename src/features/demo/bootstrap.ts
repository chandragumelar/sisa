import { db } from '@/db/database'
import { seedDemoDb } from './seed'

export async function bootstrapDemo(): Promise<void> {
  await seedDemoDb(db)
}
