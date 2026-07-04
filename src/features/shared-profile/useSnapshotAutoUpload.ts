import { useEffect } from 'react'
import { collectSnapshot } from '@/db/snapshot.repository'
import { uploadSnapshot } from '@/lib/supabase/api'
import type { SharedProfileState } from './shared-profile.types'
import { snapshotHash, snapshotHashKey } from './snapshotHash'

export function useSnapshotAutoUpload(args: {
  status: SharedProfileState['status']
  profileId: string | null
  anonymousId: string | null
}): void {
  const { status, profileId, anonymousId } = args

  useEffect(() => {
    if (status !== 'connected' || !profileId || !anonymousId) return

    async function maybeUpload() {
      try {
        const snap = await collectSnapshot(Date.now())
        const json = JSON.stringify(snap)
        const hash = snapshotHash(json)
        const key = snapshotHashKey(profileId!)
        if (localStorage.getItem(key) === hash) return
        const ok = await uploadSnapshot(profileId!, anonymousId!, snap)
        if (ok) localStorage.setItem(key, hash)
      } catch {
        console.warn('[snapshot] auto-upload failed')
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') void maybeUpload()
    }

    function onPageHide() {
      void maybeUpload()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)

    const intervalId = setInterval(() => {
      if (document.visibilityState !== 'hidden') void maybeUpload()
    }, 5 * 60_000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      clearInterval(intervalId)
    }
  }, [status, profileId, anonymousId])
}
