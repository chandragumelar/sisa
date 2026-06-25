import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import { BottomSheet } from '@/shared/components/BottomSheet'
import type { JoinCode } from '@/lib/supabase/types'
import styles from './AjakPasanganPage.module.css'

const RECOVERY_SHOWN_KEY = 'sisa:recoveryShown'

function buildWhatsAppText(code: string): string {
  return encodeURIComponent(
    `Hei! Aku undang kamu gabung ke profil SISA kita.\nMasuk SISA → ketuk "Gabung dengan Kode" → masukkan kode ini:\n${code}\nKode berlaku 30 menit ya!`,
  )
}

function formatCode(raw: string): string {
  // Display RUMAH-7X4K as "RUMAH\n7 X 4 K" for visual layout
  const parts = raw.split('-')
  return parts.length === 2 ? parts[1].split('').join(' ') : raw
}

type Step = 'recovery' | 'code'

export function AjakPasanganPage() {
  const navigate = useNavigate()
  const { status, createProfile, generateCode, profileId } = useSharedProfileCtx()

  const [step, setStep] = useState<Step>('code')
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState<JoinCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      if (status === 'solo') {
        // Create profile + get recovery code
        const result = await createProfile('Rumah Kita', 'Pengguna')
        if (!result.ok) {
          setError('Gagal membuat profil. Coba lagi.')
          return
        }
        if (result.recoveryCode) {
          setRecoveryCode(result.recoveryCode)
          setStep('recovery')
          return
        }
      }
      await loadCode()
    } finally {
      setLoading(false)
    }
  }

  async function loadCode() {
    setLoading(true)
    try {
      const code = await generateCode()
      if (!code) {
        setError('Gagal membuat kode. Coba lagi.')
        return
      }
      setJoinCode(code)
      setStep('code')
    } finally {
      setLoading(false)
    }
  }

  function handleRecoverySaved() {
    localStorage.setItem(RECOVERY_SHOWN_KEY, '1')
    loadCode()
  }

  function handleCopyCode() {
    if (!joinCode) return
    navigator.clipboard.writeText(joinCode.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleCopyMessage() {
    if (!joinCode) return
    const text = decodeURIComponent(buildWhatsAppText(joinCode.code))
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // On mount, if already connected load code
  if (status === 'connected' && !joinCode && !loading && step === 'code') {
    loadCode()
  }

  // Initial load for solo user who already has profile (recovery was already shown)
  const needsInit = status === 'solo' && !profileId && step === 'code' && !joinCode && !loading

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Kembali">
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
          <div className={styles.title}>Ajak Pasangan</div>
          <div className={styles.subtitle}>Bagikan kode ke pasanganmu</div>
        </div>
      </div>

      {step === 'recovery' && recoveryCode && (
        <div className={styles.recoveryWrap}>
          <div className={styles.recoveryIcon}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-safe)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className={styles.recoveryTitle}>Simpan kode pemulihanmu</div>
          <div className={styles.recoveryDesc}>
            Kode ini dipakai untuk memulihkan data di perangkat baru. Simpan di tempat aman — tidak
            bisa dilihat lagi.
          </div>
          <div className={styles.recoveryCodeBox}>
            <div className={styles.recoveryCodeLabel}>KODE PEMULIHAN</div>
            <div className={styles.recoveryCodeValue}>{recoveryCode}</div>
          </div>
          <div className={styles.recoveryActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => {
                navigator.clipboard.writeText(recoveryCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? 'Tersalin!' : 'Salin Kode'}
            </button>
            <button className={styles.btnPrimary} onClick={handleRecoverySaved}>
              Sudah Disimpan →
            </button>
          </div>
        </div>
      )}

      {step === 'code' && (
        <div className={styles.codeWrap}>
          <div className={styles.desc}>
            Minta pasanganmu buka SISA dan pilih <strong>&ldquo;Gabung dengan Kode&rdquo;</strong>,
            lalu masukkan kode ini.
          </div>

          {joinCode ? (
            <>
              <div className={styles.codeCard}>
                <div className={styles.codeLabelSmall}>KODE RUMAH KAMU</div>
                <div className={styles.codePrefix}>RUMAH</div>
                <div className={styles.codeChars}>{formatCode(joinCode.code)}</div>
                <div className={styles.codeTtl}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Berlaku 30 menit
                </div>
              </div>

              <button className={styles.btnCopy} onClick={handleCopyCode}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? 'Tersalin!' : 'Salin Kode'}
              </button>
            </>
          ) : (
            <div className={styles.codeCardEmpty}>
              {loading ? (
                <div className={styles.loadingDots}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : needsInit ? (
                <button className={styles.btnPrimary} onClick={handleStart}>
                  Mulai
                </button>
              ) : error ? (
                <>
                  <div className={styles.errorText}>{error}</div>
                  <button className={styles.btnSecondary} onClick={loadCode}>
                    Coba Lagi
                  </button>
                </>
              ) : null}
            </div>
          )}

          {joinCode && (
            <div className={styles.bottomActions}>
              <button className={styles.btnPrimary} onClick={() => setShareSheetOpen(true)}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Bagikan via WhatsApp
              </button>
              <button className={styles.btnGhost} onClick={loadCode} disabled={loading}>
                Buat Kode Baru
              </button>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp share bottom sheet */}
      <BottomSheet
        isOpen={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
        title="Bagikan via WhatsApp"
      >
        {joinCode && (
          <div className={styles.shareSheet}>
            <div className={styles.shareSectionLabel}>PRATINJAU PESAN</div>
            <div className={styles.sharePreview}>
              Hei! Aku undang kamu gabung ke profil SISA kita. Masuk SISA → ketuk{' '}
              <em>&ldquo;Gabung dengan Kode&rdquo;</em> → masukkan kode ini:{' '}
              <strong className={styles.shareCode}>{joinCode.code}</strong> Kode berlaku 30 menit
              ya!
            </div>

            <a
              className={styles.btnWhatsApp}
              href={`https://wa.me/?text=${buildWhatsAppText(joinCode.code)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareSheetOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Kirim via WhatsApp
            </a>

            <button className={styles.btnCopyMessage} onClick={handleCopyMessage}>
              {copied ? 'Tersalin!' : 'Salin Pesan'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
