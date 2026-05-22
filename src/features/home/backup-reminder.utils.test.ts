import { describe, it, expect } from 'vitest'
import { shouldShowBackupReminder, calcBackupUrgency } from './backup-reminder.utils'

const DAY = 86_400_000
const NOW = 1_716_000_000_000

describe('shouldShowBackupReminder', () => {
  it('returns false when never exported', () => {
    expect(shouldShowBackupReminder(null, null, NOW)).toBe(false)
  })

  it('returns false before 30 days', () => {
    expect(shouldShowBackupReminder(NOW - 29 * DAY, null, NOW)).toBe(false)
  })

  it('returns true at day 30 with no dismiss', () => {
    expect(shouldShowBackupReminder(NOW - 30 * DAY, null, NOW)).toBe(true)
  })

  it('returns false if dismissed recently (< 15 days ago)', () => {
    const dismissed = NOW - 10 * DAY
    expect(shouldShowBackupReminder(NOW - 35 * DAY, dismissed, NOW)).toBe(false)
  })

  it('returns true after 15-day snooze when under 60 days', () => {
    const dismissed = NOW - 15 * DAY
    expect(shouldShowBackupReminder(NOW - 45 * DAY, dismissed, NOW)).toBe(true)
  })

  it('uses 10-day snooze after 60 days since export', () => {
    const dismissed = NOW - 9 * DAY
    expect(shouldShowBackupReminder(NOW - 65 * DAY, dismissed, NOW)).toBe(false)
    const dismissed2 = NOW - 10 * DAY
    expect(shouldShowBackupReminder(NOW - 65 * DAY, dismissed2, NOW)).toBe(true)
  })
})

describe('calcBackupUrgency', () => {
  it('returns normal when no export', () => {
    expect(calcBackupUrgency(null, NOW)).toBe('normal')
  })

  it('returns normal before 60 days', () => {
    expect(calcBackupUrgency(NOW - 59 * DAY, NOW)).toBe('normal')
  })

  it('returns high at 60+ days', () => {
    expect(calcBackupUrgency(NOW - 60 * DAY, NOW)).toBe('high')
  })
})
