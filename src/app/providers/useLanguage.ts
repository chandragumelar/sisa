import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'
import type { Language } from '@/db/database'

export function useLanguage(): Language {
  return useContext(LanguageContext).lang
}

export function useSetLanguage(): (lang: Language) => void {
  return useContext(LanguageContext).setLang
}
