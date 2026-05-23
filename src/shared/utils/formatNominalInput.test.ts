import { describe, it, expect } from 'vitest'
import { formatNominalDisplay, parseNominalRaw } from './formatNominalInput'

describe('formatNominalDisplay', () => {
  it('formats millions with dots', () => {
    expect(formatNominalDisplay('2000000')).toBe('2.000.000')
  })
  it('formats thousands', () => {
    expect(formatNominalDisplay('50000')).toBe('50.000')
  })
  it('single digit', () => {
    expect(formatNominalDisplay('5')).toBe('5')
  })
  it('empty string → empty', () => {
    expect(formatNominalDisplay('')).toBe('')
  })
  it('non-numeric string → empty', () => {
    expect(formatNominalDisplay('abc')).toBe('')
  })
  it('zero → "0"', () => {
    expect(formatNominalDisplay('0')).toBe('0')
  })
  it('strips existing dots before formatting', () => {
    expect(formatNominalDisplay('2.000.000')).toBe('2.000.000')
  })
})

describe('parseNominalRaw', () => {
  it('strips dots from formatted value', () => {
    expect(parseNominalRaw('2.000.000')).toBe('2000000')
  })
  it('passthrough for unformatted digits', () => {
    expect(parseNominalRaw('50000')).toBe('50000')
  })
  it('empty string → empty', () => {
    expect(parseNominalRaw('')).toBe('')
  })
  it('strips non-digit chars', () => {
    expect(parseNominalRaw('Rp 1.000')).toBe('1000')
  })
})
