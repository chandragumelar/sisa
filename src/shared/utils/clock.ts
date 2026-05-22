import type { Clock } from '@/shared/types/clock'

// The only place in the codebase allowed to call Date.now() / new Date().
// All business logic receives a Clock via useClock() or function parameter.
export const SystemClock: Clock = {
  now: () => Date.now(),
  today: () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  },
}

/**
 * Deterministic clock for testing.
 * Accepts a Date object or epoch ms to pin the current time.
 *
 * Usage in tests:
 *   const clock = new FixedClock(new Date('2026-05-22T10:00:00'))
 *   const clock = new FixedClock(1748000000000)
 */
export class FixedClock implements Clock {
  private readonly timestamp: number

  constructor(fixed: Date | number) {
    this.timestamp = fixed instanceof Date ? fixed.getTime() : fixed
  }

  now(): number {
    return this.timestamp
  }

  today(): Date {
    const d = new Date(this.timestamp)
    d.setHours(0, 0, 0, 0)
    return d
  }
}
