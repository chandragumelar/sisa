// ============================================================
// Supabase API contract for SISA Shared Profile
// All functions return typed results; never throw — callers
// check result.ok or result.error.
// ============================================================

import { supabase } from './client'
import type {
  CreateProfileResult,
  ValidateJoinCodeResult,
  RedeemJoinCodeResult,
  RecoverProfileResult,
  Profile,
  ProfileMember,
  JoinCode,
  ProfileWallet,
  ProfileTagihan,
  ProfileGoal,
  ProfileTransaction,
  ProfileSettings,
  RecordMeta,
} from './types'

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
// Recovery code helpers (browser-only, uses crypto.subtle)
// ---------------------------------------------------------------

const RECOVERY_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/** Generate a human-readable recovery code, e.g. "SISA-7X4K-2M9R-NP3V". */
export function generateRecoveryCode(): string {
  const segments = Array.from({ length: 4 }, () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => RECOVERY_CHARSET[b % RECOVERY_CHARSET.length])
      .join(''),
  )
  return `SISA-${segments.join('-')}`
}

/** Compute hex(sha256(rawCode)). Client sends only the hash to the server. */
export async function hashRecoveryCode(rawCode: string): Promise<string> {
  const data = new TextEncoder().encode(rawCode)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------------------------------------------------------------
// Join code helpers
// ---------------------------------------------------------------

const JOIN_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const JOIN_CODE_TTL_MS = 30 * 60 * 1000 // 30 minutes

/** Generate a join code suffix, e.g. "7X4K". 4 chars from unambiguous charset. */
export function generateJoinCodeSuffix(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => JOIN_CHARSET[b % JOIN_CHARSET.length])
    .join('')
}

// ---------------------------------------------------------------
// Profile RPCs
// ---------------------------------------------------------------

/**
 * Create a new shared profile for this device (becomes primary member).
 * Pass the raw recovery code — this function hashes it before sending.
 */
export async function createProfile(
  name: string,
  displayName: string,
  rawRecoveryCode: string,
): Promise<CreateProfileResult> {
  const codeHash = await hashRecoveryCode(rawRecoveryCode)
  const { data, error } = await supabase.rpc('create_profile', {
    p_name: name,
    p_display_name: displayName,
    p_recovery_code_hash: codeHash,
  })
  if (error) return { ok: undefined, error: 'ALREADY_IN_PROFILE' }
  return data as CreateProfileResult
}

/** Validate a join code and return profile preview (name). Does NOT join. */
export async function validateJoinCode(code: string): Promise<ValidateJoinCodeResult> {
  const { data, error } = await supabase.rpc('validate_join_code', { p_code: code })
  if (error) return { ok: undefined, error: 'CODE_NOT_FOUND' }
  return data as ValidateJoinCodeResult
}

/** Redeem a join code — links this device to the target profile. */
export async function redeemJoinCode(
  code: string,
  displayName: string,
): Promise<RedeemJoinCodeResult> {
  const { data, error } = await supabase.rpc('redeem_join_code', {
    p_code: code,
    p_display_name: displayName,
  })
  if (error) return { ok: undefined, error: 'CODE_NOT_FOUND' }
  return data as RedeemJoinCodeResult
}

/**
 * Recover profile on a new device using raw recovery code.
 * Pass the raw code — this function hashes it before sending.
 */
export async function recoverProfile(
  rawRecoveryCode: string,
  displayName: string,
): Promise<RecoverProfileResult> {
  const codeHash = await hashRecoveryCode(rawRecoveryCode)
  const { data, error } = await supabase.rpc('recover_profile', {
    p_code_hash: codeHash,
    p_display_name: displayName,
  })
  if (error) return { ok: undefined, error: 'RECOVERY_CODE_INVALID' }
  return data as RecoverProfileResult
}

// ---------------------------------------------------------------
// Join code management
// ---------------------------------------------------------------

/**
 * Create a new join code for the given profile.
 * Returns the created JoinCode row.
 */
export async function createJoinCode(
  profileId: string,
  anonymousId: string,
  options: { ttlMs?: number; isSingleUse?: boolean } = {},
): Promise<JoinCode | null> {
  const { ttlMs = JOIN_CODE_TTL_MS, isSingleUse = true } = options
  const suffix = generateJoinCodeSuffix()
  const code = `RUMAH-${suffix}`
  const expiresAt = new Date(Date.now() + ttlMs).toISOString()

  const { data, error } = await supabase
    .from('join_codes')
    .insert({
      profile_id: profileId,
      code,
      created_by: anonymousId,
      expires_at: expiresAt,
      is_single_use: isSingleUse,
    })
    .select()
    .single()

  if (error) return null // handle UNIQUE conflict by retrying with new suffix at call site
  return data as JoinCode
}

// ---------------------------------------------------------------
// Profile read
// ---------------------------------------------------------------

