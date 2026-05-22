# SISA — Engineering Guidelines (PWA)

**Version:** 1.0
**Last Updated:** 2026-05-22
**Status:** Active
**Stack:** React 18 + Vite + TypeScript + Zustand + React Router + CSS Modules · deploy Vercel

---

## 0. Konteks & Prinsip Pemandu

SISA adalah **PWA local-first, dijual via license key** (Gumroad USD / Clicky IDR), masa aktif **3 bulan per pembelian**. Tidak ada server aplikasi, tidak ada database, tidak ada backend yang perlu di-maintain. Semua data user hidup di device.

Empat batasan keras yang nge-drive semua keputusan teknis di bawah:

1. **Serverless & 0 cost.** Tidak boleh ada infra yang menagih bulanan atau butuh di-babysit. Vercel free tier untuk hosting statis, titik.
2. **Less maintenance.** Owner sibuk dengan project lain. Setiap keputusan harus dinilai dari pertanyaan: _"kalau gue ga sentuh ini 6 bulan, apakah masih jalan?"_
3. **Local-first.** Data di device. Tidak ada sync, tidak ada cloud. Backup = export/import manual (sudah dispec di PRD).
4. **Anti-piracy realistis, bukan paranoid.** Target: bypass butuh **medium effort**, pemalsuan key butuh **high effort**. Untuk produk seharga puluhan-ratusan ribu, ini cukup. Mengejar DRM sempurna = buang waktu yang lebih baik dipakai bikin fitur.

> 📌 Dokumen ini melengkapi `CLAUDE.md` (ruleset universal owner) dan `PRD.md` + `design_system.md` (source of truth produk & visual). Kalau ada konflik, **PRD menang** untuk produk, **CLAUDE.md menang** untuk gaya koding, dokumen ini menang untuk keputusan teknis PWA-specific.

---

## 1. Arsitektur Keputusan (Architecture Decision Record)

Bagian ini menjelaskan **kenapa** stack & pendekatan dipilih. Baca sekali, supaya keputusan turunan konsisten.

### 1.1 License Key — Ed25519 Offline-Signed

**Keputusan:** License key adalah **payload bertanda tangan Ed25519**, diverifikasi sepenuhnya di client. Tidak ada server validasi.

**Cara kerja:**

1. Owner punya **key pair Ed25519** yang digenerate sekali (private + public).
2. **Private key tidak pernah keluar dari laptop owner.** Disimpan di password manager / file terenkripsi.
3. **Public key di-embed di bundle app** — aman dibocorkan, tidak bisa dipakai untuk signing.
4. Saat ada pembelian, owner jalankan **script lokal** (`scripts/gen-license.ts`) yang membuat payload `{ tier, issuedAt, expiresAt, buyerHash }`, menandatanganinya dengan private key, lalu meng-encode jadi string license key.
5. Key dikirim ke pembeli via Gumroad/Clicky (manual atau via fulfillment field).
6. App men-decode key, **verify signature dengan public key**, baca `expiresAt`, simpan ke storage.

**Kenapa Ed25519, bukan plain JWT (HMAC)?**

JWT HMAC pakai **shared secret** yang harus ada di bundle untuk verifikasi → kalau ke-extract dari bundle, attacker bisa generate key palsu yang valid. Ed25519 **asymmetric**: yang di bundle cuma public key. Memalsukan key butuh private key yang tidak pernah keluar dari laptop owner. Inilah yang menaikkan pemalsuan ke **high effort**.

**Threat model — eksplisit:**

| Serangan                                                | Effort         | Mitigasi                                                                                                     |
| ------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Bypass pengecekan (patch JS bundle, set `isPro = true`) | **Medium**     | Diterima. Tidak bisa dicegah total di client. Minifikasi + pengecekan tersebar (lihat 4.x) menaikkan sedikit |
| Generate key palsu yang valid                           | **High**       | Butuh private key. Praktis mustahil tanpa bocor private key                                                  |
| Pakai 1 key di banyak device                            | **Low**        | Diterima. Tidak ada server penghitung. Sharing > harga renew = bukan ancaman ekonomis                        |
| Pakai key setelah expired (mundurkan jam device)        | **Low-Medium** | Lihat 4.4 — anti-rollback ringan via "last seen time" tersimpan                                              |

