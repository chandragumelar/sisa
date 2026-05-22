import { describe, it, expect } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formats IDR with id-ID locale', () => {
    const result = formatCurrency(500000, 'IDR')
    expect(result).toContain('500')
    expect(result.toLowerCase()).toContain('rp')
  })

  it('formats zero as a valid string', () => {
    const result = formatCurrency(0, 'IDR')
    expect(result).toBeTruthy()
    expect(result).toContain('0')
  })

  it('formats USD and returns a non-empty string', () => {
    const result = formatCurrency(1234.5, 'USD')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('falls back gracefully for unknown currency codes', () => {
    const result = formatCurrency(100, 'XYZ')
    expect(result).toBeTruthy()
    expect(result).toContain('100')
  })

  it('handles large amounts', () => {
    const result = formatCurrency(10_000_000, 'IDR')
    expect(result).toContain('10')
    expect(result).toBeTruthy()
  })
})
