import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateBanner() {
  useRegisterSW({ immediate: true })

  // New SW claims clients (skipWaiting + clientsClaim in sw.ts) — reload the open tab to match
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (!navigator.serviceWorker.controller) return // first install, skip
    const handler = () => window.location.reload()
    navigator.serviceWorker.addEventListener('controllerchange', handler)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handler)
  }, [])

  return null
}
