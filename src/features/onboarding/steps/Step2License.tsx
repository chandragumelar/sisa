import { useState } from 'react'
import type { Tier } from '@/db/database'
import { activateLicense } from '@/features/license/license.utils'
import { useClock } from '@/app/providers/useClock'

interface Props {
  onNext: (data: { tier: Tier }) => void
}

export function Step2License({ onNext }: Props) {
  const clock = useClock()
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
        setError(
          result.reason === 'expired'
            ? 'kode sudah expired — perpanjang atau beli baru ›'
            : 'kode ga valid, cek email lo lagi',
        )
        return
      }
      onNext({ tier: result.tier })
    } catch (err) {
      console.error('[Step2License] gagal aktivasi', { error: err })
      setError('terjadi kesalahan, coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleActivate()
  }

  return (
    <>
      <h1 className="ob-heading">Tempel kode lisensi</h1>
      <p className="ob-subheading">Kode dikirim ke email lo abis beli.</p>

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

      <div className="ob-hint">Paste kode dari email lo</div>

      <div className="ob-grow" />

      <button
        className="ob-primary-btn"
        disabled={!key.trim() || isLoading}
        onClick={() => void handleActivate()}
      >
        {isLoading ? 'Memverifikasi…' : 'Aktivasi'}
      </button>

      <button className="ob-link" onClick={() => window.open('#', '_blank')}>
        Belum punya kode? Beli di sini ›
      </button>
    </>
  )
}
