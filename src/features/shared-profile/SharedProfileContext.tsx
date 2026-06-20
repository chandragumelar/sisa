import { createContext, useContext } from 'react'
import { useSharedProfile } from './useSharedProfile'
import type { SharedProfileState } from './shared-profile.types'
import type {
  ValidateJoinCodeResult,
  RedeemJoinCodeResult,
  RecoverProfileResult,
  CreateProfileResult,
} from '@/lib/supabase/types'
import type { JoinCode } from '@/lib/supabase/types'

type SharedProfileCtx = SharedProfileState & {
  generateCode: () => Promise<JoinCode | null>
  previewCode: (code: string) => Promise<ValidateJoinCodeResult>
  joinWithCode: (code: string, displayName: string) => Promise<RedeemJoinCodeResult>
  recover: (rawCode: string, displayName: string) => Promise<RecoverProfileResult>
  disconnect: () => Promise<void>
  createProfile: (
    name: string,
    displayName: string,
  ) => Promise<CreateProfileResult & { recoveryCode?: string }>
}

const SharedProfileContext = createContext<SharedProfileCtx | null>(null)

export function SharedProfileProvider({ children }: { children: React.ReactNode }) {
  const value = useSharedProfile()
  return <SharedProfileContext.Provider value={value}>{children}</SharedProfileContext.Provider>
}

export function useSharedProfileCtx(): SharedProfileCtx {
  const ctx = useContext(SharedProfileContext)
  if (!ctx) throw new Error('useSharedProfileCtx must be inside SharedProfileProvider')
  return ctx
}
