import type { Language } from '@/db/database'

const MILLION = 1_000_000
const THOUSAND = 1_000

function formatDecimal(val: number, decimalSep: string): string {
  const rounded = Math.round(val * 10) / 10
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(1).replace('.', decimalSep)
}

/** Compact label format for sankey node values — no currency symbol (space is tight). */
export function formatCompactCurrency(amount: number, currency: string, lang: Language): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const useIndonesianSuffix = lang === 'id' && currency === 'IDR'
  const millionSuffix = useIndonesianSuffix ? 'jt' : 'm'
  const thousandSuffix = useIndonesianSuffix ? 'rb' : 'k'
  const decimalSep = useIndonesianSuffix ? ',' : '.'

  if (abs >= MILLION) {
    return `${sign}${formatDecimal(abs / MILLION, decimalSep)}${millionSuffix}`
  }
  if (abs >= THOUSAND) {
    return `${sign}${Math.round(abs / THOUSAND)}${thousandSuffix}`
  }
  return `${sign}${Math.round(abs)}`
}
