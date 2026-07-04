import type { Theme } from '@/db/database'

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

let mediaListener: ((e: MediaQueryListEvent) => void) | null = null

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const resolved = resolve(theme)
  root.setAttribute('data-theme', resolved)
  root.style.colorScheme = resolved

  // system: re-apply saat OS theme berubah
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  if (mediaListener) mq.removeEventListener('change', mediaListener)
  mediaListener = null
  if (theme === 'system') {
    mediaListener = () => {
      const r = mq.matches ? 'dark' : 'light'
      root.setAttribute('data-theme', r)
      root.style.colorScheme = r
    }
    mq.addEventListener('change', mediaListener)
  }
}
