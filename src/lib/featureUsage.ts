import { FEATURES_USED_STORAGE_KEY } from '@/constants/usagePing'
import type { FeatureUsed } from '@/constants/usagePing'

/** Record that a feature was used at least once, for the anonymous usage ping. */
export function markFeatureUsed(feature: FeatureUsed): void {
  try {
    const raw = localStorage.getItem(FEATURES_USED_STORAGE_KEY)
    const used: string[] = raw ? JSON.parse(raw) : []
    if (used.includes(feature)) return
    used.push(feature)
    localStorage.setItem(FEATURES_USED_STORAGE_KEY, JSON.stringify(used))
  } catch {
    // localStorage unavailable (private mode / quota) — tracking is best-effort, never throw
  }
}

export function getUsedFeatures(): string[] {
  try {
    const raw = localStorage.getItem(FEATURES_USED_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // corrupted or unavailable storage — report no tracked features rather than throwing
    return []
  }
}
