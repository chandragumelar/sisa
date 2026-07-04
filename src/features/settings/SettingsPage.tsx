import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { useLanguage, useSetLanguage } from '@/app/providers/useLanguage'
import { getSettings, patchSettings } from '@/db/settings.repository'
import { getLicense } from '@/db/license.repository'
import { getRecentTransactions } from '@/db/transactions.repository'
import { clearAllData } from '@/db/backup.repository'
import { applyTheme } from '@/shared/utils/theme'
import { applyLanguage } from '@/shared/utils/language'
import type { Settings, LicenseRecord, Theme, Language } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { CurrencyPickerSheet } from '@/shared/components/CurrencyPickerSheet'
import type { Currency } from '@/constants/currencies'
import { ProfilIncomeSheet } from '@/features/profil/ProfilIncomeSheet'
import { ProfilLicenseSheet } from '@/features/profil/ProfilLicenseSheet'
import { ManageCategoriesSheet } from '@/features/category/ManageCategoriesSheet'
import { t, toLocale } from '@/shared/strings/strings'
import { useSharedProfileCtx } from '@/features/shared-profile/SharedProfileContext'
import { buildTransactionsCSV, downloadFile } from './backup.utils'
import { collectSnapshot, applySnapshot } from '@/db/snapshot.repository'
import { parseSnapshot } from '@/db/snapshot.serializer'
import type { SnapshotPreview } from '@/db/snapshot.serializer'
import { BRAND_STUDIO_WITH_COLLAB, BRAND_TWITTER, BRAND_EMAIL } from '@/constants/brand'
import styles from './SettingsPage.module.css'

interface PageData {
  settings: Settings
  license: LicenseRecord | undefined
}

