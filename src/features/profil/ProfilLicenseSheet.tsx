import { useState } from 'react'
import { useClock } from '@/app/providers/useClock'
import { activateLicense } from '@/features/license/license.utils'
import type { LicenseRecord } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t, toLocale } from '@/shared/strings/strings'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  license: LicenseRecord | undefined
  nowMs: number
  onUpdate: () => Promise<void>
}

export function ProfilLicenseSheet({ isOpen, onClose, license, nowMs, onUpdate }: Props) {
  const lang = useLanguage()
  const clock = useClock()
  const [keyInput, setKeyInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'invalid'>('idle')

  async function handleActivate() {
    if (!keyInput.trim()) return
    setStatus('loading')
    const result = await activateLicense(keyInput.trim(), clock)
    if (result.ok) {
      setStatus('success')
      setKeyInput('')
      await onUpdate()
    } else {
      setStatus(result.reason)
    }
  }

  const daysLeft = license ? Math.max(0, Math.ceil((license.expiresAt - nowMs) / 86_400_000)) : 0
  const expiresDate = license
    ? new Date(license.expiresAt).toLocaleDateString(toLocale(lang), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('profil.license_title', lang)}>
      <div className={styles.sheetForm}>
        {license && (
          <div className={styles.licenseCard}>
            <div className={styles.licenseRow}>
              <span className={styles.licenseKey}>{t('profil.license_status_label', lang)}</span>
              <span className={styles.statusBadge}>{t('profil.license_active', lang)}</span>
            </div>
            <div className={styles.licenseRow}>
              <span className={styles.licenseKey}>{t('profil.license_expires_label', lang)}</span>
              <span className={styles.licenseVal}>
                {t('profil.license_days_left', lang)
                  .replace('{n}', String(daysLeft))
                  .replace('{date}', expiresDate ?? '')}
              </span>
            </div>
          </div>
        )}
        {!license && <div className={styles.emptyNote}>{t('profil.license_not_active', lang)}</div>}

        <div className={styles.fieldLabel}>
          {license ? t('profil.license_change', lang) : t('profil.license_enter', lang)}
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder="xxxxx.xxxxx"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value.trim())}
        />
        {status === 'invalid' && (
          <div className={styles.errorMsg}>{t('profil.license_err_invalid', lang)}</div>
        )}
        {status === 'success' && (
          <div className={styles.successMsg}>{t('profil.license_success', lang)}</div>
        )}

        <button
          className={styles.primaryBtn}
          onClick={handleActivate}
          disabled={!keyInput || status === 'loading'}
        >
          {status === 'loading'
            ? t('profil.license_verifying', lang)
            : t('profil.license_activate', lang)}
        </button>

        <div className={styles.fieldLabel}>{t('profil.license_buy_label', lang)}</div>
        <a
          className={styles.buyLink}
          href="https://clicky.me/sisa"
          target="_blank"
          rel="noreferrer"
        >
          Beli di Clicky (IDR) ↗
        </a>
        <a
          className={styles.buyLink}
          href="https://sisa.gumroad.com"
          target="_blank"
          rel="noreferrer"
        >
          Beli di Gumroad (USD) ↗
        </a>
      </div>
    </BottomSheet>
  )
}