**Trade-off yang diterima sadar:** key tidak bisa di-revoke setelah dijual; satu key bisa dipakai lintas device. Keduanya acceptable untuk model bisnis ini. **Jangan** menambah server hanya untuk menutup celah Low-effort — itu melanggar batasan #1 & #2.

### 1.2 Storage — IndexedDB via Dexie

**Keputusan:** Semua data user di **IndexedDB**, diakses lewat **Dexie.js** (wrapper tipis, ~25KB).

**Kenapa bukan localStorage?** localStorage sync, blocking, ~5MB limit, string-only. Untuk transaksi yang bisa ratusan-ribuan baris + query (filter, range tanggal), IndexedDB jauh lebih tepat. Dexie kasih API yang manusiawi + dukungan migrasi schema bawaan.

**Kenapa bukan SQLite WASM / lainnya?** Over-engineering untuk skala data personal-finance satu user. Dexie cukup, lebih ringan, less maintenance.

### 1.3 Hosting — Vercel Static, No Functions

**Keputusan:** Deploy sebagai **static site** (Vite build output) ke Vercel. **Tidak pakai Vercel Functions / Edge Functions sama sekali** untuk v1.

**Kenapa?** Edge Function = surface area yang harus di-maintain + potensi cold start + potensi tagihan kalau traffic naik. Karena license diverifikasi offline (1.1), tidak ada satu pun alasan butuh server. Static site = 0 cost selamanya, 0 maintenance.

### 1.4 PWA — Service Worker via Vite PWA Plugin

**Keputusan:** Pakai `vite-plugin-pwa` (Workbox di belakang) dengan strategi **precache app shell, offline-first**.

**Kenapa?** Manual service worker = sumber bug & maintenance. Plugin generate SW otomatis dari build, handle versioning & update flow. Set sekali, lupakan.

---

## 2. Folder Structure (Feature-Based)

Mengikuti prinsip **feature-based** dari `CLAUDE.md`. Bukan layer-based (`components/`, `hooks/` global yang menggemuk). Kode satu fitur hidup bersama.

```
src/
├── app/                      # shell, routing, providers
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/            # ClockProvider, dll (lihat §6)
│
├── features/                 # ← jantung app, satu folder per domain
│   ├── cekDulu/
│   │   ├── CekDuluCanvas.tsx
│   │   ├── components/       # komponen khusus fitur ini
│   │   ├── useCekDulu.ts     # hook logic fitur
│   │   ├── cekDulu.utils.ts  # pure functions (WAJIB ditest)
│   │   └── cekDulu.types.ts
│   ├── andai/
│   ├── home/
│   ├── quickLog/
│   ├── tagihan/
│   ├── goal/
│   ├── wallet/
│   ├── onboarding/
│   ├── settings/
│   └── license/              # ← lihat §4
│
├── shared/                   # dipakai LINTAS fitur (≥2 fitur)
│   ├── components/           # PrimaryButton, Sheet, dll
│   ├── utils/                # formatCurrency, dll (WAJIB ditest)
│   ├── hooks/
│   └── types/
│
├── db/                       # Dexie schema + migrasi (lihat §5)
│   ├── database.ts
│   └── migrations.ts
│
├── store/                    # Zustand stores, satu file per domain
│
└── constants/                # nilai global lintas fitur
```

**Aturan penempatan:**

- Default: kode masuk ke `features/<nama>/`. **Jangan** langsung lempar ke `shared/`.
- Promosikan ke `shared/` **hanya setelah** dipakai di ≥2 fitur. Abstraksi prematur dilarang (`CLAUDE.md`).
- Pure functions (kalkulasi, transformasi, format) selalu di file `*.utils.ts` — entah di dalam fitur atau di `shared/utils/`. **Ini layer yang wajib ditest** (§8).
- Satu file = satu tanggung jawab. Komponen PascalCase, sisanya camelCase.

---

