import type { Profile, ProfileMember, JoinCode } from '@/lib/supabase/types'

export type SharedProfileStatus =
  | 'loading' // resolving session + profile membership
  | 'solo' // no shared profile, local-only
  | 'connected' // linked to a shared profile, sync active
  | 'offline' // was connected, now offline (serving cache)

export type SharedProfileState = {
  status: SharedProfileStatus
  anonymousId: string | null
  profileId: string | null
  profile: Profile | null
  members: ProfileMember[]
  activeCode: JoinCode | null // most recent join code for "Ajak Pasangan"
  partnerId: string | null // the other member's anonymous_id (2-device assumption)
  partnerName: string | null
}

export const INITIAL_STATE: SharedProfileState = {
  status: 'loading',
  anonymousId: null,
  profileId: null,
  profile: null,
  members: [],
  activeCode: null,
  partnerId: null,
  partnerName: null,
}
