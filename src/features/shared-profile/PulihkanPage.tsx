import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { RpcError } from '@/lib/supabase/types'
import styles from './PulihkanPage.module.css'

const ERROR_LABELS: Partial<Record<RpcError, { title: string; desc: string }>> = {
  RECOVERY_CODE_INVALID: {
    title: 'Kode Tidak Valid',
    desc: 'Kode pemulihan tidak cocok atau sudah pernah dipakai. Pastikan kamu memasukkan kode yang benar.',
  },
  PROFILE_FULL: {
    title: 'Profil Sudah Penuh',
    desc: 'Profil ini sudah terhubung ke maksimal 2 perangkat. Minta salah satu perangkat untuk memutuskan koneksi dulu.',
  },
}

type Screen = 'input' | 'success'

export function PulihkanPage() {
  const navigate = useNavigate()
  const lang = useLanguage()
  const { recover } = useSharedProfileCtx()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState<Screen>('input')
  const [error, setError] = useState<RpcError | null>(null)

  const trimmedCode = code.trim().toUpperCase()
  const isValid = trimmedCode.startsWith('SISA-') && trimmedCode.length >= 20

  async function handleSubmit() {
    if (!isValid || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await recover(trimmedCode, 'Pengguna')
      if (result.ok) {
        setScreen('success')
      } else {
        setError(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setCode(text.trim())
    } catch {
      /* permission denied */
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('common.back_aria', lang)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <div className={styles.title}>Pulihkan Profil Lama</div>
          <div className={styles.subtitle}>Masukkan kode pemulihan yang sudah kamu simpan</div>
        </div>
      </div>

      {screen === 'input' && (
        <div className={styles.body}>
          <div className={styles.iconWrap}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>

          <div className={styles.desc}>
            Kode pemulihan ditampilkan satu kali saat kamu pertama membuat profil bersama. Format:{' '}
            <code className={styles.codeHint}>SISA-XXXX-XXXX-XXXX-XXXX</code>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="recovery-code">
              KODE PEMULIHAN
            </label>
            <div className={styles.inputWrap}>
              <input
                id="recovery-code"
                className={styles.input}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(null)
                }}
                placeholder="SISA-XXXX-XXXX-XXXX-XXXX"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
              <button className={styles.pasteBtn} onClick={handlePaste} type="button">
                Tempel
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <div className={styles.errorTitle}>
                  {ERROR_LABELS[error]?.title ?? 'Terjadi kesalahan'}
                </div>
                <div className={styles.errorDesc}>{ERROR_LABELS[error]?.desc ?? 'Coba lagi.'}</div>
              </div>
            </div>
          )}

          <button
            className={`${styles.btnPrimary} ${!isValid || loading ? styles.btnDisabled : ''}`}
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? 'Memulihkan...' : 'Pulihkan Profil'}
          </button>

          <div className={styles.hint}>{t('recover.no_code_hint', lang)}</div>
        </div>
      )}

      {screen === 'success' && (
        <div className={`${styles.body} ${styles.bodyCenter}`}>
          <div className={styles.successIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-safe)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className={styles.successTitle}>Profil Dipulihkan!</div>
          <div className={styles.successDesc}>
            Data keuanganmu sudah bisa diakses di perangkat ini.
          </div>
          <button className={styles.btnPrimary} onClick={() => navigate('/')}>
            Kembali ke Beranda
          </button>
        </div>
      )}
    </div>
  )
}
