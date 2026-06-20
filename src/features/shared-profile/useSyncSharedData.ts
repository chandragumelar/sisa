// ============================================================
// Sync layer: Supabase Realtime → Dexie (last-write-wins per field)
//
// Strategy:
//   - On connect/reconnect: pull full shared state from Supabase → write to Dexie
//   - On Realtime change event: merge incoming row into Dexie using _meta.updated_at
//   - On local Dexie write (shared mode): write to Dexie first, then upsert to Supabase
//     with updated _meta. Optimistic local-first.
//   - Offline: writes go to Dexie only; a sync queue processes them when online.
// ============================================================

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  getSharedWallets,
  getSharedTagihan,
  getSharedGoals,
  upsertSharedWallet,
  upsertSharedTagihan,
  upsertSharedGoal,
  buildMeta,
  mergeMeta,
} from '@/lib/supabase/api'
import { db } from '@/db/database'
import type { ProfileWallet, ProfileTagihan, ProfileGoal, RecordMeta } from '@/lib/supabase/types'
import type { Wallet, Tagihan, Goal } from '@/db/database'

// Each synced Dexie entity stores its Supabase UUID in a meta table.
// For now we use a simple localStorage map: { dexieId: supabaseId }
// Upgraded to Dexie meta store in a future migration if needed.
const SYNC_MAP_KEY = 'sisa_sync_map'

type SyncMap = {
  wallets: Record<number, string> // dexie id → supabase uuid
  tagihan: Record<number, string>
  goals: Record<number, string>
}

function loadSyncMap(): SyncMap {
  try {
    const raw = localStorage.getItem(SYNC_MAP_KEY)
    if (raw) return JSON.parse(raw) as SyncMap
  } catch {
    /* ignore */
  }
  return { wallets: {}, tagihan: {}, goals: {} }
}

function saveSyncMap(map: SyncMap) {
  localStorage.setItem(SYNC_MAP_KEY, JSON.stringify(map))
}

// ---------------------------------------------------------------
// Converters: Supabase row → Dexie entity
// ---------------------------------------------------------------

