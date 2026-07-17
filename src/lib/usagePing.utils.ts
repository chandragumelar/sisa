import {
  TX_BUCKET_SMALL_MAX,
  TX_BUCKET_MEDIUM_MAX,
  TX_BUCKET_LARGE_MAX,
} from '@/constants/usagePing'

export type TxCountBucket = '0' | '1-10' | '11-50' | '51-200' | '200+'

export function bucketTxCount(count: number): TxCountBucket {
  if (count === 0) return '0'
  if (count <= TX_BUCKET_SMALL_MAX) return '1-10'
  if (count <= TX_BUCKET_MEDIUM_MAX) return '11-50'
  if (count <= TX_BUCKET_LARGE_MAX) return '51-200'
  return '200+'
}

export type UsagePingPlatform = 'android' | 'ios' | 'desktop' | 'other'

export function detectPlatform(userAgent: string): UsagePingPlatform {
  const ua = userAgent.toLowerCase()
  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/windows|macintosh|linux/.test(ua) && !/mobi/.test(ua)) return 'desktop'
  return 'other'
}

/** YYYY-MM-DD in local timezone (not UTC — Date#toISOString would shift the day). */
export function toLocalDateStr(nowMs: number): string {
  const d = new Date(nowMs)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
