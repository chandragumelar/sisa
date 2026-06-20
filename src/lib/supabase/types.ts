// ============================================================
// Supabase database types for SISA Shared Profile
// Mirrors the schema in supabase/migrations/001_initial_schema.sql
// ============================================================

export type FieldMeta = {
  updated_at: string // ISO 8601
  updated_by: string // anonymous_id UUID
}

export type RecordMeta = Record<string, FieldMeta>

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
// Shared financial data
// ---------------------------------------------------------------

export type ProfileWallet = {
  id: string
  profile_id: string
  name: string
  balance: number
  currency: string
  sort_order: number
  created_at: string
  _meta: RecordMeta
}

export type ProfileTagihan = {
  id: string
  profile_id: string
  name: string
  nominal_type: 'tetap' | 'variabel'
  nominal_estimate: number
  due_day: number
  frequency: string
  anchor_date: number // epoch ms
  currency: string
  is_active: boolean
  last_paid_at: number | null
  last_paid_amount: number | null
  created_at: string
  _meta: RecordMeta
}

export type ProfileGoal = {
  id: string
  profile_id: string
  name: string
  target: number
  currency: string
  sort_order: number
  created_at: string
  _meta: RecordMeta
}

export type ProfileTransaction = {
  id: string
  profile_id: string
  wallet_id: string
  amount: number
  type: string
  currency: string
  label: string | null
  note: string | null
  date: number // epoch ms
  tagihan_id: string | null
  transfer_pair_id: string | null
  is_from_savings: boolean
  is_earmark: boolean
  created_at: string
  _meta: RecordMeta
}

export type ProfileSettings = {
  profile_id: string
  income_type: string
  income_day: number | null
  freelance_min_balance: number | null
  primary_currency: string
  secondary_currency: string | null
  income_frequency: string
  income_anchor_date: number | null
  weekend_behavior: string | null
  _meta: RecordMeta
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
