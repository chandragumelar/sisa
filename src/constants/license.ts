// Ed25519 public key — SPKI DER, standard base64. Safe to bundle (asymmetric).
export const PUBLIC_KEY_SPKI_B64 = 'MCowBQYDK2VwAyEA/EfKH5nn7/EJ4rHvRq9XdP1qh7ZdpP2F+y5JkA8zI2E='

export const LICENSE_VERSION = 1 as const
// Fallback/documentation only — actual duration comes from payload.dur per key.
export const LICENSE_DURATION_DAYS = 366
// Anti-rollback: allow up to 6 hours clock skew before flagging as tampered
export const LICENSE_ROLLBACK_TOLERANCE_MS = 6 * 60 * 60 * 1000
