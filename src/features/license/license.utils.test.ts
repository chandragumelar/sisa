import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { FixedClock } from '@/shared/utils/clock'
import type { LicenseRecord } from '@/db/database'
import type { LicensePayload } from './license.utils'
import {
  verifyLicenseKey,
  activateLicense,
  loadAndVerifyLicense,
  determineLicenseStatus,
} from './license.utils'
import { getLicense, saveLicense, updateLastSeenAt } from '@/db/license.repository'

// Test private key — generated offline, NOT production keys, safe to commit.
// Matching public key is inlined in the vi.mock factory below (hoisting constraint).
const TEST_PRIV_B64 = 'MC4CAQAwBQYDK2VwBCIEIF0xa9RlUuVoZcSTOjCJfSsPVEoSV52Fv5JAui0onaf5'

// vi.mock is hoisted before variable declarations, so the public key is inlined here
vi.mock('@/constants/license', () => ({
  PUBLIC_KEY_SPKI_B64: 'MCowBQYDK2VwAyEARKlxpmDtkOugAzFUFuT9bdtc6JX5Jz2A0Z8AbwNIyjM=',
  LICENSE_VERSION: 1,
  LICENSE_DURATION_DAYS: 366,
  LICENSE_ROLLBACK_TOLERANCE_MS: 6 * 60 * 60 * 1000,
}))

vi.mock('@/db/license.repository')

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const NOW_MS = 1_700_000_000_000 // 2023-11-14 — fixed for determinism
const TOLERANCE_MS = 6 * 60 * 60 * 1000
const DAY_MS = 86_400_000
const clock = new FixedClock(NOW_MS)

let privKey: CryptoKey

beforeAll(async () => {
  const der = Uint8Array.from(atob(TEST_PRIV_B64), (c) => c.charCodeAt(0))
  privKey = await crypto.subtle.importKey('pkcs8', der, 'Ed25519', false, ['sign'])
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(saveLicense).mockResolvedValue(undefined)
  vi.mocked(updateLastSeenAt).mockResolvedValue(undefined)
})

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function makeKey(overrides: Partial<LicensePayload> = {}): Promise<string> {
  const payload: LicensePayload = {
    v: 1,
    dur: 30,
    ...overrides,
  }
  const seg = b64url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign('Ed25519', privKey, new TextEncoder().encode(seg))
  return `${seg}.${b64url(new Uint8Array(sig))}`
}

