/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return (event as PushEvent).data?.json() ?? {}
    } catch {
      return {}
    }
  })()
  const title: string = (data as Record<string, string>).title ?? 'SISA'
  const body: string = (data as Record<string, string>).body ?? 'Ada tagihan yang perlu dicek.'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/sisa-logo/icon-192.png',
      badge: '/sisa-logo/icon-192.png',
      data: { url: (data as Record<string, string>).url ?? '/' },
      tag: (data as Record<string, string>).tag,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = (event.notification.data?.url as string | undefined) ?? '/'
  event.waitUntil(self.clients.openWindow(url))
})
