import { supabase } from '@/lib/supabase/client'
import { ensureAnonymousSession } from '@/lib/supabase/api'
import { db } from '@/db/database'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/** True if all runtime conditions for push are met (not permanently denied, API exists). */
export function canAskPush(): boolean {
  return (
    'serviceWorker' in navigator && 'PushManager' in window && Notification.permission !== 'denied'
  )
}

/** True if the push permission sheet should be shown to the user right now. */
export async function shouldAskPush(): Promise<boolean> {
  if (!canAskPush()) return false
  if (Notification.permission !== 'default') return false
  const s = await db.settings.get(1)
  return !s?.pushAsked
}

/** Mark that the push permission sheet was shown (call before rendering, not after answering). */
export async function markPushAsked(): Promise<void> {
  const s = await db.settings.get(1)
  if (!s) return
  await db.settings.put({ ...s, pushAsked: true })
}

/** Request permission, subscribe, and save to Supabase. Returns true on success. */
export async function enablePush(): Promise<boolean> {
  try {
    if (!canAskPush()) return false
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return false

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })

    const anonId = await ensureAnonymousSession()
    const json = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      anonymous_id: anonId,
      endpoint: json.endpoint!,
      subscription: json,
    })
    return true
  } catch {
    return false
  }
}