## 3. Naming, Code Quality, TypeScript

Aturan dari `CLAUDE.md` dan engineering guidelines lama tetap berlaku. Ringkasan yang mengikat:

### 3.1 Naming

- Komponen `PascalCase` (`CekDuluCanvas.tsx`), utility/hook/store `camelCase` (`formatCurrency.ts`, `useLicense.ts`).
- Boolean diawali `is`/`has`/`should` (`isPro`, `hasExpired`).
- Handler diawali `handle` (`handleConfirm`).
- Constant runtime-tetap `UPPER_SNAKE_CASE` (`MAX_WALLET_BASIC`, `LICENSE_DURATION_DAYS`).
- Props suffix `Props`, type union `PascalCase`.

### 3.2 Code Quality (hard limits dari CLAUDE.md)

- File maks **200 baris** (test maks 400). Function maks **20 baris**.
- Satu function = satu hal. Kalau deskripsinya butuh "dan", pecah.
- **Return early**, bukan nested if. Maks nesting yang sehat = 1-2 level.
- **Tidak ada magic number / magic string.** Semua nilai bermakna bisnis → `constants/`.
- **Tidak ada nested ternary.** Pecah jadi variabel atau early return.
- **Tidak ada silent error.** `catch {}` kosong dilarang keras.

### 3.3 TypeScript

- **Tidak ada `any`.** Kalau belum jelas, define type paling masuk akal + `// TODO: confirm type`.
- `interface` untuk object shape yang bisa di-extend, `type` untuk union/primitive/computed.
- Union type untuk nilai terbatas, **bukan `enum`** (enum bikin JS ekstra tanpa untung).
- Type yang dipakai ≥2 tempat → `shared/types/` atau `<feature>.types.ts`.

### 3.4 Komentar

Hanya jelaskan **kenapa**, bukan **apa**. Kode harus self-explanatory. Contoh komentar yang benar: menjelaskan keputusan non-obvious (kenapa `Math.floor` untuk budget, kenapa delay tertentu).

---

## 4. License & Activation (`features/license/`)

Bagian paling penting untuk monetisasi. Spec lengkap.

### 4.1 Format Key

License key = **Base64URL(payload) + "." + Base64URL(signature)**, dipisah titik (mirip JWT tapi Ed25519 detached signature, bukan JWT standard — lebih ringkas, tidak ada header redundan).

Payload (JSON, sebelum encode):

```typescript
interface LicensePayload {
  v: number // versi format, mulai dari 1
  tier: 'basic' | 'pro'
  iat: number // issued at, epoch detik
  exp: number // expires at, epoch detik (iat + 90 hari)
  bid: string // buyer id hash (8 char, dari email/order — privacy-safe, bukan PII mentah)
}
```

> 📌 `bid` bukan untuk validasi server (tidak ada server) — hanya penanda supaya owner bisa korelasikan key ke order kalau ada komplain. **Jangan simpan email mentah di key.**

### 4.2 Verifikasi (client-side, di `license.service.ts`)

```typescript
// Pseudoflow — implementasi pakai Web Crypto API (SubtleCrypto), bukan library berat
async function verifyLicenseKey(key: string): Promise<LicensePayload> {
  // 1. Split payload.signature
  // 2. Decode payload Base64URL → JSON
  // 3. Verify signature pakai PUBLIC_KEY (Ed25519) via crypto.subtle.verify
  // 4. Kalau signature invalid → throw LicenseError('invalid')
  // 5. Return payload (BELUM cek expiry di sini — itu tugas terpisah, lihat 4.4)
}
```

- Public key di-embed di `constants/license.ts` sebagai raw bytes (atau base64). **Bukan** rahasia.
- Pakai **Web Crypto API native** (`crypto.subtle`) — sudah support Ed25519 di browser modern (2023+). Tidak perlu library kripto eksternal. Less dependency = less maintenance.
- Fallback: kalau target browser belum support Ed25519 di SubtleCrypto, pakai `@noble/ed25519` (audited, ~4KB, zero-dependency). Cek caniuse saat implementasi.

### 4.3 State Aktivasi (`store/licenseStore.ts`)

