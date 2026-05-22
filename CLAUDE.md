# CLAUDE.md — SISA

> Baca file ini **pertama**, tiap sesi. Ini peta + aturan yang gak boleh dilanggar.
> Self-contained: semua yang AI butuh untuk mulai ada di sini atau di-pointer dari sini.

---

## 1. Apa Ini

**SISA** — PWA decision-support keuangan ("aman ga gue beli ini sekarang?"), local-first, dijual via license key (Gumroad USD / Clicky IDR), masa aktif **3 bulan** per pembelian.

**Stack:** React 18 + Vite + TypeScript + Zustand + React Router + CSS Modules → deploy Vercel (static).

**Status:** greenfield — scaffold selesai, feature code belum mulai.

**Empat batasan keras (tiap keputusan dinilai dari ini):**

1. **Serverless & 0 cost** — gak ada backend/DB/Edge Function. Static site only.
2. **Less maintenance** — "kalau gak disentuh 6 bulan, masih jalan?"
3. **Local-first** — data di device (IndexedDB). Backup = export/import manual.
4. **Anti-piracy realistis** — bypass = medium effort (diterima), palsu key = high effort.

---

## 2. Urutan Baca (sebelum nulis kode apapun)

| #   | Dokumen                             | Untuk                                                                 |
| --- | ----------------------------------- | --------------------------------------------------------------------- |
| 1   | **`CLAUDE.md`** (ini)               | Aturan kritis + peta. Selalu di context                               |
| 2   | **`PRD.md`**                        | _Apa_ yang dibangun — produk, fitur, spec. **Source of truth produk** |
| 3   | **`engineering-guidelines-pwa.md`** | _Bagaimana_ — arsitektur, license, storage, testing                   |
| 4   | **`design_system.md`**              | Visual — token, komponen, voice/copy. **Source of truth visual**      |

Tarik dokumen **saat relevan**, bukan semua sekaligus (irit token). Kerja di fitur tagihan → baca section tagihan di PRD + guidelines, bukan seluruh PRD.

**Prioritas saat konflik:** PRD menang untuk produk · design_system menang untuk visual · engineering-guidelines menang untuk keputusan teknis PWA · CLAUDE.md (ini) menang untuk aturan koding & batasan keras.

---

## 3. Aturan Koding — Gak Boleh Dilanggar

Ini ringkasan operatif. Detail & contoh di `engineering-guidelines-pwa.md` §3–§13.

- **KISS / pragmatis.** Inline & sederhana dulu. Abstraksi prematur dilarang — build for now, not for maybe.
- **Feature-based folders.** Kode satu fitur hidup bareng di `features/<nama>/`. Promosi ke `shared/` **hanya** setelah dipakai ≥2 fitur.
- **Clock injection wajib.** Gak ada `new Date()` / `Date.now()` di kode bisnis — semua lewat `Clock` (lihat guidelines §6). Logika waktu = jantung app.
- **No `any`.** Belum jelas type → define yang masuk akal + `// TODO: confirm type`.
- **No magic number/string.** Nilai bermakna bisnis → `constants/`.
- **No nested ternary. No silent error** (`catch {}` kosong dilarang).
- **Return early**, bukan nested if. File ≤200 baris, function ≤20 baris, satu function satu hal.
- **Error handling wajib** di tiap operasi gagal-able (DB write, key verify, import). Pesan ke user pakai voice SISA, bukan technical message.
- **Test wajib happy/empty/boundary** untuk semua pure function di `*.utils.ts` + setiap migrasi Dexie + export/import round-trip.
- **Akses DB lewat repository** (`db/`) — komponen gak query Dexie langsung.
- **License diverifikasi tiap buka** — jangan percaya flag tersimpan; signature gak bisa dipalsu, flag bisa.

---

## 4. Yang Gak Boleh Diputuskan Sendiri (tanya owner)

- **Nambah server / Edge Function / dependency berat** — langgar batasan #1. Default: tetap client-only.
- **Ubah schema license / format key** — ada implikasi keamanan & key yang sudah terjual.
- **Hapus / ubah strategi storage atau migrasi** — risiko data user hilang.
- **Ubah `.eslintrc` / `.prettierrc`** — berdampak seluruh codebase.

Kalau ragu antara nambah infra vs tetap client-only → **tetap client-only**.

---

## 5. Keamanan — Jangan Sampai Salah

- **Private key license tidak pernah** masuk repo/bundle. `scripts/`, private key, `licenses.log` **wajib** di `.gitignore`.
- **Public key** boleh di bundle (aman dibocorkan).
- **Jangan log** key utuh atau data transaksi (PII). Log secukupnya untuk debug.
- `.env`, `node_modules/`, `dist/` gak pernah di-commit.

---

## 6. Alur Kerja Tiap Tugas

1. Baca dokumen relevan (urutan §2).
2. Tulis kode mengikuti §3.
3. **Refactor mikro** (tiap selesai sepotong): bersihkan dead code/import, pecah function >20 baris, rename tak deskriptif.
4. **Refactor meso** (tiap selesai fitur): review end-to-end, abstrak pola ≥3x, pecah file >200 baris.
5. **Self-review checklist** (guidelines §13) sebelum bilang "selesai".
6. Commit: `type: deskripsi inggris` (`feat:`/`fix:`/`refactor:`/`chore:`/`test:`). Refactor terpisah dari fitur. Branch `feature/` atau `fix/`, jangan ke `main`.
7. Situasi gak tercakup dokumen → **tanya owner, jangan asumsi.**

---

_File ini ringkas sengaja. Detail hidup di PRD / guidelines / design_system. Update di sini hanya kalau ada aturan kritis atau batasan baru._