export function SettingsPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const lang = useLanguage()
  const setLang = useSetLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { status, profileId } = useSharedProfileCtx()
  const hasProfile = status === 'connected' || (status === 'solo' && !!profileId)
  const [data, setData] = useState<PageData | null>(null)
  const [activeSheet, setActiveSheet] = useState<'income' | 'license' | 'categories' | null>(null)
  const [importPreview, setImportPreview] = useState<{
    preview: SnapshotPreview
    json: string
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'type'>('idle')
  const [deleteInput, setDeleteInput] = useState('')
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [settings, license] = await Promise.all([getSettings(), getLicense()])
    if (settings) setData({ settings, license })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!data) return null
  const { settings, license } = data

  async function handleThemeChange(theme: Theme) {
    await patchSettings({ theme })
    applyTheme(theme)
    setData((prev) => prev && { ...prev, settings: { ...prev.settings, theme } })
  }

  async function handleLanguageChange(language: Language) {
    await patchSettings({ language })
    applyLanguage(language)
    setLang(language)
    setData((prev) => prev && { ...prev, settings: { ...prev.settings, language } })
  }

  function handleCurrencyPick(c: Currency) {
    setCurrencyPickerOpen(false)
    setPendingCurrency(c.code)
  }

  async function handleCurrencyConfirm() {
    if (!pendingCurrency) return
    await patchSettings({ primaryCurrency: pendingCurrency })
    setData(
      (prev) =>
        prev && { ...prev, settings: { ...prev.settings, primaryCurrency: pendingCurrency } },
    )
    setPendingCurrency(null)
  }

  async function handleExportJSON() {
    const snap = await collectSnapshot(nowMs)
    const json = JSON.stringify(snap, null, 2)
    const date = new Date(nowMs).toISOString().split('T')[0]
    downloadFile(`sisa-backup-${date}.json`, json, 'application/json')
    await patchSettings({ lastExportedAt: nowMs })
  }

  async function handleExportCSV() {
    const txs = await getRecentTransactions(10_000)
    const csv = buildTransactionsCSV(txs)
    const date = new Date(nowMs).toISOString().split('T')[0]
    downloadFile(`sisa-transaksi-${date}.csv`, csv, 'text/csv')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const result = parseSnapshot(json)
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
    const result = parseSnapshot(importPreview.json)
    if (!result.ok) return
    await applySnapshot(result.data, clock)
    setImportPreview(null)
    navigate('/')
  }

  async function handleDeleteConfirm() {
    if (deleteInput !== t('settings.delete_type_word', lang)) return
    await clearAllData()
    navigate('/onboarding')
  }

  const nowMs = clock.now()
  const daysLeft = license ? Math.max(0, Math.ceil((license.expiresAt - nowMs) / 86_400_000)) : 0
  const expiresDate = license
    ? new Date(license.expiresAt).toLocaleDateString(toLocale(lang), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null
  const deleteWord = t('settings.delete_type_word', lang)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('settings.back_aria', lang)}
        >
          ‹
        </button>
        <span className={styles.title}>{t('settings.title', lang)}</span>
      </div>

      {/* License card */}
      <button className={styles.licenseCard} onClick={() => setActiveSheet('license')}>
        <div className={styles.licenseTop}>
          <div className={styles.licenseLeft}>
            <div className={styles.licenseEyebrow}>{t('profil.license_title', lang)}</div>
            <div className={styles.licenseName}>SISA</div>
            <div className={styles.licenseSub}>
              {expiresDate
                ? t('profil.license_days_left', lang)
                    .replace('{n}', String(daysLeft))
                    .replace('{date}', expiresDate)
                : t('profil.license_not_active', lang)}
            </div>
          </div>
          {license && (
            <span className={styles.licenseChip}>{t('profil.license_active', lang)}</span>
          )}
        </div>
      </button>

      {/* Profil */}
      <div className={styles.sectionLabel}>{t('settings.section_profil', lang)}</div>
      <div className={styles.card}>
        <button className={styles.actionRow} onClick={() => setActiveSheet('income')}>
          <span className={styles.rowLabel}>{t('settings.row_income', lang)}</span>
          <span className={styles.rowSub}>{t('settings.row_income_sub', lang)}</span>
        </button>
        <button className={styles.actionRow} onClick={() => setActiveSheet('categories')}>
          <span className={styles.rowLabel}>{t('settings.row_categories', lang)}</span>
          <span className={styles.rowSub}>{t('settings.row_categories_sub', lang)}</span>
        </button>
      </div>

      {/* Tampilan */}
      <div className={styles.sectionLabel}>{t('settings.section_tampilan', lang)}</div>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('settings.row_theme', lang)}</span>
          <div className={styles.segmented}>
            {(['light', 'dark', 'system'] as Theme[]).map((th) => (
              <button
                key={th}
                className={`${styles.seg} ${settings.theme === th ? styles.segActive : ''}`}
                onClick={() => handleThemeChange(th)}
              >
                {th === 'light'
                  ? t('settings.theme_light', lang)
                  : th === 'dark'
                    ? t('settings.theme_dark', lang)
                    : t('settings.theme_system', lang)}
              </button>
            ))}
          </div>
        </div>
        {settings.theme === 'dark' && (
          <div className={styles.rowNote}>{t('settings.dark_note', lang)}</div>
        )}
        <div className={styles.divider} />
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('settings.row_language', lang)}</span>
          <select
            className={styles.select}
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={() => setCurrencyPickerOpen(true)}>
          <div>
            <span className={styles.rowLabel}>{t('settings.row_patokan_currency', lang)}</span>
            <div className={styles.rowSub}>{t('settings.row_patokan_currency_sub', lang)}</div>
          </div>
          <span className={styles.rowSub}>{settings.primaryCurrency}</span>
        </button>
      </div>

      {/* Akun & Data */}
      <div className={styles.sectionLabel}>{t('settings.section_sharing_label', lang)}</div>
      <div className={styles.card}>
        <button className={styles.actionRow} onClick={() => navigate('/hubungkan-pasangan')}>
          <span className={styles.rowLabel}>{t('settings.row_pair', lang)}</span>
          <span className={styles.rowSub}>
            {status === 'connected'
              ? t('settings.row_pair_sub_connected', lang)
              : t('settings.row_pair_sub_solo', lang)}
          </span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={() => navigate('/kode-pemulihan')}>
          <span className={styles.rowLabel}>
            {hasProfile ? t('settings.row_recovery', lang) : t('settings.row_secure', lang)}
          </span>
          <span className={styles.rowSub}>
            {hasProfile ? t('settings.row_recovery_sub', lang) : t('settings.row_secure_sub', lang)}
          </span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={() => navigate('/pulihkan')}>
          <span className={styles.rowLabel}>{t('settings.row_recover', lang)}</span>
          <span className={styles.rowSub}>{t('settings.row_recover_sub', lang)}</span>
        </button>
      </div>

      {/* Data & Backup */}
      <div className={styles.sectionLabel}>{t('settings.section_data', lang)}</div>
      <div className={styles.card}>
        <button className={styles.actionRow} onClick={handleExportJSON}>
          <span className={styles.rowLabel}>{t('settings.export_json', lang)}</span>
          <span className={styles.rowSub}>{t('settings.export_json_sub', lang)}</span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={handleExportCSV}>
          <span className={styles.rowLabel}>{t('settings.export_csv', lang)}</span>
          <span className={styles.rowSub}>{t('settings.export_csv_sub', lang)}</span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionRow} onClick={() => fileInputRef.current?.click()}>
          <span className={styles.rowLabel}>{t('settings.import', lang)}</span>
          <span className={styles.rowSub}>{t('settings.import_sub', lang)}</span>
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
          <span className={styles.rowLabel}>{t('settings.delete', lang)}</span>
          <span className={styles.rowSub}>{t('settings.delete_sub', lang)}</span>
        </button>
      </div>

      {/* Tentang */}
      <div className={styles.sectionLabel}>{t('settings.section_about', lang)}</div>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('settings.made_by', lang)}</span>
          <span className={styles.rowSub}>{BRAND_STUDIO_WITH_COLLAB}</span>
        </div>
        <div className={styles.divider} />
        <a
          className={styles.linkRow}
          href={`https://twitter.com/${BRAND_TWITTER.replace('@', '')}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.rowLabel}>{t('settings.contact', lang)}</span>
          <span className={styles.rowSub}>{BRAND_TWITTER}</span>
        </a>
        <div className={styles.divider} />
        <a
          className={styles.linkRow}
          href={`mailto:${BRAND_EMAIL}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.rowLabel}>{t('settings.email', lang)}</span>
          <span className={styles.rowSub}>{BRAND_EMAIL}</span>
        </a>
      </div>

      {/* Profil sheets */}
      {data && (
        <ProfilIncomeSheet
          isOpen={activeSheet === 'income'}
          onClose={() => setActiveSheet(null)}
          settings={data.settings}
          nowMs={nowMs}
          onUpdate={loadData}
        />
      )}
      <ProfilLicenseSheet
        isOpen={activeSheet === 'license'}
        onClose={() => setActiveSheet(null)}
        license={data?.license}
        nowMs={nowMs}
        onUpdate={loadData}
      />
      <ManageCategoriesSheet
        isOpen={activeSheet === 'categories'}
        onClose={() => setActiveSheet(null)}
      />

      {/* Import preview sheet */}
      <BottomSheet
        isOpen={!!importPreview}
        onClose={() => setImportPreview(null)}
        title={t('settings.import_preview_title', lang)}
      >
        {importPreview && (
          <div className={styles.sheetBody}>
            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.walletCount}</span>
                <span className={styles.previewKey}>
                  {t('settings.import_preview_wallets', lang)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.txCount}</span>
                <span className={styles.previewKey}>{t('settings.import_preview_txs', lang)}</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.tagihanCount}</span>
                <span className={styles.previewKey}>
                  {t('settings.import_preview_bills', lang)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.goalCount}</span>
                <span className={styles.previewKey}>
                  {t('settings.import_preview_goals', lang)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>
                  {importPreview.preview.customCategoryCount}
                </span>
                <span className={styles.previewKey}>
                  {t('settings.import_preview_categories', lang)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewVal}>{importPreview.preview.scenarioCount}</span>
                <span className={styles.previewKey}>
                  {t('settings.import_preview_scenarios', lang)}
                </span>
              </div>
              {importPreview.preview.hasLicense && (
                <div className={styles.previewItem}>
                  <span className={styles.previewVal}>✓</span>
                  <span className={styles.previewKey}>
                    {t('settings.import_preview_license', lang)}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.sheetWarning}>{t('settings.import_warning', lang)}</div>
            <button className={styles.primaryBtn} onClick={handleImportConfirm}>
              {t('settings.import_confirm', lang)}
            </button>
            <button className={styles.ghostBtn} onClick={() => setImportPreview(null)}>
              {t('common.cancel', lang)}
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Import error sheet */}
      <BottomSheet
        isOpen={!!importError}
        onClose={() => setImportError(null)}
        title={t('settings.import_error_title', lang)}
      >
        <div className={styles.sheetBody}>
          <div className={styles.errorText}>{importError}</div>
          <button className={styles.ghostBtn} onClick={() => setImportError(null)}>
            {t('common.close', lang)}
          </button>
        </div>
      </BottomSheet>

      {/* Currency warning sheet */}
      <BottomSheet
        isOpen={pendingCurrency !== null}
        onClose={() => setPendingCurrency(null)}
        title={t('settings.currency_warning_title', lang)}
      >
        <div className={styles.sheetBody}>
          <div className={styles.sheetWarning}>{t('settings.currency_warning_body', lang)}</div>
          <button className={styles.primaryBtn} onClick={handleCurrencyConfirm}>
            {t('common.confirm', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setPendingCurrency(null)}>
            {t('common.cancel', lang)}
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
        title={t('settings.delete_title', lang)}
      >
        <div className={styles.sheetBody}>
          {deleteStep === 'confirm' ? (
            <>
              <div className={styles.sheetWarning}>{t('settings.delete_warning', lang)}</div>
              <button className={styles.dangerBtn} onClick={() => setDeleteStep('type')}>
                {t('settings.delete_next', lang)}
              </button>
              <button className={styles.ghostBtn} onClick={() => setDeleteStep('idle')}>
                {t('common.cancel', lang)}
              </button>
            </>
          ) : (
            <>
              <div className={styles.deletePrompt}>
                {(() => {
                  const parts = t('settings.delete_type_prompt', lang).split(deleteWord)
                  return (
                    <>
                      {parts[0]}
                      <strong>{deleteWord}</strong>
                      {parts[1]}
                    </>
                  )
                })()}
              </div>
              <input
                className={styles.deleteInput}
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={t('settings.delete_type_placeholder', lang)}
                autoFocus
              />
              <button
                className={styles.dangerBtn}
                disabled={deleteInput !== deleteWord}
                onClick={handleDeleteConfirm}
              >
                {t('settings.delete_confirm_btn', lang)}
              </button>
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setDeleteStep('idle')
                  setDeleteInput('')
                }}
              >
                {t('common.cancel', lang)}
              </button>
            </>
          )}
        </div>
      </BottomSheet>
      {currencyPickerOpen && (
        <CurrencyPickerSheet
          onSelect={handleCurrencyPick}
          onDismiss={() => setCurrencyPickerOpen(false)}
          excludeCode={settings.primaryCurrency}
        />
      )}
    </div>
  )
}
