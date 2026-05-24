import { useState } from 'react'
import { useClock } from '@/app/providers/useClock'
import { activateLicense } from '@/features/license/license.utils'
import type { LicenseRecord } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  license: LicenseRecord | undefined
  nowMs: number
  onUpdate: () => Promise<void>
}

export function ProfilLicenseSheet({ isOpen, onClose, license, nowMs, onUpdate }: Props) {
  const clock = useClock()
  const [keyInput, setKeyInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'invalid' | 'expired'>(
    'idle',
  )

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
    ? new Date(license.expiresAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Lisensi">
      <div className={styles.sheetForm}>
        {license && (
          <div className={styles.licenseCard}>
            <div className={styles.licenseRow}>
              <span className={styles.licenseKey}>status</span>
              <span className={styles.tierBadge}>aktif</span>
            </div>
            <div className={styles.licenseRow}>
              <span className={styles.licenseKey}>masa aktif</span>
              <span className={styles.licenseVal}>
                {daysLeft} hari lagi · s/d {expiresDate}
              </span>
            </div>
          </div>
        )}
        {!license && <div className={styles.emptyNote}>Lisensi belum diaktifkan.</div>}

        <div className={styles.fieldLabel}>
          {license ? 'Ganti kode lisensi' : 'Masukkan kode lisensi'}
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder="xxxxx.xxxxx"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value.trim())}
        />
        {status === 'invalid' && (
          <div className={styles.errorMsg}>Kode tidak valid atau tanda tangan tidak cocok.</div>
        )}
        {status === 'expired' && <div className={styles.errorMsg}>Kode sudah kadaluarsa.</div>}
        {status === 'success' && (
          <div className={styles.successMsg}>Lisensi berhasil diaktifkan!</div>
        )}

        <button
          className={styles.primaryBtn}
          onClick={handleActivate}
          disabled={!keyInput || status === 'loading'}
        >
          {status === 'loading' ? 'Memverifikasi…' : 'Aktifkan'}
        </button>

        <div className={styles.fieldLabel}>perpanjang / beli baru</div>
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
