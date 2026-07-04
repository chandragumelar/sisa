# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Baca file ini **pertama**, tiap sesi. Ini peta + aturan yang gak boleh dilanggar.
> Self-contained: semua yang AI butuh untuk mulai ada di sini atau di-pointer dari sini.

---

## 1. Apa Ini

**SISA** — PWA decision-support keuangan ("aman ga gue beli ini sekarang?"), local-first, dijual via license key

**Stack:** React 18 + Vite + TypeScript + React Router + CSS Modules → deploy Vercel (static).

---

## 2. Urutan Baca (sebelum nulis kode apapun)

| #   | Dokumen                                  | Untuk                                                            |
| --- | ---------------------------------------- | ---------------------------------------------------------------- |
| 1   | **`CLAUDE.md`** (ini)                    | Aturan kritis + peta. Selalu di context                          |
| 2   | **`docs/engineering-guidelines-pwa.md`** | _Bagaimana_ — arsitektur, license, storage, testing              |
| 3   | **`docs/design_system.md`**              | Visual — token, komponen, voice/copy. **Source of truth visual** |

Tarik dokumen **saat relevan**, bukan semua sekaligus (irit token). Kerja di fitur tagihan → baca section tagihan di PRD + guidelines, bukan seluruh PRD.

**Prioritas saat konflik:** docs/design_system.md menang untuk visual · engineering-guidelines menang untuk keputusan teknis PWA · CLAUDE.md (ini) menang untuk aturan koding & batasan keras.

---

## 3. Commands

```bash
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build
npm run lint           # ESLint
npm run format         # Prettier write
npm run format:check   # Prettier check (CI)
npm run test           # Vitest watch mode
npx vitest run                                                # Run all tests once
npx vitest run src/features/home/home.utils.test.ts          # Single test file
npx vitest run --reporter=verbose                            # Verbose output
npx tsc --noEmit                                             # Type check only
```

**Git hooks (otomatis):**

- `pre-commit` — `lint-staged` (ESLint fix + Prettier write on staged files)
- `commit-msg` — `commitlint` (conventional commits, header ≤100 chars)
- `pre-push` — `tsc --noEmit`

**Commit format:** `type: description in english` — valid types: `feat fix refactor chore test docs perf ci build style`. Header max 100 chars.

---

## 4. Arsitektur — Data Flow

```
main.tsx
  └─ ClockProvider          ← wraps entire app; injects SystemClock
       └─ App               ← on mount: reads settings → applyTheme() + applyLanguage()
            └─ RouterProvider
                 ├─ RequireOnboarding / RequireSetupPending  ← reads settings.onboardingCompleted
                 └─ <FeaturePage>
```

**Tidak ada global state store.** `store/` directory kosong — tiap page component loads datanya sendiri dengan `useEffect + Promise.all` ke repository functions, simpan ke local `useState`. Pattern ini intentional untuk simplicity.

**Data layer:**

```
Component → db/ repository function → Dexie (IndexedDB)
```

Komponen tidak pernah import Dexie langsung. Semua akses DB lewat functions di `db/*.repository.ts`.

**Wallet balance is pre-computed** — `wallets.balance` di-update on every write via `addTransactionAndUpdateBalance()`. Bukan di-sum dari semua transaksi saat dibaca. Balance write harus selalu lewat repository supaya balance tetap konsisten.

---

## 5. Financial Model Invariants

> Full spec di `docs/PRD.md` §5–§6. Yang di sini adalah invariant yang **TIDAK BOLEH** dilanggar tanpa baca PRD dulu.

- **Saldo is LIVE.** Keluar menurunkan saldo, masuk menaikkan. Nabung **tidak pernah** mutate saldo — nabung hanya earmark (menaikkan total tabungan, saldo tetap).
- **Sisa = total saldo − total tagihan − total tabungan.** Dihitung oleh **SATU fungsi source-of-truth** yang dikonsumsi di semua tempat (hero, breakdown, budget base, Cek Dulu). Tidak ada formula paralel/duplikat. Tidak ada term "+income −expense" — saldo sudah mencerminkannya.
- **Currencies are separate worlds, max 2, NO FX conversion or cross-currency summing.** Active toggle controls both symbol AND data scope. Exception: Catat sheet follows the SELECTED WALLET's currency, not the toggle.
- **Recurring tagihan status resets on the 1st of the calendar month.**
- **Deleting a goal releases its earmark back to sisa** — no goal-to-goal transfer.
- **Earmark / pindah-dompet concepts are REMOVED.** Do not reintroduce.
- **Home is the only place to manage wallet/tagihan/goal.**

---

## 6. Clock Injection

```typescript
// useClock() di komponen → clock.now()
// Pure utils menerima nowMs: number — bukan memanggil Date.now() sendiri
export function calcDaysUntilPayday(nowMs: number, settings: Settings): number { ... }
```

- **Production:** `SystemClock` (satu-satunya tempat `new Date()` / `Date.now()` diizinkan)
- **Test:** `new FixedClock(new Date('2024-01-10'))` atau `new FixedClock(epochMs)`
- `ClockProvider` menerima optional `clock` prop — dipakai untuk inject `FixedClock` di tests

---

## 7. Testing

Hanya `*.utils.ts` yang wajib ditest (bukan komponen). Test file ada di sebelah file yang dites, suffix `.test.ts`.

**Repository functions di-mock** (bukan fake IndexedDB):

