import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from '../SharedProfileContext'
import styles from './BerbagiKeamananSection.module.css'

export function BerbagiKeamananSection() {
  const navigate = useNavigate()
  const { status, profile, partnerName } = useSharedProfileCtx()

  return (
    <div className={styles.card}>
      <div className={styles.label}>AKUN &amp; DATA</div>
      <button className={styles.statusRow} onClick={() => navigate('/berbagi-keamanan')}>
        {status === 'connected' ? (
          <>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>
              {profile?.name ?? partnerName ?? 'Terhubung'} · terhubung
            </span>
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--signal-caution)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className={styles.statusText}>Data belum diamankan</span>
          </>
        )}
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
  )
}
