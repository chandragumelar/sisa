import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { activateLicense } from '@/features/license/license.utils'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './Dock.module.css'

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

  const ready = key.trim().length > 0 && !isLoading

  return (
    <div className={`${styles.stack} ${styles.dockPop}`}>
      <div className={styles.composer}>
        <label className={styles.composerField}>
          <input
            className={styles.composerInput}
            type="text"
            placeholder={t('ob.step2.hint', lang)}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <button
          className={`${styles.sendBtn} ${ready ? styles.sendBtnReady : ''}`}
          disabled={!ready}
          aria-label={isLoading ? t('ob.step2.verify', lang) : t('ob.step2.activate', lang)}
          onClick={() => void handleActivate()}
        >
          <ArrowUp size={19} strokeWidth={2.1} />
        </button>
      </div>
      <div className={styles.linkRow}>
        <button
          className={styles.tlink}
          onClick={() => window.open('https://pikaxustudio.gumroad.com/l/sisa-app', '_blank')}
        >
          {t('ob.step2.buy_cta', lang)}
        </button>
      </div>
    </div>
  )
}
