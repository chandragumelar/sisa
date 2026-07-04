import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import { clearAllData, localHasData } from '@/db/backup.repository'
import { downloadSnapshot } from '@/lib/supabase/api'
import { applySnapshot } from '@/db/snapshot.repository'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { RpcError } from '@/lib/supabase/types'
import styles from './GabungKodePage.module.css'

// Charset: no 0/O, 1/I (matches server)
const VALID_CHARS = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]$/i

type Screen = 'input' | 'confirm' | 'success' | 'error'

const ERROR_LABELS: Record<RpcError, { title: string; desc: string; cta: string }> = {
  CODE_NOT_FOUND: {
    title: 'Kode Tidak Ditemukan',
    desc: 'Kode yang kamu masukkan tidak cocok. Pastikan tidak ada salah huruf atau angka.',
    cta: 'Coba Lagi',
  },
  CODE_EXPIRED: {
    title: 'Kode Sudah Kedaluarsa',
    desc: 'Kode ini sudah tidak berlaku. Kode hanya aktif selama 30 menit. Minta kode baru ke pasanganmu.',
    cta: 'Ok, Mengerti',
  },
  CODE_ALREADY_USED: {
    title: 'Kode Sudah Dipakai',
    desc: 'Kode ini sudah digunakan. Minta pasanganmu membuat kode baru.',
    cta: 'Ok, Mengerti',
  },
  ALREADY_IN_PROFILE: {
    title: 'Perangkat Sudah Terhubung',
    desc: 'Perangkat ini sudah terhubung ke sebuah profil. Putuskan koneksi dulu dari pengaturan.',
    cta: 'Ok, Mengerti',
  },
  PROFILE_FULL: {
    title: 'Profil Sudah Penuh',
    desc: 'Profil ini sudah terhubung ke 2 perangkat. Minta pasanganmu memutuskan salah satu dulu.',
    cta: 'Ok, Mengerti',
  },
  RECOVERY_CODE_INVALID: {
    title: 'Kode Tidak Valid',
    desc: 'Kode pemulihan tidak cocok atau sudah digunakan.',
    cta: 'Coba Lagi',
  },
}

