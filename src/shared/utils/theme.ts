import type { Theme } from '@/db/database'

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'light') {
    root.style.colorScheme = 'light'
  } else if (theme === 'dark') {
    root.style.colorScheme = 'dark'
  } else {
    root.style.colorScheme = 'light dark'
  }
}
