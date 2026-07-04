import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './accountData.module.css'

export function KodePemulihanPage() {
  const navigate = useNavigate()
  const lang = useLanguage()
  const { status, profileId, createProfile, regenerateRecovery } = useSharedProfileCtx()

  const [securing, setSecuring] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (status === 'loading') return null

  const hasProfile = status === 'connected' || (status === 'solo' && !!profileId)
  const noProfileYet = status === 'solo' && !profileId

  async function handleAmankan() {
    setErr(null)
    setSecuring(true)
    const r = await createProfile('Rumah Kita', 'Pengguna')
    setSecuring(false)
    if (r.ok && r.recoveryCode) {
      setNewCode(r.recoveryCode)
    } else {
      setErr(t('recovery.secure_error', lang))
    }
  }

  async function handleRegen() {
    setErr(null)
    setRegenLoading(true)
    const r = await regenerateRecovery()
    setRegenLoading(false)
    setShowConfirm(false)
    if ('raw' in r) {
      setNewCode(r.raw)
    } else {
      setErr(t('recovery.regen_error', lang))
    }
  }

  async function handleCopy() {
    if (!newCode) return
    await navigator.clipboard.writeText(newCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pageTitle = hasProfile ? t('recovery.title_regen', lang) : t('recovery.title_secure', lang)

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
        <div className={styles.title}>{pageTitle}</div>
      </div>

      {/* Wajah A — belum punya profil */}
      {noProfileYet && !newCode && (
        <div className={styles.soloState}>
          <div className={styles.soloIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-caution)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.soloTitle}>{t('recovery.secure_title', lang)}</div>
          <div className={styles.soloDesc}>{t('recovery.secure_desc', lang)}</div>
          {err && <div className={styles.regenErrorText}>{err}</div>}
          <button className={styles.btnPrimary} onClick={handleAmankan} disabled={securing}>
            {securing ? '...' : t('recovery.secure_cta', lang)}
          </button>
        </div>
      )}

      {/* Wajah B — punya profil, belum ada newCode */}
      {hasProfile && !newCode && (
        <div className={styles.soloState}>
          <div className={styles.soloIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-safe)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.securityRow}>
            <div className={styles.securityText}>{t('recovery.protected', lang)}</div>
          </div>
          <div className={styles.securityHint}>{t('recovery.regen_hint', lang)}</div>
          {err && <div className={styles.regenErrorText}>{err}</div>}
          <button className={styles.regenTriggerBtn} onClick={() => setShowConfirm(true)}>
            {t('recovery.regen_cta', lang)}
          </button>
        </div>
      )}

      {/* Wajah C — kode baru tersedia (shared success) */}
      {newCode && (
        <div className={styles.soloState}>
          <div className={styles.regenCodeBox}>
            <div className={styles.regenCodeLabel}>{t('recovery.code_label', lang)}</div>
            <div className={styles.regenCodeValue}>{newCode}</div>
          </div>
          <div className={styles.securityHint}>{t('recovery.code_warning', lang)}</div>
          <button className={styles.btnSecondary} onClick={handleCopy}>
            {copied ? t('recovery.copied', lang) : t('recovery.copy', lang)}
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(-1)}>
            {t('recovery.done', lang)}
          </button>
        </div>
      )}

      {/* Overlay konfirmasi buat ulang */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHandle} />
            <div className={styles.confirmTitle}>{t('recovery.regen_confirm_title', lang)}</div>
            <div className={styles.confirmDesc}>{t('recovery.regen_confirm_desc', lang)}</div>
            <button className={styles.btnPrimary} onClick={handleRegen} disabled={regenLoading}>
              {regenLoading ? '...' : t('recovery.regen_yes', lang)}
            </button>
            <button className={styles.btnGhost} onClick={() => setShowConfirm(false)}>
              {t('common.cancel', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
