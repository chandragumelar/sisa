import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './accountData.module.css'

export function HubungkanPasanganPage() {
  const navigate = useNavigate()
  const lang = useLanguage()
  const { status, profileId, profile, members, anonymousId, disconnect } = useSharedProfileCtx()
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  if (status === 'loading') return null

  const hasProfile = status === 'connected' || (status === 'solo' && !!profileId)
  const hasPartner = members.length > 1
  const noProfileYet = status === 'solo' && !profileId

  async function handleDisconnect() {
    setDisconnecting(true)
    await disconnect()
    navigate('/')
  }

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
        <div className={styles.title}>{t('pair.title', lang)}</div>
      </div>

      {/* Kondisi A — belum punya profil */}
      {noProfileYet && (
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
          <div className={styles.soloTitle}>{t('pair.gate_title', lang)}</div>
          <div className={styles.soloDesc}>{t('pair.gate_desc', lang)}</div>
          <button className={styles.btnPrimary} onClick={() => navigate('/kode-pemulihan')}>
            {t('pair.gate_cta', lang)}
          </button>
        </div>
      )}

      {/* Kondisi B — punya profil, belum punya pasangan */}
      {hasProfile && !hasPartner && (
        <div className={styles.soloState}>
          <div className={styles.soloSafeStatus}>
            <span className={styles.soloSafeDot} />
            <span className={styles.soloSafeLabel}>{t('pair.cloud_safe', lang)}</span>
          </div>
          <div className={styles.soloDivider} />
          <div className={styles.soloTitle}>{t('pair.title', lang)}</div>
          <div className={styles.soloDesc}>{t('pair.desc', lang)}</div>
          <button className={styles.btnPrimary} onClick={() => navigate('/ajak-pasangan')}>
            {t('pair.invite', lang)}
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/gabung-kode')}>
            {t('pair.join', lang)}
          </button>
        </div>
      )}

      {/* Kondisi C — terhubung dengan pasangan */}
      {hasPartner && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>{t('pair.connected_label', lang)}</div>
            <div className={styles.profileName}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {profile?.name ?? 'Profil Bersama'}
            </div>
            <div className={styles.memberCount}>
              {t('pair.device_active', lang).replace('{n}', String(members.length))}
            </div>

            <div className={styles.memberCards}>
              {members.map((member) => {
                const isMe = member.anonymous_id === anonymousId
                return (
                  <div
                    key={member.id}
                    className={`${styles.memberCard} ${isMe ? styles.memberCardMe : ''}`}
                  >
                    <div
                      className={`${styles.memberAvatar} ${isMe ? styles.memberAvatarMe : styles.memberAvatarPartner}`}
                    >
                      {member.display_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className={styles.memberName}>{member.display_name}</div>
                    <div className={styles.memberSub}>
                      {isMe ? t('pair.this_device', lang) : t('pair.partner_device', lang)}
                    </div>
                  </div>
                )
              })}
            </div>

            {members.length >= (profile?.max_devices ?? 2) && (
              <div className={styles.fullWarning}>
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
                <span>
                  {t('pair.full_warning', lang).replace('{n}', String(profile?.max_devices ?? 2))}
                </span>
              </div>
            )}

            <button className={styles.disconnectBtn} onClick={() => setConfirmDisconnect(true)}>
              {t('pair.disconnect', lang)}
            </button>
          </div>

          {confirmDisconnect && (
            <div className={styles.confirmOverlay} onClick={() => setConfirmDisconnect(false)}>
              <div className={styles.confirmSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmHandle} />
                <div className={styles.confirmTitle}>
                  {t('pair.disconnect_confirm_title', lang)}
                </div>
                <div className={styles.confirmDesc}>{t('pair.disconnect_confirm_desc', lang)}</div>
                <button
                  className={styles.btnDanger}
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? t('pair.disconnecting', lang) : t('pair.disconnect_yes', lang)}
                </button>
                <button className={styles.btnGhost} onClick={() => setConfirmDisconnect(false)}>
                  {t('common.cancel', lang)}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