export function GabungKodePage() {
  const navigate = useNavigate()
  const lang = useLanguage()
  const clock = useClock()
  const { previewCode, joinWithCode } = useSharedProfileCtx()

  const [chars, setChars] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState<Screen>('input')
  const [previewName, setPreviewName] = useState('')
  const [error, setError] = useState<RpcError | null>(null)
  const [localData, setLocalData] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const fullCode = `RUMAH-${chars.join('').toUpperCase()}`
  const isComplete = chars.every((c) => c !== '')

  function handleCharInput(index: number, value: string) {
    const char = value.slice(-1).toUpperCase()
    if (char && !VALID_CHARS.test(char)) return

    const next = [...chars]
    next[index] = char
    setChars(next)

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g, '')
    const extracted = text.startsWith('RUMAH')
      ? text.replace('RUMAH', '').slice(0, 4)
      : text.slice(0, 4)
    if (extracted.length === 4) {
      setChars(extracted.split(''))
      inputRefs[3].current?.focus()
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      const upper = text.toUpperCase().replace(/[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g, '')
      const extracted = upper.startsWith('RUMAH')
        ? upper.replace('RUMAH', '').slice(0, 4)
        : upper.slice(0, 4)
      if (extracted.length === 4) {
        setChars(extracted.split(''))
      }
    } catch {
      /* clipboard permission denied */
    }
  }

  async function handleCekKode() {
    if (!isComplete) return
    setLoading(true)
    try {
      const result = await previewCode(fullCode)
      if (result.ok) {
        setPreviewName(result.profile_name)
        setLocalData(await localHasData())
        setScreen('confirm')
      } else {
        setError(result.error)
        setScreen('error')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const result = await joinWithCode(fullCode, 'Pengguna')
      if (result.ok) {
        const snap = await downloadSnapshot(result.profile_id)
        if (snap) {
          await applySnapshot(snap, clock)
        } else {
          await clearAllData()
        }
        setScreen('success')
      } else {
        setError(result.error)
        setScreen('error')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setChars(['', '', '', ''])
    setError(null)
    setScreen('input')
    setAgreed(false)
    setLocalData(false)
    setTimeout(() => inputRefs[0].current?.focus(), 50)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => (screen === 'input' ? navigate(-1) : handleReset())}
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
          <div className={styles.title}>
            {screen === 'confirm' ? 'Konfirmasi Profil' : 'Gabung dengan Kode'}
          </div>
          {screen === 'input' && (
            <div className={styles.subtitle}>Masukkan kode dari pasanganmu</div>
          )}
        </div>
      </div>

      {/* ── Input screen ── */}
      {screen === 'input' && (
        <div className={styles.body}>
          <div className={styles.desc}>
            Minta kode <strong>RUMAH-XXXX</strong> dari pasanganmu, lalu masukkan di bawah.
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>KODE UNDANGAN</div>
            <div className={styles.inputRow}>
              <span className={styles.inputPrefix}>RUMAH —</span>
              {chars.map((char, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  className={`${styles.charInput} ${char ? styles.charInputFilled : ''}`}
                  value={char}
                  maxLength={1}
                  autoComplete="off"
                  inputMode="text"
                  onChange={(e) => handleCharInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>
            <button className={styles.pasteBtn} onClick={handlePasteFromClipboard}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Tempel dari clipboard
            </button>
          </div>

          <button
            className={`${styles.btnPrimary} ${!isComplete || loading ? styles.btnDisabled : ''}`}
            onClick={handleCekKode}
            disabled={!isComplete || loading}
          >
            {loading ? 'Memeriksa...' : 'Cek Kode'}
          </button>

          <div className={styles.footerHint}>
            Belum punya kode?{' '}
            <button className={styles.linkBtn} onClick={() => navigate('/ajak-pasangan')}>
              Minta ke pasanganmu
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmation screen ── */}
      {screen === 'confirm' && (
        <div className={styles.body}>
          <div className={styles.confirmAvatars}>
            <div className={`${styles.avatar} ${styles.avatarYou}`}>A</div>
            <div className={styles.avatarPlus}>+</div>
            <div className={`${styles.avatar} ${styles.avatarPartner}`}>
              {previewName.slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className={styles.confirmTitle}>Gabung ke profil {previewName}?</div>
          <div className={styles.confirmDesc}>
            Data keuangan kalian akan digabung dalam satu profil bersama.
          </div>

          <div className={styles.confirmList}>
            <div className={styles.confirmListLabel}>YANG AKAN DIGABUNG</div>
            {['Saldo &amp; dompet', 'Tagihan bulanan', 'Goal tabungan'].map((item) => (
              <div key={item} className={styles.confirmItem}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--signal-safe)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </div>
            ))}
          </div>

          {localData ? (
            <div className={styles.dangerWarning}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--signal-danger)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                Catatan keuangan di HP ini akan digantikan oleh dompet bersama. Data lama tidak bisa
                dikembalikan.
              </span>
            </div>
          ) : (
            <div className={styles.confirmWarning}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--signal-caution)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Aksi ini tidak bisa dibatalkan tanpa melepas koneksi secara manual.</span>
            </div>
          )}

          {localData && (
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>Saya mengerti dan setuju data lama di HP ini akan diganti.</span>
            </label>
          )}

          <div className={styles.confirmActions}>
            <button
              className={styles.btnPrimary}
              onClick={handleConfirm}
              disabled={loading || (localData && !agreed)}
            >
              {loading ? 'Menghubungkan...' : 'Ya, Gabung Sekarang'}
            </button>
            <button className={styles.btnGhost} onClick={handleReset}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ── Success screen ── */}
      {screen === 'success' && (
        <div className={`${styles.body} ${styles.bodyCenter}`}>
          <div className={styles.successAvatars}>
            <div className={`${styles.avatar} ${styles.avatarYou}`}>A</div>
            <div className={styles.successArrow}>→</div>
            <div className={`${styles.avatar} ${styles.avatarPartner}`}>
              {previewName.slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className={styles.successTitle}>Berhasil!</div>
          <div className={styles.successDesc}>
            Kalian sekarang satu profil. Saldo, tagihan, dan goal tabungan bisa diakses bersama.
          </div>
          <button className={styles.btnPrimary} onClick={() => navigate('/')}>
            Lihat Data Bersama
          </button>
        </div>
      )}

      {/* ── Error screen ── */}
      {screen === 'error' && error && (
        <div className={`${styles.body} ${styles.bodyCenter}`}>
          <div className={styles.errorIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-danger)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="12" />
              <line x1="11" y1="16" x2="11.01" y2="16" />
            </svg>
          </div>
          <div className={styles.errorTitle}>{ERROR_LABELS[error].title}</div>
          <div className={styles.errorDesc}>{ERROR_LABELS[error].desc}</div>
          <button
            className={styles.btnPrimary}
            onClick={error === 'CODE_NOT_FOUND' ? handleReset : () => navigate('/')}
          >
            {ERROR_LABELS[error].cta}
          </button>
          {error === 'CODE_NOT_FOUND' && (
            <button className={styles.btnGhost} onClick={() => navigate('/ajak-pasangan')}>
              Hubungi Pasangan
            </button>
          )}
        </div>
      )}
    </div>
  )
}