```typescript
vi.mock('@/db/license.repository')
vi.mocked(saveLicense).mockResolvedValue(undefined)
```

**License utils testing:** pakai test key pair yang di-hardcode di test file (bukan production key — aman di-commit). `vi.mock('@/constants/license')` untuk inject test public key — harus inline di mock factory karena `vi.mock` di-hoist.

**Tiap util minimal 3 kasus:** happy · empty · boundary (expiry tepat di `exp`, gajian di akhir bulan, jam dimundurkan, February leap/non-leap).

---

## 8. License System

Key format: `Base64URL(payload) + "." + Base64URL(signature)` (Ed25519 detached via `crypto.subtle`).

- Public key di `constants/license.ts` — aman di bundle
- Private key **tidak pernah** masuk repo. `scripts/` dan `licenses.log` ada di `.gitignore`
- App verifikasi key tiap buka — jangan percaya flag tersimpan; signature tak bisa dipalsu, flag bisa
- `determineLicenseStatus()` di `features/license/license.utils.ts` = single entry point untuk cek status

---

## 9. Onboarding

Data dikumpulkan step-by-step di `OnboardingAccumulated` state di `OnboardingPage`, lalu di-commit sekaligus di `handleComplete()` → `saveSettings()` + `addWallet()` per wallet. Tidak ada partial save.

`WalletInput.id` (dari `crypto.randomUUID()`) hanya untuk React key management selama onboarding — tidak disimpan ke DB.

---

## 10. CSS

- **CSS Modules** (`.module.css`) untuk semua feature components — class names di-scope per file
- **`src/features/onboarding/step.css`** — shared namespace CSS untuk semua step components, diimport sekali di `OnboardingPage`; pakai prefix `.ob-*`
- **Design tokens** di `src/app/tokens.css` — selalu pakai `var(--token)`, tidak pernah hardcode hex
- **No i18n library** — language disimpan di `settings.language`, diterapkan via `applyLanguage()` yang set `document.documentElement.lang`

---

## 11. Aturan Koding — Gak Boleh Dilanggar

Ini ringkasan operatif. Detail & contoh di `docs/engineering-guidelines-pwa.md` §3–§13.

- **KISS / pragmatis.** Inline & sederhana dulu. Abstraksi prematur dilarang — build for now, not for maybe.
- **Feature-based folders.** Kode satu fitur hidup bareng di `features/<nama>/`. Promosi ke `shared/` **hanya** setelah dipakai ≥2 fitur.
- **Clock injection wajib.** Gak ada `new Date()` / `Date.now()` di kode bisnis — semua lewat `Clock` (lihat §6).
- **No `any`.** Belum jelas type → define yang masuk akal + `// TODO: confirm type`.
- **No magic number/string.** Nilai bermakna bisnis → `constants/`.
- **No nested ternary. No silent error** (`catch {}` kosong dilarang).
- **Return early**, bukan nested if. File ≤200 baris, function ≤20 baris, satu function satu hal.
- **Error handling wajib** di tiap operasi gagal-able (DB write, key verify, import). Pesan ke user pakai **voice SISA, bukan technical message**.
- **Test wajib happy/empty/boundary** untuk semua pure function di `*.utils.ts` + setiap migrasi Dexie + export/import round-trip.
- **Akses DB lewat repository** (`db/`) — komponen gak query Dexie langsung.
- **License diverifikasi tiap buka** — jangan percaya flag tersimpan; signature gak bisa dipalsu, flag bisa.

---

## 12. Yang Gak Boleh Diputuskan Sendiri (tanya owner)

- **Nambah server / Edge Function / dependency berat** — langgar batasan #1. Default: tetap client-only.
- **Ubah schema license / format key** — ada implikasi keamanan & key yang sudah terjual.
- **Hapus / ubah strategi storage atau migrasi** — risiko data user hilang.
- **Ubah `.eslintrc` / `.prettierrc`** — berdampak seluruh codebase.

Kalau ragu antara nambah infra vs tetap client-only → **tetap client-only**.

---

## 13. Keamanan — Jangan Sampai Salah

- **Private key license tidak pernah** masuk repo/bundle. `scripts/`, private key, `licenses.log` **wajib** di `.gitignore`.
- **Public key** boleh di bundle (aman dibocorkan).
- **Jangan log** key utuh atau data transaksi (PII). Log secukupnya untuk debug.
- `.env`, `node_modules/`, `dist/` gak pernah di-commit.

---

## 14. Alur Kerja Tiap Tugas

1. Baca dokumen relevan (urutan §2).
2. Tulis kode mengikuti §11.
3. **Refactor mikro** (tiap selesai sepotong): bersihkan dead code/import, pecah function >20 baris, rename tak deskriptif.
4. **Refactor meso** (tiap selesai fitur): review end-to-end, abstrak pola ≥3x, pecah file >200 baris.
5. **Self-review checklist** (`docs/engineering-guidelines-pwa.md` §13) sebelum bilang "selesai".
6. Commit: `type: deskripsi inggris`. Refactor terpisah dari fitur. Branch `feature/` atau `fix/`, jangan ke `main`.
7. Situasi gak tercakup dokumen → **tanya owner, jangan asumsi.**

---

_File ini ringkas sengaja. Detail hidup di PRD / guidelines / design_system. Update di sini hanya kalau ada aturan kritis atau batasan baru._
