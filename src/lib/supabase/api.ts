import { supabase } from './client'
import type { Tagihan } from '@/db/database'
import type { Clock } from '@/shared/types/clock'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getTransactionCount } from '@/db/transactions.repository'
import { determineLicenseStatus } from '@/features/license/license.utils'
import { getUsedFeatures } from '@/lib/featureUsage'
import { bucketTxCount, detectPlatform, toLocalDateStr } from '@/lib/usagePing.utils'
import { LAST_PING_STORAGE_KEY } from '@/constants/usagePing'

// ---------------------------------------------------------------
// Auth — anonymous session
// ---------------------------------------------------------------

/** Ensure device has an anonymous Supabase session. Call on app start. */
export async function ensureAnonymousSession(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) return session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) throw new Error(`Anonymous sign-in failed: ${error?.message}`)
  return data.user.id
}

/** Returns current anonymous_id (auth.uid()), or null if not signed in. */
export async function getAnonymousId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

// ---------------------------------------------------------------
// Tagihan reminder sync
// ---------------------------------------------------------------

/** Upsert one tagihan to server for reminder scheduling. No-op if no session or id missing. */
export async function syncTagihanReminder(tagihan: Tagihan): Promise<void> {
  const anonId = await getAnonymousId()
  if (!anonId || tagihan.id == null) return
  await supabase.from('tagihan_reminder').upsert({
    anonymous_id: anonId,
    tagihan_local_id: tagihan.id,
    name: tagihan.name,
    due_day: tagihan.dueDay,
    frequency: tagihan.frequency,
    anchor_date: tagihan.anchorDate,
    last_paid_at: tagihan.lastPaidAt,
    is_active: tagihan.isActive,
    updated_at: new Date().toISOString(),
  })
}

/** Delete reminder when tagihan is deleted locally. No-op if no session. */
export async function deleteTagihanReminder(localId: number): Promise<void> {
  const anonId = await getAnonymousId()
  if (!anonId) return
  await supabase
    .from('tagihan_reminder')
    .delete()
    .eq('anonymous_id', anonId)
    .eq('tagihan_local_id', localId)
}

// ---------------------------------------------------------------
// Anonymous usage ping
// ---------------------------------------------------------------

/**
 * Fire-and-forget anonymous daily usage ping — no PII, no financial data.
 * Guarded to run at most once per local calendar day. Never throws and
 * never blocks the UI; call from app start without awaiting.
 */
export async function sendUsagePing(clock: Clock): Promise<void> {
  try {
    const today = toLocalDateStr(clock.now())
    if (localStorage.getItem(LAST_PING_STORAGE_KEY) === today) return

    let anonId = await getAnonymousId()
    if (!anonId) anonId = await ensureAnonymousSession()

    const [settings, wallets, txCount, licenseStatus] = await Promise.all([
      getSettings(),
      getAllWallets(),
      getTransactionCount(),
      determineLicenseStatus(clock),
    ])

    const featuresUsed = new Set(getUsedFeatures())
    if (wallets.length > 1) featuresUsed.add('multi_wallet')

    await supabase.from('usage_ping').upsert({
      anonymous_id: anonId,
      day: today,
      app_version: null, // no build-exposed app version constant in this repo yet
      has_license: licenseStatus === 'active',
      is_demo: import.meta.env.VITE_DEMO === '1',
      locale: settings?.language ?? null,
      theme: settings?.theme ?? null,
      primary_currency: settings?.primaryCurrency ?? null,
      platform: detectPlatform(navigator.userAgent),
      tx_count_bucket: bucketTxCount(txCount),
      features_used: [...featuresUsed],
    })

    localStorage.setItem(LAST_PING_STORAGE_KEY, today)
  } catch {
    // Usage ping is best-effort telemetry — never surface failures to the user
  }
}
