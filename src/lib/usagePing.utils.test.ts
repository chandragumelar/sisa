import { describe, it, expect } from 'vitest'
import { bucketTxCount, detectPlatform, toLocalDateStr } from './usagePing.utils'

describe('bucketTxCount', () => {
  it('happy: mid-range counts map to their bucket', () => {
    expect(bucketTxCount(5)).toBe('1-10')
    expect(bucketTxCount(30)).toBe('11-50')
    expect(bucketTxCount(100)).toBe('51-200')
    expect(bucketTxCount(500)).toBe('200+')
  })

  it('empty: zero transactions', () => {
    expect(bucketTxCount(0)).toBe('0')
  })

  it('boundary: exact bucket edges', () => {
    expect(bucketTxCount(10)).toBe('1-10')
    expect(bucketTxCount(11)).toBe('11-50')
    expect(bucketTxCount(50)).toBe('11-50')
    expect(bucketTxCount(51)).toBe('51-200')
    expect(bucketTxCount(200)).toBe('51-200')
    expect(bucketTxCount(201)).toBe('200+')
  })
})

describe('detectPlatform', () => {
  it('happy: recognizes android and ios user agents', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBe('android')
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios')
  })

  it('empty: blank user agent falls back to other', () => {
    expect(detectPlatform('')).toBe('other')
  })

  it('boundary: desktop OS string without mobile marker vs iPad (still ios)', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop')
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)')).toBe('desktop')
    expect(detectPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('ios')
  })
})

describe('toLocalDateStr', () => {
  it('happy: formats a mid-month date as YYYY-MM-DD', () => {
    expect(toLocalDateStr(new Date(2024, 5, 15, 10, 0, 0).getTime())).toBe('2024-06-15')
  })

  it('empty: midnight local time', () => {
    expect(toLocalDateStr(new Date(2024, 0, 1, 0, 0, 0).getTime())).toBe('2024-01-01')
  })

  it('boundary: last day of a leap February', () => {
    expect(toLocalDateStr(new Date(2024, 1, 29, 23, 59, 59).getTime())).toBe('2024-02-29')
  })
})
