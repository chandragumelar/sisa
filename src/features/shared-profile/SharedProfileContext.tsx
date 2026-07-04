import { createContext, useContext } from 'react'
import { useSharedProfile } from './useSharedProfile'
import { useSnapshotAutoUpload } from './useSnapshotAutoUpload'
import type { SharedProfileState } from './shared-profile.types'
import type { RecoverProfileResult, CreateProfileResult } from '@/lib/supabase/types'

type SharedProfileCtx = SharedProfileState & {
  createProfile: (
    name: string,
    displayName: string,
  ) => Promise<CreateProfileResult & { recoveryCode?: string }>
  recover: (rawCode: string, displayName: string) => Promise<RecoverProfileResult>
  /** Invalidate existing recovery codes and generate a fresh one. Returns raw code on success. */
  regenerateRecovery: () => Promise<{ raw: string } | { error: string }>
}

const SharedProfileContext = createContext<SharedProfileCtx | null>(null)

export function SharedProfileProvider({ children }: { children: React.ReactNode }) {
  const value = useSharedProfile()
  useSnapshotAutoUpload({
    status: value.status,
    profileId: value.profileId,
    anonymousId: value.anonymousId,
  })
  return <SharedProfileContext.Provider value={value}>{children}</SharedProfileContext.Provider>
}

export function useSharedProfileCtx(): SharedProfileCtx {
  const ctx = useContext(SharedProfileContext)
  if (!ctx) throw new Error('useSharedProfileCtx must be inside SharedProfileProvider')
  return ctx
}