function makeRecord(rawKey: string, overrides: Partial<LicenseRecord> = {}): LicenseRecord {
  return {
    id: 1,
    rawKey,
    version: 1,
    issuedAt: NOW_MS - 3_600_000,
    expiresAt: NOW_MS + 30 * DAY_MS,
    lastSeenAt: NOW_MS - 1000,
    activatedAt: NOW_MS - 3_600_000,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// verifyLicenseKey
// ---------------------------------------------------------------------------
describe('verifyLicenseKey', () => {
  it('valid — correctly signed key', async () => {
    const result = await verifyLicenseKey(await makeKey())
    expect(result.status).toBe('valid')
    if (result.status === 'valid') {
      expect(result.payload).toMatchObject({ v: 1, dur: 30 })
    }
  })

  it('invalid — empty string', async () => {
    expect((await verifyLicenseKey('')).status).toBe('invalid')
  })

  it('invalid — no dot separator', async () => {
    expect((await verifyLicenseKey('nodot')).status).toBe('invalid')
  })

  it('invalid — tampered payload (signature mismatch)', async () => {
    const [, sig] = (await makeKey()).split('.')
    const fakePayload = b64url(new TextEncoder().encode(JSON.stringify({ v: 1, dur: 9999 })))
    expect((await verifyLicenseKey(`${fakePayload}.${sig}`)).status).toBe('invalid')
  })

  it('invalid — wrong version', async () => {
    const key = await makeKey({ v: 2 } as Partial<LicensePayload>)
    expect((await verifyLicenseKey(key)).status).toBe('invalid')
  })

  it('invalid — missing required fields in payload', async () => {
    const payload = { v: 1 }
    const seg = b64url(new TextEncoder().encode(JSON.stringify(payload)))
    const sig = await crypto.subtle.sign('Ed25519', privKey, new TextEncoder().encode(seg))
    expect((await verifyLicenseKey(`${seg}.${b64url(new Uint8Array(sig))}`)).status).toBe('invalid')
  })

  it('invalid — dur is zero (boundary: must be > 0)', async () => {
    const key = await makeKey({ dur: 0 })
    expect((await verifyLicenseKey(key)).status).toBe('invalid')
  })

  it('invalid — dur is not an integer', async () => {
    const key = await makeKey({ dur: 30.5 })
    expect((await verifyLicenseKey(key)).status).toBe('invalid')
  })
})

// ---------------------------------------------------------------------------
// activateLicense
// ---------------------------------------------------------------------------
describe('activateLicense', () => {
  it('returns ok and persists correct record for valid key', async () => {
    const key = await makeKey({ dur: 30 })
    const result = await activateLicense(key, clock)
    expect(result.ok).toBe(true)
    expect(vi.mocked(saveLicense)).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        rawKey: key,
        version: 1,
        issuedAt: NOW_MS,
        expiresAt: NOW_MS + 30 * DAY_MS,
        lastSeenAt: NOW_MS,
        activatedAt: NOW_MS,
      }),
    )
  })

  it('returns error and does not save for invalid key', async () => {
    const result = await activateLicense('garbage', clock)
    expect(result).toEqual({ ok: false, reason: 'invalid' })
    expect(vi.mocked(saveLicense)).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// loadAndVerifyLicense
// ---------------------------------------------------------------------------
describe('loadAndVerifyLicense', () => {
  it('returns null when no license is stored', async () => {
    vi.mocked(getLicense).mockResolvedValue(undefined)
    expect(await loadAndVerifyLicense(clock)).toBeNull()
  })

  it('returns valid and updates lastSeenAt for valid stored key', async () => {
    vi.mocked(getLicense).mockResolvedValue(makeRecord(await makeKey()))
    const result = await loadAndVerifyLicense(clock)
    expect(result?.status).toBe('valid')
    expect(vi.mocked(updateLastSeenAt)).toHaveBeenCalledWith(NOW_MS)
  })

  it('does not update lastSeenAt for invalid key', async () => {
    vi.mocked(getLicense).mockResolvedValue(makeRecord('bad.key'))
    const result = await loadAndVerifyLicense(clock)
    expect(result?.status).toBe('invalid')
    expect(vi.mocked(updateLastSeenAt)).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// determineLicenseStatus
// ---------------------------------------------------------------------------
describe('determineLicenseStatus', () => {
  it('unactivated — no record in DB', async () => {
    vi.mocked(getLicense).mockResolvedValue(undefined)
    expect(await determineLicenseStatus(clock)).toBe('unactivated')
  })

  it('active — activated with dur=30, checked before expiry', async () => {
    vi.mocked(getLicense).mockResolvedValue(
      makeRecord(await makeKey({ dur: 30 }), { expiresAt: NOW_MS + 30 * DAY_MS }),
    )
    expect(await determineLicenseStatus(clock)).toBe('active')
  })

  it('expired — clock advanced past activation + dur days', async () => {
    vi.mocked(getLicense).mockResolvedValue(
      makeRecord(await makeKey({ dur: 30 }), { expiresAt: NOW_MS - 1 }),
    )
    expect(await determineLicenseStatus(clock)).toBe('expired')
  })

  it('expired — boundary: now exactly equals expiresAt', async () => {
    vi.mocked(getLicense).mockResolvedValue(
      makeRecord(await makeKey({ dur: 30 }), { expiresAt: NOW_MS }),
    )
    expect(await determineLicenseStatus(clock)).toBe('expired')
  })

  it('invalid — corrupt raw key in stored record', async () => {
    vi.mocked(getLicense).mockResolvedValue(makeRecord('bad.key'))
    expect(await determineLicenseStatus(clock)).toBe('invalid')
  })

  it('tampered — lastSeenAt exceeds now + tolerance', async () => {
    vi.mocked(getLicense).mockResolvedValue(
      makeRecord(await makeKey(), { lastSeenAt: NOW_MS + TOLERANCE_MS + 1 }),
    )
    expect(await determineLicenseStatus(clock)).toBe('tampered')
  })

  it('not tampered — lastSeenAt equals now + tolerance (boundary: strict >)', async () => {
    vi.mocked(getLicense).mockResolvedValue(
      makeRecord(await makeKey(), { lastSeenAt: NOW_MS + TOLERANCE_MS }),
    )
    expect(await determineLicenseStatus(clock)).toBe('active')
  })
})
