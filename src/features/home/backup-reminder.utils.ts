/**
 * Escalating backup reminder logic.
 *
 * Cadence (days since last export):
 *   0–29  → silent
 *   30–44 → card shown (dismissible → snooze to day 45)
 *   45–59 → card shown again (dismissible → snooze to day 60)
 *   60–74 → card shown, interval tightens to 10-day snooze
 *   75+   → card shown every 10 days thereafter
 *
 * lastDismissedAt is stored separately so we can snooze without changing lastExportedAt.
 */

export function shouldShowBackupReminder(
  lastExportedAt: number | null,
  lastDismissedAt: number | null,
  nowMs: number,
): boolean {
  if (lastExportedAt === null) return false

  const daysSinceExport = Math.floor((nowMs - lastExportedAt) / 86_400_000)
  if (daysSinceExport < 30) return false

  if (lastDismissedAt === null) return true

  const daysSinceDismiss = Math.floor((nowMs - lastDismissedAt) / 86_400_000)
  const snoozeInterval = daysSinceExport >= 60 ? 10 : 15
  return daysSinceDismiss >= snoozeInterval
}

export function calcBackupUrgency(lastExportedAt: number | null, nowMs: number): 'normal' | 'high' {
  if (lastExportedAt === null) return 'normal'
  const daysSinceExport = Math.floor((nowMs - lastExportedAt) / 86_400_000)
  return daysSinceExport >= 60 ? 'high' : 'normal'
}