```typescript
type LicenseStatus =
  | 'unactivated' // belum pernah masukin key
  | 'active' // key valid & belum expired
  | 'expired' // key valid tapi lewat exp
  | 'invalid' // key gagal verify (tampilkan error aktivasi)
  | 'tampered' // anti-rollback terpicu (lihat 4.4)

interface LicenseState {
  status: LicenseStatus
  tier: 'basic' | 'pro' | null
  expiresAt: number | null
}
```

- Saat aktivasi sukses: simpan **key utuh** + payload + `lastSeenAt` ke IndexedDB (bukan localStorage — biar ikut export/backup).
- App buka → baca key tersimpan → verify ulang → cek expiry → set status. **Verify tiap buka**, jangan percaya flag tersimpan (flag gampang dipalsu, signature tidak).

### 4.4 Expiry & Anti-Rollback Ringan

- Expiry = bandingkan `Clock.now()` (lihat §6) dengan `payload.exp`.
- **Anti-rollback ringan:** simpan `lastSeenAt` (timestamp terbesar yang pernah dilihat app) di IndexedDB. Tiap buka, kalau `Clock.now() < lastSeenAt - TOLERANCE` → user memundurkan jam → set status `tampered`, tampilkan pesan netral ("jam device lo kelihatan mundur, betulin dulu ya"). `TOLERANCE` ~ beberapa jam untuk timezone/DST.
- Ini menaikkan serangan "mundurkan jam buat akalin expiry" dari Low ke Low-Medium. **Jangan over-engineer lebih dari ini** — diminishing returns.

### 4.5 Downgrade Saat Expired

Sesuai PRD §4.3: data **tidak dihapus**. Wallet/goal di luar limit Basic jadi **read-only**. Tampilkan pesan honest non-shaming + link perpanjang. Logika gating limit ada di `shared/utils/tierLimits.ts` (pure, ditest).

### 4.6 Script Generator (`scripts/gen-license.ts`)

- Jalan di Node lokal, **bukan** bagian dari bundle app.
- Input: tier, durasi (default `LICENSE_DURATION_DAYS = 90`), buyer email (di-hash jadi `bid`).
- Output: license key string + log ke file lokal (`licenses.log`, gitignored) untuk record owner.
- Private key dibaca dari **environment variable / file terenkripsi**, tidak di-hardcode, tidak di-commit.

> ⚠️ **Aturan keras:** `scripts/`, private key, dan `licenses.log` **wajib** masuk `.gitignore`. Private key bocor = seluruh skema runtuh. Kalau ragu, jangan commit.

---

## 5. Storage & Migrasi (`db/`)

### 5.1 Dexie Schema

- Satu instance database (`db/database.ts`), versioned.
- Tabel sesuai domain: `transactions`, `wallets`, `tagihan`, `goals`, `settings`, `license`, `meta`.
- Index field yang sering di-query: `transactions` by `date`, by `walletId`.

### 5.2 Migrasi — WAJIB dari v1

- Setiap perubahan schema = **versi Dexie baru** + fungsi `upgrade`. Jangan pernah ubah schema lama in-place.
- Migrasi harus **idempotent & non-destruktif**. Data user tidak boleh hilang karena update app.
- Test setiap migrasi dengan fixture data versi sebelumnya (§8).

### 5.3 Export / Import (PRD §6.4)

- Export JSON = dump semua tabel + `schemaVersion` + `exportedAt`.
- Import = validasi `schemaVersion`, jalankan migrasi kalau perlu, baru tulis. **Jangan** langsung tulis tanpa validasi (data korup bisa nge-brick app).
- CSV export = transaksi only, untuk spreadsheet. Format angka Indonesia (titik ribuan).

### 5.4 Aturan Akses Data

- Semua akses DB lewat `db/` repository functions — **tidak boleh** query Dexie langsung dari komponen.
- Komponen → store/hook → repository → Dexie. Satu arah.

---

## 6. Time & Clock Injection (dari CLAUDE.md — WAJIB)

