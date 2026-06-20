import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from '../SharedProfileContext'
import styles from './BerbagiKeamananSection.module.css'

const BANNER_DISMISS_KEY = 'sisa:amankanBannerDismissedAt'
const BANNER_RESNOOZE_DAYS = 7

function shouldShowBanner(status: string): boolean {
  if (status !== 'solo') return false
  const raw = localStorage.getItem(BANNER_DISMISS_KEY)
  if (!raw) return true
  const diff = Date.now() - parseInt(raw, 10)
  return diff > BANNER_RESNOOZE_DAYS * 86_400_000
}

export function BerbagiKeamananSection() {
  const navigate = useNavigate()
  const { status, profile, partnerName } = useSharedProfileCtx()

  const showBanner = shouldShowBanner(status)

  function dismissBanner() {
    localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()))
    // Force re-render via navigation trick — simpler than local state
    window.dispatchEvent(new Event('sisa:banner-dismissed'))
  }

  return (
    <>
      {showBanner && (
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-caution)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <div className={styles.bannerTitle}>Amankan data kamu</div>
              <div className={styles.bannerDesc}>
                Hubungkan HP-mu agar data tidak hilang jika ganti perangkat.
              </div>
            </div>
          </div>
          <button className={styles.bannerDismiss} onClick={dismissBanner} aria-label="Tutup">
            ×
          </button>
          <button className={styles.bannerCta} onClick={() => navigate('/ajak-pasangan')}>
            Siapkan Sekarang
          </button>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.label}>BERBAGI &amp; KEAMANAN</div>

        {status === 'connected' && (
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span>Profil Bersama: {profile?.name ?? partnerName ?? 'Terhubung'}</span>
          </div>
        )}

        <button className={styles.row} onClick={() => navigate('/ajak-pasangan')}>
          <div className={styles.rowIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.rowBody}>
            <div className={styles.rowTitle}>Ajak Pasangan</div>
            <div className={styles.rowSub}>Kelola keuangan bersama</div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className={styles.divider} />

        <button className={styles.row} onClick={() => navigate('/berbagi-keamanan')}>
          <div className={`${styles.rowIcon} ${styles.rowIconGreen}`}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.rowBody}>
            <div className={styles.rowTitle}>Amankan Data</div>
            <div className={styles.rowSub}>
              {status === 'connected' ? 'Data terlindungi • terhubung' : 'Hubungkan nomor HP-mu'}
            </div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </>
  )
}
