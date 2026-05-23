import type { Language } from '@/db/database'

export function applyLanguage(lang: Language): void {
  document.documentElement.lang = lang
}
