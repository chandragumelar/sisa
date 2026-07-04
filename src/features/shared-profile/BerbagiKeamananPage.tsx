import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSharedProfileCtx } from './SharedProfileContext'
import styles from './BerbagiKeamananPage.module.css'

export function BerbagiKeamananPage() {
  const navigate = useNavigate()
  const {
    status,
    profile,
    profileId,
    members,
    anonymousId,
    disconnect,
    regenerateRecovery,
    createProfile,
  } = useSharedProfileCtx()
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  const [showRegenConfirm, setShowRegenConfirm] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenCode, setRegenCode] = useState<string | null>(null)
  const [regenError, setRegenError] = useState<string | null>(null)
  const [regenCopied, setRegenCopied] = useState(false)

  const [securing, setSecuring] = useState(false)
  const [secureError, setSecureError] = useState<string | null>(null)

  async function handleDisconnect() {
    setDisconnecting(true)
    await disconnect()
    navigate('/')
  }

  async function handleRegenConfirm() {
    setRegenLoading(true)
    setRegenError(null)
    const result = await regenerateRecovery()
    setRegenLoading(false)
    if ('raw' in result) {
      setRegenCode(result.raw)
    } else {
      setRegenError('Gagal membuat ulang kode. Coba lagi.')
    }
  }

  function handleCloseRegen() {
    setShowRegenConfirm(false)
    setRegenCode(null)
    setRegenError(null)
    setRegenCopied(false)
  }

  function handleCopyRegenCode() {
    if (!regenCode) return
    navigator.clipboard.writeText(regenCode).then(() => {
      setRegenCopied(true)
      setTimeout(() => setRegenCopied(false), 2000)
    })
  }

  async function handleAmankanData() {
    setSecuring(true)
    setSecureError(null)
    const result = await createProfile('Rumah Kita', 'Pengguna')
    setSecuring(false)
    if (result.ok && result.recoveryCode) {
      setRegenCode(result.recoveryCode)
      setShowRegenConfirm(true)
    } else {
      setSecureError('Gagal mengamankan data. Coba lagi.')
    }
  }

  if (status === 'loading') return null

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
        <div className={styles.title}>Berbagi &amp; Keamanan</div>
      </div>

      {status === 'connected' && (
        <>
          {/* Connected profile card */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>PROFIL TERHUBUNG</div>
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
            <div className={styles.memberCount}>{members.length} perangkat aktif</div>

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
                      {isMe ? 'Perangkat ini' : 'Perangkat partner'}
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
                  Maksimal {profile?.max_devices ?? 2} perangkat. Untuk menambah perangkat lain,
                  putuskan salah satu dulu.
                </span>
              </div>
            )}

            <button className={styles.disconnectBtn} onClick={() => setConfirmDisconnect(true)}>
              Putuskan koneksi...
            </button>
          </div>

          {/* Security section */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>KODE PEMULIHAN</div>
            <div className={styles.securityRow}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--signal-safe)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className={styles.securityText}>Profil terlindungi via kode pemulihan</span>
            </div>
            <div className={styles.securityHint}>
              Jika ganti HP, buka SISA dan pilih &ldquo;Pulihkan Profil Lama&rdquo; lalu masukkan
              kode yang sudah kamu simpan.
            </div>
            <button className={styles.regenTriggerBtn} onClick={() => setShowRegenConfirm(true)}>
              Buat Ulang Kode Pemulihan
            </button>
          </div>

          {/* Disconnect confirmation overlay */}
          {confirmDisconnect && (
            <div className={styles.confirmOverlay} onClick={() => setConfirmDisconnect(false)}>
              <div className={styles.confirmSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmHandle} />
                <div className={styles.confirmTitle}>Putuskan koneksi?</div>
                <div className={styles.confirmDesc}>
                  Perangkat ini akan keluar dari profil bersama. Data yang sudah ada tidak hilang,
                  tapi tidak akan sync lagi.
                </div>
                <button
                  className={styles.btnDanger}
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Memutuskan...' : 'Ya, Putuskan'}
                </button>
                <button className={styles.btnGhost} onClick={() => setConfirmDisconnect(false)}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Regenerate recovery code overlay */}
          {showRegenConfirm && (
            <div className={styles.confirmOverlay} onClick={handleCloseRegen}>
              <div className={styles.confirmSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmHandle} />

                {regenCode ? (
                  <>
                    <div className={styles.confirmTitle}>Kode pemulihan baru</div>
                    <div className={styles.confirmDesc}>
                      Simpan kode ini baik-baik. Kode lama sudah hangus dan tidak bisa dipakai lagi.
                    </div>
                    <div className={styles.regenCodeBox}>
                      <div className={styles.regenCodeLabel}>KODE PEMULIHAN</div>
                      <div className={styles.regenCodeValue}>{regenCode}</div>
                    </div>
                    <button className={styles.btnSecondary} onClick={handleCopyRegenCode}>
                      {regenCopied ? 'Tersalin!' : 'Salin Kode'}
                    </button>
                    <button className={styles.btnGhost} onClick={handleCloseRegen}>
                      Selesai
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.confirmTitle}>Buat ulang kode pemulihan?</div>
                    <div className={styles.confirmDesc}>
                      Kode pemulihan lama akan langsung hangus dan tidak bisa dipakai lagi. Simpan
                      kode baru baik-baik.
                    </div>
                    {regenError && <div className={styles.regenErrorText}>{regenError}</div>}
                    <button
                      className={styles.btnPrimary}
                      onClick={handleRegenConfirm}
                      disabled={regenLoading}
                    >
                      {regenLoading ? 'Memproses...' : 'Ya, Buat Ulang'}
                    </button>
                    <button className={styles.btnGhost} onClick={handleCloseRegen}>
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {status === 'solo' && !profileId && (
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
          <div className={styles.soloTitle}>Amankan datamu</div>
          <div className={styles.soloDesc}>
            Simpan datamu ke cloud biar nggak hilang saat ganti HP. Kamu akan dapat kode pemulihan
            untuk berjaga-jaga.
          </div>
          <button className={styles.btnPrimary} onClick={handleAmankanData} disabled={securing}>
            {securing ? 'Mengamankan…' : 'Amankan Data'}
          </button>
          {secureError && <div className={styles.regenErrorText}>{secureError}</div>}
          <button className={styles.btnGhost} onClick={() => navigate('/pulihkan')}>
            Sudah punya profil? Pulihkan di sini
          </button>
        </div>
      )}

      {status === 'solo' && !!profileId && (
        <div className={styles.soloState}>
          <div className={styles.soloSafeStatus}>
            <span className={styles.soloSafeDot} />
            <span className={styles.soloSafeLabel}>Data aman di cloud</span>
          </div>
          <div className={styles.soloDivider} />
          <div className={styles.soloTitle}>Hubungkan Pasangan</div>
          <div className={styles.soloDesc}>Kelola keuangan bareng pasangan di satu profil.</div>
          <button className={styles.btnPrimary} onClick={() => navigate('/ajak-pasangan')}>
            Ajak Pasangan
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/gabung-kode')}>
            Gabung dengan Kode
          </button>
        </div>
      )}
    </div>
  )
}
