import { useState, useEffect, useCallback } from 'react'
import {
  ensureAnonymousSession,
  getMyProfileId,
  getProfile,
  createProfile as apiCreateProfile,
  recoverProfile as apiRecoverProfile,
  generateRecoveryCode,
  regenerateRecoveryCode as apiRegenerateRecoveryCode,
  uploadSnapshot,
  downloadSnapshot,
} from '@/lib/supabase/api'
import { collectSnapshot, applySnapshot } from '@/db/snapshot.repository'
import { useClock } from '@/app/providers/useClock'
import { snapshotHash, snapshotHashKey } from './snapshotHash'
import type { SharedProfileState } from './shared-profile.types'
import { INITIAL_STATE } from './shared-profile.types'
import type { RecoverProfileResult, CreateProfileResult } from '@/lib/supabase/types'

type UseSharedProfileReturn = SharedProfileState & {
  /** Create backup profile for this device (first "Amankan Data" action). */
  createProfile: (
    name: string,
    displayName: string,
  ) => Promise<CreateProfileResult & { recoveryCode?: string }>
  /** Recover profile on new device with raw recovery code. */
  recover: (rawCode: string, displayName: string) => Promise<RecoverProfileResult>
  /** Invalidate existing recovery codes and generate a fresh one. Returns raw code on success. */
  regenerateRecovery: () => Promise<{ raw: string } | { error: string }>
}

export function useSharedProfile(): UseSharedProfileReturn {
  const [state, setState] = useState<SharedProfileState>(INITIAL_STATE)
  const clock = useClock()

  const updateState = useCallback((patch: Partial<SharedProfileState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  // ---------------------------------------------------------------
  // Refresh: re-read profile from Supabase
  // ---------------------------------------------------------------
  const refresh = useCallback(
    async (anonymousId: string) => {
      const profileId = await getMyProfileId(anonymousId)

      if (!profileId) {
        updateState({ status: 'solo', profileId: null, profile: null })
        return
      }

      const profile = await getProfile(profileId)
      updateState({ status: 'connected', profileId, profile })
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
  // Actions
  // ---------------------------------------------------------------

  const createProfile = useCallback(
    async (name: string, displayName: string) => {
      const rawCode = generateRecoveryCode()
      const result = await apiCreateProfile(name, displayName, rawCode)
      if (result.ok && state.anonymousId) {
        // auto-upload via useSnapshotAutoUpload on visibility/interval; hash synced here
        // so auto-upload skips duplicate immediately after create
        try {
          const snap = await collectSnapshot(Date.now())
          await uploadSnapshot(result.profile_id, state.anonymousId, snap)
          const json = JSON.stringify(snap)
          localStorage.setItem(snapshotHashKey(result.profile_id), snapshotHash(json))
        } catch {
          /* upload failure does not fail profile creation — recovery code still valid */
        }
        await refresh(state.anonymousId)
      }
      return { ...result, recoveryCode: result.ok ? rawCode : undefined }
    },
    [state.anonymousId, refresh],
  )

  const recover = useCallback(
    async (rawCode: string, displayName: string): Promise<RecoverProfileResult> => {
      const result = await apiRecoverProfile(rawCode, displayName)
      if (result.ok && state.anonymousId) {
        await refresh(state.anonymousId)
        const snap = await downloadSnapshot(result.profile_id)
        if (snap) {
          await applySnapshot(snap, clock)
          const json = JSON.stringify(snap)
          localStorage.setItem(snapshotHashKey(result.profile_id), snapshotHash(json))
        }
      }
      return result
    },
    [state.anonymousId, refresh, clock],
  )

  const regenerateRecovery = useCallback(async (): Promise<{ raw: string } | { error: string }> => {
    const raw = generateRecoveryCode()
    const result = await apiRegenerateRecoveryCode(raw)
    if (result.ok) return { raw }
    return { error: result.error ?? 'REGENERATE_FAILED' }
  }, [])

  return {
    ...state,
    createProfile,
    recover,
    regenerateRecovery,
  }
}