function supabaseWalletToDexie(row: ProfileWallet): Omit<Wallet, 'id'> & { id?: number } {
  return {
    name: row.name,
    balance: row.balance,
    currency: row.currency,
    order: row.sort_order,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function supabaseTagihanToDexie(row: ProfileTagihan): Omit<Tagihan, 'id'> & { id?: number } {
  return {
    name: row.name,
    nominalType: row.nominal_type,
    nominalEstimate: row.nominal_estimate,
    dueDay: row.due_day,
    frequency: row.frequency as Tagihan['frequency'],
    anchorDate: row.anchor_date,
    currency: row.currency,
    isActive: row.is_active,
    lastPaidAt: row.last_paid_at,
    lastPaidAmount: row.last_paid_amount,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function supabaseGoalToDexie(row: ProfileGoal): Omit<Goal, 'id'> & { id?: number } {
  return {
    name: row.name,
    target: row.target,
    currency: row.currency,
    order: row.sort_order,
    createdAt: new Date(row.created_at).getTime(),
  }
}

// ---------------------------------------------------------------
// Converters: Dexie entity → Supabase row patch
// ---------------------------------------------------------------

function dexieWalletToSupabase(
  wallet: Wallet & { id: number },
  profileId: string,
  supabaseId: string,
  anonymousId: string,
  changedFields: (keyof Wallet)[],
): Omit<ProfileWallet, 'created_at'> {
  return {
    id: supabaseId,
    profile_id: profileId,
    name: wallet.name,
    balance: wallet.balance,
    currency: wallet.currency,
    sort_order: wallet.order,
    _meta: buildMeta(changedFields as string[], anonymousId),
  }
}

function dexieTagihanToSupabase(
  tagihan: Tagihan & { id: number },
  profileId: string,
  supabaseId: string,
  anonymousId: string,
  changedFields: (keyof Tagihan)[],
): Omit<ProfileTagihan, 'created_at'> {
  return {
    id: supabaseId,
    profile_id: profileId,
    name: tagihan.name,
    nominal_type: tagihan.nominalType,
    nominal_estimate: tagihan.nominalEstimate,
    due_day: tagihan.dueDay,
    frequency: tagihan.frequency,
    anchor_date: tagihan.anchorDate,
    currency: tagihan.currency,
    is_active: tagihan.isActive,
    last_paid_at: tagihan.lastPaidAt,
    last_paid_amount: tagihan.lastPaidAmount,
    _meta: buildMeta(changedFields as string[], anonymousId),
  }
}

function dexieGoalToSupabase(
  goal: Goal & { id: number },
  profileId: string,
  supabaseId: string,
  anonymousId: string,
  changedFields: (keyof Goal)[],
): Omit<ProfileGoal, 'created_at'> {
  return {
    id: supabaseId,
    profile_id: profileId,
    name: goal.name,
    target: goal.target,
    currency: goal.currency,
    sort_order: goal.order,
    _meta: buildMeta(changedFields as string[], anonymousId),
  }
}

// ---------------------------------------------------------------
// Last-write-wins merge for a single row
// ---------------------------------------------------------------

function shouldAcceptRemote(localMeta: RecordMeta, remoteMeta: RecordMeta, field: string): boolean {
  const local = localMeta[field]
  const remote = remoteMeta[field]
  if (!remote) return false
  if (!local) return true
  return new Date(remote.updated_at) > new Date(local.updated_at)
}

// ---------------------------------------------------------------
// useSyncSharedData hook
// ---------------------------------------------------------------

type UseSyncSharedDataOptions = {
  profileId: string | null
  anonymousId: string | null
  isConnected: boolean
}

export function useSyncSharedData({
  profileId,
  anonymousId,
  isConnected,
}: UseSyncSharedDataOptions) {
  const syncMapRef = useRef<SyncMap>(loadSyncMap())

  // Pull all shared data from Supabase → write to Dexie (initial load / reconnect)
  const pullAll = useCallback(async () => {
    if (!profileId) return

    const [wallets, tagihan, goals] = await Promise.all([
      getSharedWallets(profileId),
      getSharedTagihan(profileId),
      getSharedGoals(profileId),
    ])

    const map = syncMapRef.current

    // Wallets
    for (const row of wallets) {
      const existingDexieId = Object.entries(map.wallets).find(([, sid]) => sid === row.id)?.[0]
      if (existingDexieId) {
        await db.wallets.update(parseInt(existingDexieId), supabaseWalletToDexie(row))
      } else {
        const id = await db.wallets.add(supabaseWalletToDexie(row))
        map.wallets[id as number] = row.id
      }
    }

    // Tagihan
    for (const row of tagihan) {
      const existingDexieId = Object.entries(map.tagihan).find(([, sid]) => sid === row.id)?.[0]
      if (existingDexieId) {
        await db.tagihan.update(parseInt(existingDexieId), supabaseTagihanToDexie(row))
      } else {
        const id = await db.tagihan.add(supabaseTagihanToDexie(row) as Tagihan)
        map.tagihan[id as number] = row.id
      }
    }

    // Goals
    for (const row of goals) {
      const existingDexieId = Object.entries(map.goals).find(([, sid]) => sid === row.id)?.[0]
      if (existingDexieId) {
        await db.goals.update(parseInt(existingDexieId), supabaseGoalToDexie(row))
      } else {
        const id = await db.goals.add(supabaseGoalToDexie(row) as Goal)
        map.goals[id as number] = row.id
      }
    }

    saveSyncMap(map)
  }, [profileId])

  // Handle a single Realtime change event — merge into Dexie last-write-wins
  const handleRealtimeWallet = useCallback(
    async (payload: { new: ProfileWallet; old: Partial<ProfileWallet> }) => {
      const row = payload.new
      const map = syncMapRef.current
      const entry = Object.entries(map.wallets).find(([, sid]) => sid === row.id)
      if (!entry) {
        // New wallet added by partner — insert into Dexie
        const id = await db.wallets.add(supabaseWalletToDexie(row))
        map.wallets[id as number] = row.id
        saveSyncMap(map)
        return
      }

      const [dexieId] = entry
      const existing = await db.wallets.get(parseInt(dexieId))
      if (!existing) return

      // Merge: accept remote fields where remote.updated_at > local.updated_at
      const localMeta = (existing as Wallet & { _meta?: RecordMeta })._meta ?? {}
      const patch: Partial<Wallet> = {}
      if (shouldAcceptRemote(localMeta, row._meta, 'name')) patch.name = row.name
      if (shouldAcceptRemote(localMeta, row._meta, 'balance')) patch.balance = row.balance
      if (shouldAcceptRemote(localMeta, row._meta, 'sort_order')) patch.order = row.sort_order

      if (Object.keys(patch).length > 0) {
        await db.wallets.update(parseInt(dexieId), patch)
      }
    },
    [],
  )

  const handleRealtimeTagihan = useCallback(async (payload: { new: ProfileTagihan }) => {
    const row = payload.new
    const map = syncMapRef.current
    const entry = Object.entries(map.tagihan).find(([, sid]) => sid === row.id)
    if (!entry) {
      const id = await db.tagihan.add(supabaseTagihanToDexie(row) as Tagihan)
      map.tagihan[id as number] = row.id
      saveSyncMap(map)
      return
    }
    const [dexieId] = entry
    const existing = await db.tagihan.get(parseInt(dexieId))
    if (!existing) return
    const localMeta = (existing as Tagihan & { _meta?: RecordMeta })._meta ?? {}
    const patch: Partial<Tagihan> = {}
    const fields: (keyof Tagihan)[] = [
      'name',
      'nominalEstimate',
      'dueDay',
      'frequency',
      'isActive',
      'lastPaidAt',
      'lastPaidAmount',
    ]
    for (const f of fields) {
      const remoteKey =
        f === 'nominalEstimate'
          ? 'nominal_estimate'
          : f === 'dueDay'
            ? 'due_day'
            : f === 'isActive'
              ? 'is_active'
              : f === 'lastPaidAt'
                ? 'last_paid_at'
                : f === 'lastPaidAmount'
                  ? 'last_paid_amount'
                  : f
      if (shouldAcceptRemote(localMeta, row._meta, remoteKey)) {
        ;(patch as Record<string, unknown>)[f] = (row as Record<string, unknown>)[remoteKey]
      }
    }
    if (Object.keys(patch).length > 0) {
      await db.tagihan.update(parseInt(dexieId), patch)
    }
  }, [])

  const handleRealtimeGoal = useCallback(async (payload: { new: ProfileGoal }) => {
    const row = payload.new
    const map = syncMapRef.current
    const entry = Object.entries(map.goals).find(([, sid]) => sid === row.id)
    if (!entry) {
      const id = await db.goals.add(supabaseGoalToDexie(row) as Goal)
      map.goals[id as number] = row.id
      saveSyncMap(map)
      return
    }
    const [dexieId] = entry
    const existing = await db.goals.get(parseInt(dexieId))
    if (!existing) return
    const localMeta = (existing as Goal & { _meta?: RecordMeta })._meta ?? {}
    const patch: Partial<Goal> = {}
    if (shouldAcceptRemote(localMeta, row._meta, 'name')) patch.name = row.name
    if (shouldAcceptRemote(localMeta, row._meta, 'target')) patch.target = row.target
    if (shouldAcceptRemote(localMeta, row._meta, 'sort_order')) patch.order = row.sort_order
    if (Object.keys(patch).length > 0) {
      await db.goals.update(parseInt(dexieId), patch)
    }
  }, [])

  // Wire up Realtime listeners
  useEffect(() => {
    if (!isConnected || !profileId) return

    pullAll()

    const channel = supabase
      .channel(`sync:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_wallets',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) =>
          handleRealtimeWallet(payload as { new: ProfileWallet; old: Partial<ProfileWallet> }),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile_wallets',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) =>
          handleRealtimeWallet(payload as { new: ProfileWallet; old: Partial<ProfileWallet> }),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_tagihan',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => handleRealtimeTagihan(payload as { new: ProfileTagihan }),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile_tagihan',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => handleRealtimeTagihan(payload as { new: ProfileTagihan }),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_goals',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => handleRealtimeGoal(payload as { new: ProfileGoal }),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile_goals',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => handleRealtimeGoal(payload as { new: ProfileGoal }),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    isConnected,
    profileId,
    pullAll,
    handleRealtimeWallet,
    handleRealtimeTagihan,
    handleRealtimeGoal,
  ])

  // ---------------------------------------------------------------
  // Push helpers: call these from repository functions when in shared mode
  // ---------------------------------------------------------------
  const pushWallet = useCallback(
    async (wallet: Wallet & { id: number }, changedFields: (keyof Wallet)[]) => {
      if (!profileId || !anonymousId) return
      const map = syncMapRef.current
      const supabaseId = map.wallets[wallet.id] ?? crypto.randomUUID()
      if (!map.wallets[wallet.id]) {
        map.wallets[wallet.id] = supabaseId
        saveSyncMap(map)
      }
      await upsertSharedWallet(
        dexieWalletToSupabase(wallet, profileId, supabaseId, anonymousId, changedFields),
      )
    },
    [profileId, anonymousId],
  )

  const pushTagihan = useCallback(
    async (tagihan: Tagihan & { id: number }, changedFields: (keyof Tagihan)[]) => {
      if (!profileId || !anonymousId) return
      const map = syncMapRef.current
      const supabaseId = map.tagihan[tagihan.id] ?? crypto.randomUUID()
      if (!map.tagihan[tagihan.id]) {
        map.tagihan[tagihan.id] = supabaseId
        saveSyncMap(map)
      }
      await upsertSharedTagihan(
        dexieTagihanToSupabase(tagihan, profileId, supabaseId, anonymousId, changedFields),
      )
    },
    [profileId, anonymousId],
  )

  const pushGoal = useCallback(
    async (goal: Goal & { id: number }, changedFields: (keyof Goal)[]) => {
      if (!profileId || !anonymousId) return
      const map = syncMapRef.current
      const supabaseId = map.goals[goal.id] ?? crypto.randomUUID()
      if (!map.goals[goal.id]) {
        map.goals[goal.id] = supabaseId
        saveSyncMap(map)
      }
      await upsertSharedGoal(
        dexieGoalToSupabase(goal, profileId, supabaseId, anonymousId, changedFields),
      )
    },
    [profileId, anonymousId],
  )

  return { pushWallet, pushTagihan, pushGoal, mergeMeta }
}
