import { useState, useEffect, type ReactNode } from 'react'
import type { Language } from '@/db/database'
import { getSettings } from '@/db/settings.repository'
import { LanguageContext } from './LanguageContext'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('id')

  useEffect(() => {
    getSettings().then((s) => {
      if (s) setLang(s.language)
    })
  }, [])

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}
