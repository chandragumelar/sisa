import type { Clock } from '@/shared/types/clock'
import type { LicenseRecord, Tier } from '@/db/database'
import { PUBLIC_KEY_SPKI_B64, LICENSE_VERSION } from '@/constants/license'
import { getLicense, saveLicense, updateLastSeenAt } from '@/db/license.repository'

export interface LicensePayload {
  v: number
  tier: Tier
  iat: number // epoch seconds
  exp: number // epoch seconds
  bid: string // 8-char SHA-256 prefix of buyer email
}

export type VerifyResult =
  | { status: 'valid'; payload: LicensePayload }
  | { status: 'invalid' } // bad format, bad signature, or unknown version
  | { status: 'expired' } // signature ok but exp has passed

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function parsePayload(segment: string): LicensePayload | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(segment))
    const obj = JSON.parse(json) as Record<string, unknown>
    if (
      typeof obj['v'] !== 'number' ||
      typeof obj['tier'] !== 'string' ||
      typeof obj['iat'] !== 'number' ||
      typeof obj['exp'] !== 'number' ||
      typeof obj['bid'] !== 'string' ||
      (obj['tier'] !== 'basic' && obj['tier'] !== 'pro')
    )
      return null
    return obj as unknown as LicensePayload
  } catch {
    return null
  }
}

// Module-level cache — importKey is async and called on every app open
let _cachedKey: CryptoKey | null = null

async function getPublicKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey
  const binary = atob(PUBLIC_KEY_SPKI_B64)
  const der = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  _cachedKey = await crypto.subtle.importKey('spki', der, 'Ed25519', false, ['verify'])
  return _cachedKey
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function verifyLicenseKey(rawKey: string, clock: Clock): Promise<VerifyResult> {
  const parts = rawKey.split('.')
  if (parts.length !== 2) return { status: 'invalid' }

  const [payloadSeg, sigSeg] = parts as [string, string]

  const payload = parsePayload(payloadSeg)
  if (!payload) return { status: 'invalid' }
  if (payload.v !== LICENSE_VERSION) return { status: 'invalid' }

  // Verify signature before trusting any payload values
  try {
    const pubKey = await getPublicKey()
    const sig = fromBase64Url(sigSeg)
    // Signature is over the raw payload segment (UTF-8), matching gen-license.ts
    const data = new TextEncoder().encode(payloadSeg)
    const valid = await crypto.subtle.verify('Ed25519', pubKey, sig, data)
    if (!valid) return { status: 'invalid' }
  } catch {
    return { status: 'invalid' }
  }

  if (payload.exp * 1000 < clock.now()) return { status: 'expired' }

  return { status: 'valid', payload }
}

// ---------------------------------------------------------------------------
// Activation & persistence
// ---------------------------------------------------------------------------

export type ActivateResult = { ok: true } | { ok: false; reason: 'invalid' | 'expired' }

export async function activateLicense(rawKey: string, clock: Clock): Promise<ActivateResult> {
  const result = await verifyLicenseKey(rawKey, clock)
  if (result.status !== 'valid') return { ok: false, reason: result.status }

  const { payload } = result
  const nowMs = clock.now()
  const record: LicenseRecord = {
    id: 1,
    rawKey,
    tier: payload.tier,
    version: payload.v,
    issuedAt: payload.iat * 1000,
    expiresAt: payload.exp * 1000,
    buyerIdHash: payload.bid,
    lastSeenAt: nowMs,
    activatedAt: nowMs,
  }
  await saveLicense(record)
  return { ok: true }
}

// Re-verifies the stored raw key on every app open (signature can't be faked;
// persisted flags can). Updates lastSeenAt when signature is intact — used by
// anti-rollback detection in story 2.5.
export async function loadAndVerifyLicense(clock: Clock): Promise<VerifyResult | null> {
  const record = await getLicense()
  if (!record) return null

  const result = await verifyLicenseKey(record.rawKey, clock)
  if (result.status !== 'invalid') {
    await updateLastSeenAt(clock.now())
  }
  return result
}
