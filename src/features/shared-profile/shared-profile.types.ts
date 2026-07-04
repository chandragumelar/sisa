import type { Profile } from '@/lib/supabase/types'

export type SharedProfileStatus =
  | 'loading' // resolving session + profile membership
  | 'solo' // no shared profile, local-only
  | 'connected' // linked to a shared profile, backup active

export type SharedProfileState = {
  status: SharedProfileStatus
  anonymousId: string | null
  profileId: string | null
  profile: Profile | null
}

export const INITIAL_STATE: SharedProfileState = {
  status: 'loading',
  anonymousId: null,
  profileId: null,
  profile: null,
}