export async function getProfile(profileId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single()
  return (data as Profile) ?? null
}

export async function getProfileMembers(profileId: string): Promise<ProfileMember[]> {
  const { data } = await supabase.from('profile_members').select('*').eq('profile_id', profileId)
  return (data as ProfileMember[]) ?? []
}

/** Look up which profileId this device belongs to (null = solo). */
export async function getMyProfileId(anonymousId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profile_members')
    .select('profile_id')
    .eq('anonymous_id', anonymousId)
    .single()
  return data?.profile_id ?? null
}

// ---------------------------------------------------------------
// Shared data reads
// ---------------------------------------------------------------

export async function getSharedWallets(profileId: string): Promise<ProfileWallet[]> {
  const { data } = await supabase
    .from('profile_wallets')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')
  return (data as ProfileWallet[]) ?? []
}

export async function getSharedTagihan(profileId: string): Promise<ProfileTagihan[]> {
  const { data } = await supabase
    .from('profile_tagihan')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at')
  return (data as ProfileTagihan[]) ?? []
}

export async function getSharedGoals(profileId: string): Promise<ProfileGoal[]> {
  const { data } = await supabase
    .from('profile_goals')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')
  return (data as ProfileGoal[]) ?? []
}

export async function getSharedTransactions(
  profileId: string,
  limit = 100,
): Promise<ProfileTransaction[]> {
  const { data } = await supabase
    .from('profile_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('date', { ascending: false })
    .limit(limit)
  return (data as ProfileTransaction[]) ?? []
}

export async function getSharedSettings(profileId: string): Promise<ProfileSettings | null> {
  const { data } = await supabase
    .from('profile_settings')
    .select('*')
    .eq('profile_id', profileId)
    .single()
  return (data as ProfileSettings) ?? null
}

// ---------------------------------------------------------------
// Shared data writes (last-write-wins with field _meta)
// ---------------------------------------------------------------

/** Build _meta patch for the fields being updated. */
export function buildMeta(
  fields: string[],
  updatedBy: string,
  updatedAt = new Date().toISOString(),
): RecordMeta {
  return Object.fromEntries(
    fields.map((f) => [f, { updated_at: updatedAt, updated_by: updatedBy }]),
  )
}

/** Merge incoming _meta with existing _meta (last-write-wins per field). */
export function mergeMeta(existing: RecordMeta, incoming: RecordMeta): RecordMeta {
  const merged = { ...existing }
  for (const [field, newEntry] of Object.entries(incoming)) {
    const old = merged[field]
    if (!old || new Date(newEntry.updated_at) >= new Date(old.updated_at)) {
      merged[field] = newEntry
    }
  }
  return merged
}

export async function upsertSharedWallet(
  wallet: Omit<ProfileWallet, 'created_at'>,
): Promise<ProfileWallet | null> {
  const { data, error } = await supabase
    .from('profile_wallets')
    .upsert(wallet, { onConflict: 'id' })
    .select()
    .single()
  if (error) return null
  return data as ProfileWallet
}

export async function upsertSharedTagihan(
  tagihan: Omit<ProfileTagihan, 'created_at'>,
): Promise<ProfileTagihan | null> {
  const { data, error } = await supabase
    .from('profile_tagihan')
    .upsert(tagihan, { onConflict: 'id' })
    .select()
    .single()
  if (error) return null
  return data as ProfileTagihan
}

export async function upsertSharedGoal(
  goal: Omit<ProfileGoal, 'created_at'>,
): Promise<ProfileGoal | null> {
  const { data, error } = await supabase
    .from('profile_goals')
    .upsert(goal, { onConflict: 'id' })
    .select()
    .single()
  if (error) return null
  return data as ProfileGoal
}

export async function upsertSharedTransaction(
  tx: Omit<ProfileTransaction, 'created_at'>,
): Promise<ProfileTransaction | null> {
  const { data, error } = await supabase
    .from('profile_transactions')
    .upsert(tx, { onConflict: 'id' })
    .select()
    .single()
  if (error) return null
  return data as ProfileTransaction
}

export async function updateSharedSettings(
  profileId: string,
  patch: Partial<Omit<ProfileSettings, 'profile_id'>>,
): Promise<ProfileSettings | null> {
  const { data, error } = await supabase
    .from('profile_settings')
    .update(patch)
    .eq('profile_id', profileId)
    .select()
    .single()
  if (error) return null
  return data as ProfileSettings
}

// ---------------------------------------------------------------
// Disconnect — remove this device from the shared profile
// ---------------------------------------------------------------

export async function disconnectDevice(anonymousId: string): Promise<boolean> {
  const { error } = await supabase.from('profile_members').delete().eq('anonymous_id', anonymousId)
  return !error
}

// ---------------------------------------------------------------
// Tagihan reminder sync
// ---------------------------------------------------------------

import type { Tagihan } from '@/db/database'

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
