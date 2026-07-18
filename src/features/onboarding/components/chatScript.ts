import type { Language } from '@/db/database'
import type { OnboardingStep } from '../onboarding.types'
import { t } from '@/shared/strings/strings'

/** Bilingual opener — language isn't picked yet, so this can't go through t(). */
const LANG_INTRO_LINES = [
  "Hai, gue Sisa 👋 — Hi, I'm Sisa 👋",
  "Gue bantu lo tahu berapa yang aman dipakai hari ini. / I'll help you figure out what's safe to spend today.",
  'Pilih bahasa dulu ya. / First, pick your language.',
]

/**
 * Deterministic per-step bot script — reused for both live reveal and history rebuild.
 * Complex steps (incomeDetail/tagihan/wallet/alokasi) get a short chat lead-in only; their
 * card already carries its own heading, so the script avoids repeating it verbatim.
 */
export function getBaseBotLines(step: OnboardingStep, lang: Language): string[] {
  switch (step) {
    case 'langCurrency':
      return LANG_INTRO_LINES
    case 'license':
      return [t('ob.step2.heading', lang), t('ob.step2.sub', lang)]
    case 'incomeType':
      return [t('ob.step4a.heading', lang), t('ob.step4a.sub', lang)]
    case 'incomeDetail':
      return [t('ob.chat.intro_income_detail', lang)]
    case 'payConfirm':
      return [t('ob.payConfirm.heading', lang), t('ob.payConfirm.sub', lang)]
    case 'tagihan':
      return [t('ob.chat.intro_tagihan', lang)]
    case 'wallet':
      return [t('ob.chat.intro_wallet', lang)]
    case 'alokasi':
      return [t('ob.chat.intro_alokasi', lang)]
  }
}

export const CARD_STEPS: readonly OnboardingStep[] = [
  'incomeDetail',
  'tagihan',
  'wallet',
  'alokasi',
]
