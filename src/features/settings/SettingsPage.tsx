import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings, patchSettings } from '@/db/settings.repository'
import { getLicense } from '@/db/license.repository'
import { getRecentTransactions } from '@/db/transactions.repository'
import { exportAllData, importAllData, clearAllData } from '@/db/backup.repository'
import { applyTheme } from '@/shared/utils/theme'
import type { Settings, LicenseRecord, Theme, Language } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import {
  buildBackupJSON,
  buildTransactionsCSV,
  parseBackupJSON,
  downloadFile,
} from './backup.utils'
import type { ImportPreview } from './backup.utils'
import styles from './SettingsPage.module.css'

interface PageData {
  settings: Settings
  license: LicenseRecord | undefined
}

export function SettingsPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<PageData | null>(null)
  const [importPreview, setImportPreview] = useState<{
    preview: ImportPreview
    json: string
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'type'>('idle')
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getLicense()]).then(([settings, license]) => {
      if (cancelled || !settings) return
      setData({ settings, license })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return null
  const { settings, license } = data

  async function handleThemeChange(theme: Theme) {
    await patchSettings({ theme })
    applyTheme(theme)
    setData((prev) => prev && { ...prev, settings: { ...prev.settings, theme } })
  }

  async function handleLanguageChange(language: Language) {
    await patchSettings({ language })
    setData((prev) => prev && { ...prev, settings: { ...prev.settings, language } })
  }

  async function handleExportJSON() {
    const data = await exportAllData(clock.now())
    const json = buildBackupJSON(data)
    const date = new Date(clock.now()).toISOString().split('T')[0]
    downloadFile(`sisa-backup-${date}.json`, json, 'application/json')
    await patchSettings({ lastExportedAt: clock.now() })
  }

  async function handleExportCSV() {
    const txs = await getRecentTransactions(10_000)
    const csv = buildTransactionsCSV(txs)
    const date = new Date(clock.now()).toISOString().split('T')[0]
    downloadFile(`sisa-transaksi-${date}.csv`, csv, 'text/csv')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const result = parseBackupJSON(json)
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      setImportPreview({ preview: result.preview, json })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleImportConfirm() {
    if (!importPreview) return
    const result = parseBackupJSON(importPreview.json)
    if (!result.ok) return
    await importAllData(result.data)
    setImportPreview(null)
    navigate('/')
  }

  async function handleDeleteConfirm() {
    if (deleteInput !== 'HAPUS') return
    await clearAllData()
    navigate('/onboarding')
  }

  const tierLabel = license?.tier === 'pro' ? 'Pro' : 'Basic'
  const daysLeft = license
    ? Math.max(0, Math.ceil((license.expiresAt - clock.now()) / 86_400_000))
    : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Kembali">
          ‹
        </button>
        <span className={styles.title}>setelan</span>
      </div>

      {/* Profile card */}
      <button className={styles.profileCard} onClick={() => navigate('/profil')}>
        <div className={styles.avatar}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className={styles.profileText}>
          <div className={styles.profileName}>SISA · {tierLabel}</div>
          <div className={styles.profileSub}>
            {tierLabel} aktif · {daysLeft} hari lagi
          </div>
        </div>
        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Tampilan */}
      <div className={styles.sectionLabel}>tampilan</div>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>tema</span>
          <div className={styles.segmented}>
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button
                key={t}
                className={`${styles.seg} ${settings.theme === t ? styles.segActive : ''}`}
                onClick={() => handleThemeChange(t)}
              >
                {t === 'light' ? 'terang' : t === 'dark' ? 'gelap' : 'sistem'}
              </button>
            ))}
          </div>
        </div>
        {settings.theme === 'dark' && (
          <div className={styles.rowNote}>gelap = v2 · belum tersedia</div>
        )}
        <div className={styles.divider} />
        <div className={styles.row}>
          <span className={styles.rowLabel}>bahasa</span>
          <select
            className={styles.select}
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Data & Backup */}
      <div className={styles.sectionLabel}>data & backup</div>
      <div className={styles.card}>
        <button className={styles.actionRow} onClick={handleExportJSON}>
          <span className={styles.rowLabel}>export backup</span>
          <span className={styles.rowSub}>file lengkap buat pindah / restore</span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={handleExportCSV}>
          <span className={styles.rowLabel}>export transaksi</span>
          <span className={styles.rowSub}>buat dibuka di spreadsheet</span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={() => fileInputRef.current?.click()}>
          <span className={styles.rowLabel}>import dari backup</span>
          <span className={styles.rowSub}>restore dari file .json</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className={styles.hiddenInput}
          onChange={handleFileSelect}
        />
        <div className={styles.divider} />
        <button
          className={`${styles.actionRow} ${styles.dangerRow}`}
          onClick={() => setDeleteStep('confirm')}
        >
          <span className={styles.rowLabel}>hapus semua data</span>
          <span className={styles.rowSub}>tidak bisa di-undo</span>
        </button>
      </div>

      {/* Panduan */}
      <div className={styles.sectionLabel}>panduan</div>
      <div className={styles.card}>
        <a
          className={styles.linkRow}
          href="https://twitter.com/win32_icang"
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.rowLabel}>kontak</span>
          <span className={styles.rowSub}>@win32_icang</span>
        </a>
      </div>

      {/* Import preview sheet */}
      <BottomSheet
        isOpen={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Import backup"
      >
        {importPreview && (
          <div className={styles.sheetBody}>
            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.walletCount}</span>
                <span className={styles.previewKey}>dompet</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.txCount}</span>
                <span className={styles.previewKey}>transaksi</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.tagihanCount}</span>
                <span className={styles.previewKey}>tagihan</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.goalCount}</span>
                <span className={styles.previewKey}>goal</span>
              </div>
            </div>
            <div className={styles.sheetWarning}>
              Data yang ada sekarang akan ditimpa. Tidak bisa di-undo.
            </div>
            <button className={styles.primaryBtn} onClick={handleImportConfirm}>
              Restore sekarang
            </button>
            <button className={styles.ghostBtn} onClick={() => setImportPreview(null)}>
              Batal
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Import error sheet */}
      <BottomSheet isOpen={!!importError} onClose={() => setImportError(null)} title="Gagal import">
        <div className={styles.sheetBody}>
          <div className={styles.errorText}>{importError}</div>
          <button className={styles.ghostBtn} onClick={() => setImportError(null)}>
            Tutup
          </button>
        </div>
      </BottomSheet>

      {/* Delete confirm sheet */}
      <BottomSheet
        isOpen={deleteStep !== 'idle'}
        onClose={() => {
          setDeleteStep('idle')
          setDeleteInput('')
        }}
        title="Hapus semua data"
      >
        <div className={styles.sheetBody}>
          {deleteStep === 'confirm' ? (
            <>
              <div className={styles.sheetWarning}>
                Semua transaksi, wallet, tagihan, dan goal akan dihapus permanen. Lisensi tetap
                tersimpan.
              </div>
              <button className={styles.dangerBtn} onClick={() => setDeleteStep('type')}>
                Lanjut hapus
              </button>
              <button className={styles.ghostBtn} onClick={() => setDeleteStep('idle')}>
                Batal
              </button>
            </>
          ) : (
            <>
              <div className={styles.deletePrompt}>
                Ketik <strong>HAPUS</strong> untuk konfirmasi
              </div>
              <input
                className={styles.deleteInput}
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="HAPUS"
                autoFocus
              />
              <button
                className={styles.dangerBtn}
                disabled={deleteInput !== 'HAPUS'}
                onClick={handleDeleteConfirm}
              >
                Hapus semua data
              </button>
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setDeleteStep('idle')
                  setDeleteInput('')
                }}
              >
                Batal
              </button>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
