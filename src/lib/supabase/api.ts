import { supabase } from './client'
import type { Tagihan } from '@/db/database'

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
