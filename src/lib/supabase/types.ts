// ============================================================
// Supabase database types for SISA Shared Profile
// Mirrors the schema in supabase/migrations/001_initial_schema.sql
// ============================================================

// ---------------------------------------------------------------
// Identity
// ---------------------------------------------------------------

export type Profile = {
  id: string
  name: string
  max_devices: number
  created_at: string
}

export type ProfileMember = {
  id: string
  profile_id: string
  anonymous_id: string
  display_name: string
  is_primary: boolean
  joined_at: string
}

export type JoinCode = {
  id: string
  profile_id: string
  code: string // 'RUMAH-XXXX'
  created_by: string
  expires_at: string
  is_single_use: boolean
  used_at: string | null
  used_by: string | null
  created_at: string
}

// ---------------------------------------------------------------
// RPC return types
// ---------------------------------------------------------------

export type RpcError =
  | 'ALREADY_IN_PROFILE'
  | 'CODE_NOT_FOUND'
  | 'CODE_EXPIRED'
  | 'CODE_ALREADY_USED'
  | 'PROFILE_FULL'
  | 'RECOVERY_CODE_INVALID'

export type RpcResult<T = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: undefined; error: RpcError }

export type ValidateJoinCodeResult = RpcResult<{
  profile_id: string
  profile_name: string
}>

export type CreateProfileResult = RpcResult<{ profile_id: string }>
export type RedeemJoinCodeResult = RpcResult<{ profile_id: string }>
export type RecoverProfileResult = RpcResult<{ profile_id: string }>
