// Ed25519 public key — SPKI DER, standard base64. Safe to bundle (asymmetric).
export const PUBLIC_KEY_SPKI_B64 = 'MCowBQYDK2VwAyEAhQwC0Dwb/pd7WHM3Ow+AeUSc+V/cRVbotGtuaILjonM='

export const LICENSE_VERSION = 1 as const
export const LICENSE_DURATION_DAYS = 90
// Anti-rollback: allow up to 6 hours clock skew before flagging as tampered
export const LICENSE_ROLLBACK_TOLERANCE_MS = 6 * 60 * 60 * 1000
