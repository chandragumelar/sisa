import { createContext } from 'react'
import type { Language } from '@/db/database'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'id',
  setLang: () => {},
})
