import { db } from './database'
import type { Goal } from './database'

export async function getAllGoals(): Promise<Goal[]> {
  return db.goals.orderBy('order').toArray()
}

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<void> {
  await db.goals.add(goal)
}