Logika waktu adalah jantung SISA (hari sampai gajian, expiry, budget harian). **Tidak boleh** ada `new Date()` atau `Date.now()` tersebar di kode bisnis.

### 6.1 Clock Abstraction

```typescript
// shared/types/clock.ts
interface Clock {
  now(): number // epoch ms
  today(): Date // tengah malam lokal hari ini
}
```

- Implementasi produksi: `SystemClock` (pakai `Date` asli).
- Implementasi test: `FixedClock` / `MockClock` (waktu yang bisa di-set).
- Di-provide via React Context (`app/providers/ClockProvider.tsx`), diakses lewat `useClock()`.

### 6.2 Aturan

- **Semua** kalkulasi yang menyentuh waktu (budget harian, sisa pas gajian, expiry license, anti-rollback, due date tagihan) **wajib** menerima `clock` sebagai dependency — entah lewat hook atau parameter function.
- Pure function waktu di `*.utils.ts` menerima `now: number` sebagai argumen, bukan memanggil `Date.now()` sendiri. Ini yang bikin mereka bisa ditest deterministik.
- Test boundary waktu wajib: gajian jatuh weekend, akhir bulan, tahun kabisat, DST, expiry tepat di detik `exp`.

---

## 7. State Management (Zustand)

- Satu store per domain: `licenseStore`, `walletStore`, `transactionStore`, `goalStore`, `tagihanStore`, `settingsStore`. **Bukan** satu store raksasa.
- State lokal satu komponen → `useState`. Lintas komponen tanpa relasi parent-child → Zustand.
- **Jangan simpan derived state.** Budget harian dihitung dari saldo+tagihan+target via selector/util, bukan disimpan. Hitung saat dibutuhkan.
- Mutasi state hanya lewat action store, tidak langsung dari luar.
- Store async action: selalu handle `loading` / `success` / `error`. Tidak ada asumsi "pasti sukses".

---

## 8. Testing

Mengikuti `CLAUDE.md`: test wajib mencakup **happy / empty / boundary**.

**WAJIB ditest:**

- Semua pure function di `*.utils.ts` & `shared/utils/` — terutama: kalkulasi budget harian, sisa pas gajian, waterfall goal, tier limit gating, format angka, verifikasi & expiry license, anti-rollback.
- Setiap migrasi Dexie (§5.2) dengan fixture data versi lama.
- Export → import round-trip (data masuk = data keluar).

**Tiap fungsi minimal 3 kasus:**

- **Happy:** input normal.
- **Empty:** nol transaksi, nol wallet, nol goal, key kosong.
- **Boundary:** expiry tepat di `exp`, budget saat saldo = tagihan, gajian di weekend/akhir bulan, jam dimundurkan.

**TIDAK perlu ditest:** komponen presentational murni, styling/layout, store yang cuma setter sederhana.

**Tooling:** Vitest (native Vite, less config) + React Testing Library kalau ada komponen interaktif kompleks (form multi-step). Test file di sebelah file yang dites, suffix `.test.ts`.

---

## 9. PWA & Offline

- `vite-plugin-pwa`, strategi `precache app shell`, offline-first.
- App **wajib jalan penuh offline** setelah load pertama (konsisten local-first). Tidak ada fitur yang butuh jaringan kecuali link beli (buka tab eksternal).
- **Update flow:** saat ada versi baru, tampilkan prompt non-intrusif ("versi baru tersedia, muat ulang ›"). Jangan auto-reload paksa saat user lagi input.
- Manifest: nama, icon (maskable), theme color = `color.canvas` light, display `standalone`.
- Install prompt: tampilkan kontekstual (bukan langsung saat buka). Boleh defer ke setelah onboarding.
- **Vibration API** untuk haptic (PRD §1.5) — feature-detect dulu, jangan asumsikan ada.

---

## 10. Error Handling

- Setiap operasi yang bisa gagal (DB write, key verify, import file) **wajib** punya error handling. Tidak ada `catch {}` kosong.
- Pesan ke user manusiawi & sesuai voice SISA (lihat `design_system.md` §8) — bukan technical message. Contoh: "kode lisensi ga valid, cek email lo lagi" bukan "InvalidSignatureError".
- Format log konsisten:

