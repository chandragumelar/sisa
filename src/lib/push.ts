import { supabase } from '@/lib/supabase/client'
import { getAnonymousId } from '@/lib/supabase/api'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/** True if browser supports push and permission is not permanently denied. */
export function canAskPush(): boolean {
  return (
    'serviceWorker' in navigator && 'PushManager' in window && Notification.permission !== 'denied'
  )
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

    const anonId = await getAnonymousId()
    if (!anonId) return false
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
