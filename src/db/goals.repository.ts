import { db } from './database'
import type { Goal } from './database'

export async function getAllGoals(): Promise<Goal[]> {
  return db.goals.orderBy('order').toArray()
}

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<void> {
  await db.goals.add(goal)
}

export async function updateGoalsOrder(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.goals, async () => {
    await Promise.all(orderedIds.map((id, index) => db.goals.update(id, { order: index })))
  })
}
