import { useState } from 'react'
import { activateLicense } from '@/features/license/license.utils'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  onNext: () => void
}

export function Step2License({ onNext }: Props) {
  const clock = useClock()
  const lang = useLanguage()
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleActivate() {
    const trimmed = key.trim()
    if (!trimmed || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await activateLicense(trimmed, clock)
      if (!result.ok) {
        setError(t('ob.step2.err_invalid', lang))
        return
      }
      onNext()
    } catch (err) {
      console.error('[Step2License] gagal aktivasi', { error: err })
      setError(t('ob.step2.err_other', lang))
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleActivate()
  }

  return (
    <>
      <h1 className="ob-heading">{t('ob.step2.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.step2.sub', lang)}</p>

      <div className="ob-field">
        <input
          className="ob-input ob-input-mono"
          type="text"
          placeholder="eyJ2IjoxLCJ0aWVy…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {error && <div className="ob-error">{error}</div>}
      </div>

      <div className="ob-hint">{t('ob.step2.hint', lang)}</div>

      <div className="ob-grow" />

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
