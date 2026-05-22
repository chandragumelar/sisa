import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SystemClock, FixedClock } from './clock'

describe('FixedClock', () => {
  describe('now()', () => {
    it('returns the fixed epoch ms when constructed with a number', () => {
      const ts = 1748000000000
      const clock = new FixedClock(ts)
      expect(clock.now()).toBe(ts)
    })

    it('returns the correct epoch ms when constructed with a Date', () => {
      const date = new Date('2026-05-22T10:30:00')
      const clock = new FixedClock(date)
      expect(clock.now()).toBe(date.getTime())
    })

    it('returns the same value on repeated calls (deterministic)', () => {
      const clock = new FixedClock(1748000000000)
      expect(clock.now()).toBe(clock.now())
    })
  })

  describe('today()', () => {
    it('returns midnight of the fixed date (local time)', () => {
      const date = new Date('2026-05-22T14:59:59')
      const clock = new FixedClock(date)
      const today = clock.today()

      expect(today.getFullYear()).toBe(date.getFullYear())
      expect(today.getMonth()).toBe(date.getMonth())
      expect(today.getDate()).toBe(date.getDate())
      expect(today.getHours()).toBe(0)
      expect(today.getMinutes()).toBe(0)
      expect(today.getSeconds()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })

    it('handles midnight exactly — still returns same date at 00:00:00.000', () => {
      const date = new Date('2026-05-22T00:00:00.000')
      const clock = new FixedClock(date)
      const today = clock.today()

      expect(today.getHours()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })

    it('handles end of day — does not bleed into next day', () => {
      const date = new Date('2026-05-22T23:59:59.999')
      const clock = new FixedClock(date)
      const today = clock.today()

      expect(today.getDate()).toBe(22)
      expect(today.getHours()).toBe(0)
    })
  })
})

describe('SystemClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('now() returns current epoch ms', () => {
    const fixed = 1748000000000
    vi.setSystemTime(fixed)
    expect(SystemClock.now()).toBe(fixed)
  })

  it('today() returns midnight of today in local time', () => {
    vi.setSystemTime(new Date('2026-05-22T15:30:00'))
    const today = SystemClock.today()

    expect(today.getHours()).toBe(0)
    expect(today.getMinutes()).toBe(0)
    expect(today.getSeconds()).toBe(0)
    expect(today.getMilliseconds()).toBe(0)
  })
})
