import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings } from '@/db/settings.repository'
import { getLicense } from '@/db/license.repository'
import type { Settings, LicenseRecord } from '@/db/database'
import { ProfilIncomeSheet } from './ProfilIncomeSheet'
import { ProfilLicenseSheet } from './ProfilLicenseSheet'
import styles from './ProfilPage.module.css'

interface PageData {
  settings: Settings
  license: LicenseRecord | undefined
}

type ActiveSheet = 'income' | 'license' | null

export function ProfilPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const nowMs = clock.now()

  const [data, setData] = useState<PageData | null>(null)
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)

  async function loadData() {
    const [settings, license] = await Promise.all([getSettings(), getLicense()])
    if (!settings) return
    setData({ settings, license })
  }

  useEffect(() => {
    loadData()
    // loadData is defined in component scope and stable; nowMs is the real dep
  }, [nowMs])

  if (!data) return null
  const { settings, license } = data
  const tier = license?.tier === 'pro' ? 'Pro' : 'Basic'
  const daysLeft = license ? Math.max(0, Math.ceil((license.expiresAt - nowMs) / 86_400_000)) : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Kembali">
          ‹
        </button>
        <span className={styles.title}>profil</span>
      </div>

      <div className={styles.userCard}>
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
        <div>
          <div className={styles.userName}>SISA</div>
          <div className={styles.userSub}>
            <span className={styles.tierBadge}>{tier}</span>
            {license && <span>aktif · {daysLeft} hari lagi</span>}
          </div>
        </div>
      </div>

      <NavRow
        label="profil keuangan"
        sub={`${settings.incomeType} · gajian tgl ${settings.incomeDay ?? '—'}`}
        onClick={() => setActiveSheet('income')}
      />

      <div className={styles.sectionLabel}>lisensi</div>
      <NavRow
        label="status lisensi"
        sub={license ? `${tier} · ${daysLeft} hari lagi` : 'Belum diaktifkan'}
        onClick={() => setActiveSheet('license')}
      />

      <ProfilIncomeSheet
        isOpen={activeSheet === 'income'}
        onClose={() => setActiveSheet(null)}
        settings={settings}
        nowMs={nowMs}
        onUpdate={loadData}
      />
      <ProfilLicenseSheet
        isOpen={activeSheet === 'license'}
        onClose={() => setActiveSheet(null)}
        license={license}
        nowMs={nowMs}
        onUpdate={loadData}
      />
    </div>
  )
}

function NavRow({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button className={styles.navRow} onClick={onClick}>
      <div className={styles.navBody}>
        <span className={styles.navLabel}>{label}</span>
        <span className={styles.navSub}>{sub}</span>
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
  )
}
