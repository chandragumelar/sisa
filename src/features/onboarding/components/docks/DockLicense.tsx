import { useState } from 'react'
import { activateLicense } from '@/features/license/license.utils'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  onBotSay: (text: string) => void
  onNext: (echo: string) => void
}

export function DockLicense({ onBotSay, onNext }: Props) {
  const clock = useClock()
  const lang = useLanguage()
  const [key, setKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleActivate() {
    const trimmed = key.trim()
    if (!trimmed || isLoading) return
    setIsLoading(true)
    try {
      const result = await activateLicense(trimmed, clock)
      if (!result.ok) {
        onBotSay(t('ob.step2.err_invalid', lang))
        return
      }
      onNext(t('ob.chat.echo_license', lang))
    } catch (err) {
      console.error('[DockLicense] gagal aktivasi', { error: err })
      onBotSay(t('ob.step2.err_other', lang))
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleActivate()
  }

  return (
    <>
      <input
        className="ob-input ob-input-mono"
        type="text"
        placeholder={t('ob.step2.hint', lang)}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        className="ob-primary-btn"
        disabled={!key.trim() || isLoading}
        onClick={() => void handleActivate()}
      >
        {isLoading ? t('ob.step2.verify', lang) : t('ob.step2.activate', lang)}
      </button>
      <button
        className="ob-link"
        onClick={() => window.open('https://pikaxustudio.gumroad.com/l/sisa-app', '_blank')}
      >
        {t('ob.step2.buy_cta', lang)}
      </button>
    </>
  )
}
