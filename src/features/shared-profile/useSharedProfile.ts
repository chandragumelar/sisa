import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  ensureAnonymousSession,
  getMyProfileId,
  getProfile,
  getProfileMembers,
  createProfile as apiCreateProfile,
  createJoinCode as apiCreateJoinCode,
  validateJoinCode as apiValidateJoinCode,
  redeemJoinCode as apiRedeemJoinCode,
  recoverProfile as apiRecoverProfile,
  disconnectDevice,
  generateRecoveryCode,
  regenerateRecoveryCode as apiRegenerateRecoveryCode,
} from '@/lib/supabase/api'
import type { JoinCode } from '@/lib/supabase/types'
import type { SharedProfileState } from './shared-profile.types'
import { INITIAL_STATE } from './shared-profile.types'
import type {
  ValidateJoinCodeResult,
  RedeemJoinCodeResult,
  RecoverProfileResult,
  CreateProfileResult,
} from '@/lib/supabase/types'

type UseSharedProfileReturn = SharedProfileState & {
  /** Expose a join code for "Ajak Pasangan". Creates new if none active. */
  generateCode: () => Promise<JoinCode | null>
  /** Validate code → returns profile preview (name) for confirmation screen. */
  previewCode: (code: string) => Promise<ValidateJoinCodeResult>
  /** Accept confirmed join → clears local Dexie, links to shared profile. */
  joinWithCode: (code: string, displayName: string) => Promise<RedeemJoinCodeResult>
  /** Recover profile on new device with raw recovery code. */
  recover: (rawCode: string, displayName: string) => Promise<RecoverProfileResult>
  /** Remove this device from shared profile (returns to solo). */
  disconnect: () => Promise<void>
  /** Create shared profile for this device (first "Ajak Pasangan" action). */
  createProfile: (
    name: string,
    displayName: string,
  ) => Promise<CreateProfileResult & { recoveryCode?: string }>
  /** Invalidate existing recovery codes and generate a fresh one. Returns raw code on success. */
  regenerateRecovery: () => Promise<{ raw: string } | { error: string }>
}

export function useSharedProfile(): UseSharedProfileReturn {
  const [state, setState] = useState<SharedProfileState>(INITIAL_STATE)
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const updateState = useCallback((patch: Partial<SharedProfileState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  // ---------------------------------------------------------------
  // Refresh: re-read profile + members from Supabase
  // ---------------------------------------------------------------
  const refresh = useCallback(
    async (anonymousId: string) => {
      const profileId = await getMyProfileId(anonymousId)

      if (!profileId) {
        updateState({ status: 'solo', profileId: null, profile: null, members: [] })
        return
      }

      const [profile, members] = await Promise.all([
        getProfile(profileId),
        getProfileMembers(profileId),
      ])

      const partner = members.find((m) => m.anonymous_id !== anonymousId) ?? null

      updateState({
        status: 'connected',
        profileId,
        profile,
        members,
        partnerId: partner?.anonymous_id ?? null,
        partnerName: partner?.display_name ?? null,
      })
    },
    [updateState],
  )

  // ---------------------------------------------------------------
  // Boot: ensure anonymous session → check profile membership
  // ---------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const anonymousId = await ensureAnonymousSession()
        if (cancelled) return

        updateState({ anonymousId })
        await refresh(anonymousId)
      } catch {
        if (!cancelled) updateState({ status: 'solo' })
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [refresh, updateState])

  // ---------------------------------------------------------------
  // Realtime subscription — subscribe when connected, cleanup when not
  // ---------------------------------------------------------------
  useEffect(() => {
    if (state.status !== 'connected' || !state.profileId) return

    const channel = supabase
      .channel(`profile:${state.profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_wallets',
          filter: `profile_id=eq.${state.profileId}`,
        },
        () => {
          /* sync handler wired in useSyncSharedData */
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_tagihan',
          filter: `profile_id=eq.${state.profileId}`,
        },
        () => {
          /* sync handler wired in useSyncSharedData */
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_goals',
          filter: `profile_id=eq.${state.profileId}`,
        },
        () => {
          /* sync handler wired in useSyncSharedData */
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_members',
          filter: `profile_id=eq.${state.profileId}`,
        },
        () => {
          if (state.anonymousId) refresh(state.anonymousId)
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') updateState({ status: 'offline' })
        if (status === 'SUBSCRIBED' && state.status === 'offline')
          updateState({ status: 'connected' })
      })

    realtimeRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      realtimeRef.current = null
    }
  }, [state.status, state.profileId, state.anonymousId, refresh, updateState])

  // ---------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------

  const createProfile = useCallback(
    async (name: string, displayName: string) => {
      const rawCode = generateRecoveryCode()
      const result = await apiCreateProfile(name, displayName, rawCode)
      if (result.ok && state.anonymousId) {
        await refresh(state.anonymousId)
      }
      return { ...result, recoveryCode: result.ok ? rawCode : undefined }
    },
    [state.anonymousId, refresh],
  )

  const generateCode = useCallback(async (): Promise<JoinCode | null> => {
    if (!state.profileId || !state.anonymousId) return null

    // Return existing valid code if still active
    if (state.activeCode) {
      const expiresAt = new Date(state.activeCode.expires_at).getTime()
      if (expiresAt > Date.now() && !state.activeCode.used_at) {
        return state.activeCode
      }
    }

    // Retry on UNIQUE collision (extremely rare but possible)
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = await apiCreateJoinCode(state.profileId, state.anonymousId)
      if (code) {
        updateState({ activeCode: code })
        return code
      }
    }
    return null
  }, [state.profileId, state.anonymousId, state.activeCode, updateState])

  const previewCode = useCallback((code: string) => apiValidateJoinCode(code), [])

  const joinWithCode = useCallback(
    async (code: string, displayName: string): Promise<RedeemJoinCodeResult> => {
      const result = await apiRedeemJoinCode(code, displayName)
      if (result.ok && state.anonymousId) {
        await refresh(state.anonymousId)
      }
      return result
    },
    [state.anonymousId, refresh],
  )

  const recover = useCallback(
    async (rawCode: string, displayName: string): Promise<RecoverProfileResult> => {
      const result = await apiRecoverProfile(rawCode, displayName)
      if (result.ok && state.anonymousId) {
        await refresh(state.anonymousId)
      }
      return result
    },
    [state.anonymousId, refresh],
  )

  const disconnect = useCallback(async () => {
    if (!state.anonymousId) return
    await disconnectDevice(state.anonymousId)
    updateState({
      status: 'solo',
      profileId: null,
      profile: null,
      members: [],
      activeCode: null,
      partnerId: null,
      partnerName: null,
    })
  }, [state.anonymousId, updateState])

  const regenerateRecovery = useCallback(async (): Promise<{ raw: string } | { error: string }> => {
    const raw = generateRecoveryCode()
    const result = await apiRegenerateRecoveryCode(raw)
    if (result.ok) return { raw }
    return { error: result.error ?? 'REGENERATE_FAILED' }
  }, [])

  return {
    ...state,
    createProfile,
    generateCode,
    previewCode,
    joinWithCode,
    recover,
    disconnect,
    regenerateRecovery,
  }
}