```typescript
catch (err) {
  console.error('[verifyLicenseKey] gagal verifikasi key', {
    input: { keyLength: key.length },   // JANGAN log key utuh / PII
    error: err instanceof Error ? err.message : err,
  })
  // set state error yang sesuai
}
```

- **Jangan log data sensitif** (key utuh, isi transaksi). Log secukupnya untuk debug.

---

## 11. Async, Linting, Performance, Git

- **Async:** `async/await` only, tidak ada `.then()` chaining. Selalu bungkus try/catch.
- **Linting:** ESLint + Prettier, config di root = sumber kebenaran. Tidak ada `eslint-disable` tanpa alasan tertulis. Nol warning sebelum commit.
- **Performance:** jangan optimasi sebelum ada masalah terukur. Pagination kalau list >20 item. `useMemo`/`useCallback` hanya kalau terbukti ada masalah re-render. Lazy-load canvas berat (Andai, History) via React.lazy.
- **Git:** commit format `type: deskripsi inggris` (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`). Satu commit = satu perubahan logical. Refactor terpisah dari fitur. Branch `feature/` & `fix/`, jangan commit langsung ke `main`. `.gitignore` wajib: `node_modules/`, `.env`, `scripts/` private key, `licenses.log`, `dist/`.

---

## 12. Dead Code & Refactor

- Hapus dead code, import nganggur, `console.log` debugging segera — jangan bermalam.
- **Refactor mikro** (tiap selesai nulis kode): rename tak deskriptif, pecah function >20 baris, bersihkan import.
- **Refactor meso** (tiap selesai fitur, sebelum commit): review fitur end-to-end, abstrak pola yang muncul ≥3x, pecah file >200 baris.
- Self-review checklist (§13) wajib dijalankan sebelum bilang "fitur selesai".

---

## 13. Self-Review Checklist (dari CLAUDE.md — sebelum submit)

- [ ] Tidak ada `any`, tidak ada magic number/string, tidak ada nested ternary?
- [ ] Tidak ada `new Date()`/`Date.now()` di kode bisnis — semua lewat `Clock`?
- [ ] Semua operasi gagal-able punya error handling, tidak ada silent error?
- [ ] Pure function di `*.utils.ts` punya test happy/empty/boundary?
- [ ] File ≤200 baris, function ≤20 baris, satu function satu hal?
- [ ] Tidak ada akses Dexie langsung dari komponen (lewat repository)?
- [ ] License: verify tiap buka (bukan percaya flag), key tidak pernah di-log utuh?
- [ ] Tidak ada dependency baru yang bisa dihindari (less maintenance)?
- [ ] `.gitignore` aman — private key & licenses.log tidak ke-commit?
- [ ] Copy error sesuai voice SISA, bukan technical message?

---

## 14. Instruksi untuk Claude (saat ngoding SISA)

1. Baca dokumen ini bersama `CLAUDE.md`, `PRD.md`, dan `design_system.md` sebelum nulis kode. PRD = source of truth produk.
2. Default ke **inline & sederhana**. Abstraksi prematur dilarang — build for now, not for maybe.
3. Tidak ada server, tidak ada Edge Function, tidak ada dependency berat tanpa alasan kuat. Setiap dependency baru harus lolos test "less maintenance".
4. Semua logika waktu lewat `Clock` injection. Tidak ada pengecualian.
5. License: Web Crypto native dulu, library kripto hanya kalau browser target belum support Ed25519.
6. Selesai nulis → refactor mikro. Selesai fitur → refactor meso + self-review checklist.
7. Kalau nemu pelanggaran aturan (dead code, file >200 baris, magic number, `any`), perbaiki saat itu juga.
8. Kalau ragu antara nambah infra vs tetap client-only → **tetap client-only**. Batasan serverless & 0 cost menang.
9. Kalau ada situasi tidak tercakup dokumen ini, tanya owner — jangan asumsi.

---

_Dokumen ini hidup. Setiap keputusan teknis baru yang tidak keangkut di sini = kandidat update._
