# SISA — User Stories

> Dokumen ini adalah living spec user stories untuk SISA PWA. Ditulis dari perspektif PM — setiap story punya persona yang jelas, value proposition, dan acceptance criteria yang bisa diverifikasi. Tidak ada story yang ditulis cuma karena "kayaknya perlu" — setiap story harus bisa dijawab: _"Siapa yang butuh ini, dan kenapa?"_

---

## Cara Baca Dokumen Ini

**Format user story:**

```
Sebagai [persona],
saya ingin [kemampuan/aksi],
agar [manfaat/value yang didapat].
```

**Acceptance Criteria (AC)** ditulis dalam format checklist — setiap poin harus bisa di-_pass_ atau _fail_ oleh QA tanpa ambiguitas. Kalau AC-nya ambigu, story-nya belum siap masuk sprint.

**Priority:**

- 🔴 **P0** — Blocker. Sprint tidak bisa selesai tanpa ini.
- 🟡 **P1** — Core. Value utama sprint ini ada di sini.
- 🟢 **P2** — Nice-to-have. Bisa di-defer kalau sprint over-capacity.

**Persona yang dipakai:**

- **Aqil** — Karyawan gaji tetap, anxious sebelum spend, target utama app ini (Archetype B-anxious)
- **Rara** — Freelancer, income tidak tetap, butuh floor keamanan bukan tanggal gajian
- **Dira** — User Pro, punya 2 currency (kerja remote, dibayar USD), butuh isolation ketat
- **Developer** — Internal, untuk story teknis yang penting tapi tidak terlihat user

---

## Sprint Overview

| Sprint | Fokus                 | # Stories      | Deliverable                                  |
| ------ | --------------------- | -------------- | -------------------------------------------- |
| **S1** | Fondasi Teknis        | 8              | Project jalan, DB tersedia, CI/CD aktif      |
| **S2** | License & Aktivasi    | 6              | SISA bisa dijual — key system end-to-end     |
| **S3** | Onboarding            | 8              | User baru setup < 2 menit, landing di home   |
| **S4** | Home Canvas           | 10             | Semua modul home render dengan data nyata    |
| **S5** | Interaksi & Quick Log | 11             | Data di home bergerak, user bisa catat       |
| **S6** | Cek Dulu & Andai      | 9              | Core value proposition bisa di-demo          |
| **S7** | Settings & Profil     | 13             | User bisa kelola data & preferensi           |
| **S8** | PWA & Pro Features    | 12             | App siap dijual — install, offline, Pro live |
|        |                       | **77 stories** |                                              |

---

## Sprint 1 — Fondasi Teknis

> **Sprint Goal:** Project bisa jalan di browser, database tersedia, tooling terpasang. Tidak ada fitur yang bisa dilihat user — ini pondasi yang membuat sprint berikutnya bisa bergerak cepat tanpa technical debt dari hari pertama.
>
> **Kenapa ini sprint pertama?** Karena keputusan teknis yang dibuat di sini (folder structure, DB schema, clock injection) mahal untuk diubah nanti. Better to slow down now than refactor at Sprint 5.

---

### US-1.1 | Project Setup Lengkap

**Sebagai** developer,
**saya ingin** setup Vite + React + TypeScript + CSS Modules dengan konfigurasi sesuai engineering guidelines,
**agar** semua developer (dan Claude Code) bisa bekerja dari baseline yang konsisten tanpa debugging config.

**Acceptance Criteria:**

- [ ] `npm run dev` jalan tanpa error
- [ ] `npm run build` menghasilkan `dist/` tanpa warning
- [ ] ESLint dan Prettier tidak ada violation di fresh project
- [ ] `tsconfig.json` mengaktifkan strict mode (`"strict": true`)
- [ ] CSS Modules tersupport — import `*.module.css` tidak error

**Priority:** 🔴 P0 | **Points:** 2

---

### US-1.2 | Folder Structure Feature-Based

**Sebagai** developer,
**saya ingin** folder structure feature-based terbentuk sesuai spec,
**agar** kode satu fitur hidup berdekatan dan tidak ada hunting lintas-folder saat implement fitur baru.

**Acceptance Criteria:**

- [ ] Folder `src/app/`, `src/features/`, `src/shared/`, `src/db/`, `src/constants/` terbentuk
- [ ] Tidak ada logic bisnis di `src/app/` — hanya root setup
- [ ] `src/store/` ada (kosong intentional — placeholder untuk Zustand kalau dibutuhkan)

**Notes:** Folder kosong di-commit dengan `.gitkeep`. Ini sinyal intentional bahwa strukturnya sudah dipikirkan.

**Priority:** 🔴 P0 | **Points:** 1

---

### US-1.3 | Database Schema v1

**Sebagai** developer,
**saya ingin** Dexie database tersetting dengan semua tabel v1 terdefinisi,
**agar** semua sprint selanjutnya bisa langsung baca/tulis data tanpa setup ulang.

**Acceptance Criteria:**

- [ ] `db/database.ts` ada dengan tabel: `transactions`, `wallets`, `tagihan`, `goals`, `settings`, `license`, `meta`
- [ ] Schema menggunakan Dexie versioning — upgrade path sudah ada meski belum ada migrasi
- [ ] Import `db` dari komponen manapun tidak throw error
- [ ] Unit test: buka DB, write + read satu record per tabel, tidak ada error

**Notes:** Schema ini tidak bisa sembarangan diubah setelah ada user data. Pikirkan field dengan matang — lebih mudah menambah field baru nanti daripada menghapus yang sudah ada.

**Priority:** 🔴 P0 | **Points:** 3

---

### US-1.4 | Clock Injection

**Sebagai** developer,
**saya ingin** `ClockProvider` tersedia di root app dan `useClock()` bisa dipakai di komponen manapun,
**agar** semua kalkulasi yang bergantung waktu bisa di-test dengan `FixedClock` tanpa mocking global `Date`.

**Acceptance Criteria:**

- [ ] `ClockProvider` membungkus seluruh app di `main.tsx`
- [ ] `useClock()` mengembalikan `{ now, today }`
- [ ] `FixedClock` tersedia di `src/shared/clock/` untuk inject di test
- [ ] Tidak ada `new Date()` atau `Date.now()` di luar `SystemClock` — ESLint rule atau comment convention
- [ ] Pure utils menerima `nowMs: number` sebagai parameter, tidak memanggil clock sendiri

**Notes:** Ini investasi untuk testability. Semua kalkulasi financial (budget harian, sisa gajian, expiry license) bergantung waktu — tanpa clock injection, test mereka jadi flaky atau tidak bisa diwrite sama sekali.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-1.5 | Design Tokens Terpasang

**Sebagai** developer,
**saya ingin** design tokens CSS terpasang sebagai CSS custom properties,
**agar** tidak ada hardcoded hex di komponen dan dark mode v2 bisa di-implement hanya dengan swap palette.

**Acceptance Criteria:**

- [ ] Semua token dari design system tersedia sebagai `var(--canvas)`, `var(--accent)`, dll.
- [ ] Inter Tight dan JetBrains Mono ter-load via Google Fonts atau self-hosted
- [ ] `font-feature-settings: "tnum", "lnum"` aktif global untuk elemen numerik
- [ ] Tidak ada hardcoded hex (`#RRGGBB`) di seluruh codebase — Prettier/ESLint rule

**Priority:** 🟡 P1 | **Points:** 2

---

### US-1.6 | Routing Dasar

**Sebagai** developer,
**saya ingin** React Router tersetting dengan route `/onboarding` dan `/` (home),
**agar** routing guard bisa di-implement di sprint selanjutnya tanpa refactor besar.

**Acceptance Criteria:**

- [ ] Route `/onboarding` render `OnboardingPage` placeholder
- [ ] Route `/` render `HomePage` placeholder
- [ ] Route tidak dikenal redirect ke `/`
- [ ] Placeholder page sudah memakai design tokens (bukan bare HTML)

**Priority:** 🔴 P0 | **Points:** 1

---

### US-1.7 | CI/CD Pipeline

**Sebagai** developer,
**saya ingin** GitHub Actions CI dan Vercel auto-deploy tersambung,
**agar** setiap PR punya preview deployment dan setiap merge ke `main` otomatis ke production tanpa manual deploy.

**Acceptance Criteria:**

- [ ] Push ke branch apapun → CI jalan: `tsc --noEmit` + `eslint` + `prettier --check` + `vitest run` + `vite build`
- [ ] CI gagal kalau ada satu step yang fail
- [ ] PR ke `main` → Vercel preview URL ter-generate dan link muncul di PR
- [ ] Merge ke `main` → Vercel production deploy otomatis

**Notes:** CI ini adalah safety net. Investasi 2 jam sekarang menghemat puluhan jam debugging deployment mismatch nanti.

**Priority:** 🟡 P1 | **Points:** 2

---

### US-1.8 | Git Hooks Pre-commit

**Sebagai** developer,
**saya ingin** Husky + lint-staged + commitlint terpasang,
**agar** kode yang masuk repo selalu lulus format check dan commit message-nya konsisten.

**Acceptance Criteria:**

- [ ] Commit dengan format salah (contoh: `"update stuff"`) di-reject oleh commitlint
- [ ] Commit dengan format benar (contoh: `"feat: add wallet module"`) diterima
- [ ] File yang di-stage di-auto-fix ESLint dan Prettier sebelum commit
- [ ] `pre-push` menjalankan `tsc --noEmit` — type error tidak bisa di-push

**Notes:** Valid commit types: `feat fix refactor chore test docs perf ci build style`. Header max 100 chars.

**Priority:** 🟡 P1 | **Points:** 1

---

## Sprint 2 — License & Aktivasi

> **Sprint Goal:** Sistem license key Ed25519 berjalan end-to-end. Setelah sprint ini, SISA bisa dijual — ada mekanisme yang membedakan siapa yang sudah bayar dan siapa yang belum.
>
> **Kenapa ini sebelum UI?** Karena license system adalah constraint yang mempengaruhi hampir semua fitur. Tier Basic vs Pro menentukan limit wallet, fitur Andai Pro, multi-currency — kalau sistem ini belum ada, setiap fitur yang dibangun harus di-retrofit. Bangun fondasi dulu.

---

### US-2.1 | Key Generation Script

**Sebagai** developer,
**saya ingin** script `gen-license.ts` yang bisa generate license key valid untuk tier Basic dan Pro,
**agar** bisa generate key untuk dijual via Clicky/Gumroad tanpa tooling eksternal.

**Acceptance Criteria:**

- [ ] Script jalan via `npx ts-node scripts/gen-license.ts --tier basic` dan `--tier pro`
- [ ] Output: string format `base64url.base64url` (payload + signature)
- [ ] Payload berisi: `tier`, `exp` (Unix timestamp 90 hari dari now), `iat`, `jti` (UUID)
- [ ] `scripts/` ada di `.gitignore` — private key tidak pernah masuk repo
- [ ] `licenses.log` ada di `.gitignore`

**Notes:** Private key keluar dari repo adalah _non-negotiable_. Kalau private key bocor, semua license yang pernah diissue bisa dipalsukan.

**Priority:** 🔴 P0 | **Points:** 3

---

### US-2.2 | Verifikasi License Key di Input

**Sebagai** Aqil yang baru beli SISA,
**saya ingin** memasukkan license key saya dan langsung tahu apakah valid atau tidak,
**agar** saya bisa mulai pakai app tanpa menunggu atau menghubungi support.

**Acceptance Criteria:**

- [ ] Input field menerima key format `XXXX-XXXX-XXXX-XXXX` dengan auto-format saat ngetik
- [ ] Validasi signature Ed25519 via Web Crypto API — bukan trust flag tersimpan
- [ ] Key invalid → error inline `"kode ga valid, cek email lo lagi"` (bukan modal scary)
- [ ] Key expired → pesan spesifik `"kode ini sudah expired, perpanjang di sini ›"`
- [ ] Key valid → lanjut ke step berikutnya
- [ ] Validasi terjadi on-device, tidak ada request ke server

**Priority:** 🔴 P0 | **Points:** 3

---

### US-2.3 | Persistensi License di IndexedDB

**Sebagai** Aqil yang sudah aktivasi,
**saya ingin** status license saya tetap terbaca setiap kali buka app,
**agar** tidak perlu input key ulang setiap sesi.

**Acceptance Criteria:**

- [ ] Setelah aktivasi sukses: key + decoded payload + `lastSeenAt` tersimpan di tabel `license`
- [ ] Buka app ulang → signature di-verify ulang (bukan trust flag tersimpan saja)
- [ ] `expiresAt` dan `buyerIdHash` terbaca benar dari payload setelah restart
- [ ] Data license tersimpan secara lokal — tidak ada call ke server

**Notes:** App memverifikasi signature SETIAP buka, bukan percaya flag `isValid: true` yang tersimpan. Flag bisa dimanipulasi, signature tidak bisa.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-2.4 | Deteksi Expiry & Status License

**Sebagai** app,
**saya ingin** mendeteksi dan menangani semua status license dengan tepat,
**agar** user yang license-nya habis tidak tiba-tiba di-block tanpa penjelasan.

**Acceptance Criteria:**

- [ ] Status yang didukung: `unactivated` / `active` / `expired` / `invalid` / `tampered`
- [ ] `expired` → pesan perpanjang yang non-blocking — data tetap bisa diakses, tidak ada hard lock
- [ ] `invalid` (signature gagal) → pesan netral, tawaran input key baru
- [ ] Expiry dicek via `Clock.now()` vs `payload.exp` — tidak bisa ditipu dengan ubah jam device (lihat US-2.5)
- [ ] Fungsi `determineLicenseStatus()` adalah single entry point — tidak ada duplikasi logika cek status

**Notes:** "Non-blocking expired" adalah keputusan bisnis yang disengaja. Kita tidak ingin user kehilangan akses ke data mereka secara mendadak. Perpanjangan harus _mudah_, bukan _dipaksa_.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-2.5 | Anti-Rollback Clock

**Sebagai** app,
**saya ingin** mendeteksi kalau jam device dimundurkan untuk memperpanjang masa aktif license,
**agar** bypass sederhana tidak berhasil tanpa usaha signifikan.

**Acceptance Criteria:**

- [ ] `lastSeenAt` di-update setiap kali app dibuka
- [ ] Jika `Clock.now() < lastSeenAt - TOLERANCE` (6 jam) → status `tampered`
- [ ] Pesan `tampered` netral: `"jam device kelihatan mundur, cek pengaturan waktu lo"` — bukan accusatory
- [ ] `TOLERANCE` adalah konstanta yang terdefinisi di `constants/`, bukan magic number

**Notes:** Ini anti-bypass ringan — cukup untuk mencegah casual cheating (mundurkan jam), tidak cukup untuk mencegah determined hacker. Itu acceptable sesuai threat model kita ("bypass = medium effort diterima").

**Priority:** 🟡 P1 | **Points:** 2

---

### US-2.6 | Unit Test License System

**Sebagai** developer,
**saya ingin** seluruh logika license tercover unit test,
**agar** refactor di masa depan tidak bisa secara tidak sengaja memecah security invariant.

**Acceptance Criteria:**

- [ ] Test: key valid → `active` ✓
- [ ] Test: key dengan signature palsu → `invalid` ✓
- [ ] Test: key expired (`exp` = kemarin) → `expired` ✓
- [ ] Test: clock dimundurkan melampaui tolerance → `tampered` ✓
- [ ] Test: tier Basic vs Pro terbaca benar dari payload ✓
- [ ] Test menggunakan test key pair yang di-hardcode (bukan production key) — aman di-commit
- [ ] Setiap util punya minimal 3 kasus: happy · empty · boundary

**Priority:** 🟡 P1 | **Points:** 2

---

## Sprint 3 — Onboarding Flow

> **Sprint Goal:** User baru bisa menyelesaikan setup dari bahasa sampai landing di home dalam < 2 menit, dengan semua data tersimpan ke IndexedDB.
>
> **Kenapa target < 2 menit?** Karena target persona kita adalah "Overwhelmed Beginner" — orang yang sudah 3x install-uninstall tracker karena ribet. Kalau onboarding > 2 menit, kita sudah kalah sebelum user lihat home screen.

---

### US-3.1 | Pilih Bahasa

**Sebagai** Aqil yang baru install SISA,
**saya ingin** memilih bahasa di layar pertama sebelum melakukan apapun,
**agar** sisa onboarding terasa native dan tidak ada momen kebingungan karena bahasa salah.

**Acceptance Criteria:**

- [ ] Dua pilihan: Bahasa Indonesia (`ID`) dan English (`EN`)
- [ ] Code chip mono (`ID`/`EN`) — bukan flag emoji (melanggar anti-emoji design policy)
- [ ] Tidak ada default selection — user wajib pilih sebelum bisa lanjut
- [ ] Pilihan tersimpan ke `settings.language`
- [ ] Button "Lanjut" disabled sampai pilihan dibuat

**Priority:** 🔴 P0 | **Points:** 1

---

### US-3.2 | Input License Key di Onboarding

**Sebagai** Aqil yang sudah beli SISA,
**saya ingin** memasukkan license key saya sebelum melihat intro app,
**agar** saya tidak perlu baca slide dulu baru bisa aktivasi — experience-nya langsung kerasa "sudah bayar, langsung masuk".

**Acceptance Criteria:**

- [ ] Step 2 muncul setelah pilih bahasa, sebelum slide mental model
- [ ] Copy: `"Tempel kode lisensi"` + sub-copy `"Kode dikirim ke email lo abis beli."`
- [ ] Link `"Belum punya kode? Beli di sini ›"` buka tab baru ke Clicky/Gumroad
- [ ] Verifikasi key dari US-2.2 berjalan di sini
- [ ] Key valid → lanjut ke Step 3
- [ ] Key gagal → error inline, tidak redirect ke manapun

**Notes:** License di depan adalah keputusan UX yang disengaja — yang sudah bayar tidak dipaksa baca marketing copy dulu.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-3.3 | Slide Mental Model

**Sebagai** Aqil yang baru aktivasi,
**saya ingin** melihat satu slide yang menjelaskan paradigma SISA,
**agar** saya tidak kaget kenapa tidak ada pie chart dan langsung ngerti cara pakai yang benar.

**Acceptance Criteria:**

- [ ] Copy ID — heading: `"Data lo, ga kemana-mana."` · body1: `"Catat duit, andai skenario, cek sebelum beli."` · body2: `"Ga ada akun. Ga ada server. Kami ga tau lo siapa."`
- [ ] Copy EN — heading: `"Your data goes nowhere."` · body1: `"Log expenses, run what-ifs, check before you buy."` · body2: `"No account. No server. We have no idea who you are."`
- [ ] Tombol `"Lanjut"` yang jelas
- [ ] Link `"Lewati ›"` kecil di pojok — tersedia tapi tidak prominent
- [ ] Satu slide, tidak ada swipe carousel

**Notes:** Heading fokus pada local-first privacy, bukan paradigma "bukan tracker" — karena fitur tracking akan ditambah. Privacy angle tetap defensible: tidak ada server, tidak ada akun, SISA literally tidak bisa tahu siapa user-nya.

**Priority:** 🟡 P1 | **Points:** 1

---

### US-3.4 | Setup Tipe Income

**Sebagai** Aqil (gaji tetap) atau Rara (freelance),
**saya ingin** memilih tipe income saya dan mengisi detail yang relevan,
**agar** SISA bisa menghitung budget harian dan "sisa pas gajian" dengan formula yang tepat untuk situasi saya.

**Acceptance Criteria:**

- [ ] Tiga pilihan: `Gaji bulanan tetap` / `Freelance / project-based` / `Mix — ada gaji + freelance`
- [ ] Pilih "Gaji tetap" → Step 4b: input tanggal gajian (angka 1–31)
- [ ] Pilih "Freelance" → Step 4b: input saldo minimum (angka currency)
- [ ] Pilih "Mix" → Step 4b: input tanggal + note bahwa income freelance dicatat manual via Quick Log
- [ ] Weekend behavior **tidak** ditanya di onboarding — di-defer kontekstual
- [ ] Semua data tersimpan ke `settings.incomeType`, `settings.payDay`, dll.

**Notes:** Sub-copy tiap step 4b menjelaskan WHY SISA butuh data ini — mengurangi churn di momen "kenapa harus ngasih info pribadi?". Weekend behavior di-defer kontekstual (tidak ditanya di onboarding).

**Priority:** 🔴 P0 | **Points:** 2

---

### US-3.5 | Pilih Mata Uang Utama

**Sebagai** user baru,
**saya ingin** memilih mata uang utama dari daftar yang bisa di-search,
**agar** semua angka di app tampil dengan simbol currency yang benar dari hari pertama.

**Acceptance Criteria:**

- [ ] Picker bottom sheet dengan search input
- [ ] Dua section: `Populer` (IDR, USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, CAD) dan `Semua A–Z`
- [ ] Format tiap item: `[symbol]  [code]  [nama lengkap]` — contoh: `Rp  IDR  Rupiah Indonesia`
- [ ] Tidak ada default — wajib pilih
- [ ] Search berfungsi real-time, match di nama atau kode

**Priority:** 🔴 P0 | **Points:** 2

---

### US-3.6 | Setup Wallet Pertama

**Sebagai** user baru,
**saya ingin** menambahkan minimal satu wallet dengan nama dan saldo awal,
**agar** home screen langsung menampilkan angka yang bermakna, bukan empty state.

**Acceptance Criteria:**

- [ ] Input: nama wallet (teks bebas) + saldo awal (numerik, prefix currency dari step sebelumnya)
- [ ] Minimal 1 wallet wajib diisi — tombol "Lanjut" disabled kalau belum ada
- [ ] Tombol `"+ Tambah wallet lain"` tersedia (opsional, sampai limit tier)
- [ ] Basic: max 4 wallet. Pro: max 10 wallet.
- [ ] Data tersimpan ke tabel `wallets` dengan `balance` awal

**Notes:** `WalletInput.id` dari `crypto.randomUUID()` hanya untuk React key management selama onboarding — tidak disimpan ke DB. DB generate ID sendiri.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-3.7 | Setup Currency Kedua (Pro Only)

**Sebagai** Dira (user Pro dengan income USD),
**saya ingin** ditawari menambah currency kedua di akhir onboarding,
**agar** saya bisa langsung setup wallet USD tanpa perlu balik ke Settings nanti.

**Acceptance Criteria:**

- [ ] Step ini **hanya muncul untuk user Pro** — Basic langsung ke home
- [ ] Copy: `"Pakai mata uang lain juga?"` (bukan "Lo Pro — bisa tambah currency kedua" yang kaku)
- [ ] Dua pilihan: `"Nanti aja"` (default) dan `"+ Tambah"`
- [ ] Pilih `"+ Tambah"` → picker currency yang sama dengan US-3.5
- [ ] Setelah pilih currency kedua → form wallet dengan currency baru

**Priority:** 🟢 P2 | **Points:** 2

---

### US-3.8 | Landing di Home dengan Backup Card

**Sebagai** user yang selesai onboarding,
**saya ingin** langsung landing di home dengan data tersisi dan mendapat panduan backup yang tidak ganggu,
**agar** saya langsung lihat value app tanpa terhalang modal atau tutorial yang panjang.

**Acceptance Criteria:**

- [ ] Home menampilkan saldo dari wallet yang dibuat di onboarding
- [ ] Backup info card muncul di home (bukan modal — dismissible card)
- [ ] Copy card ID: _"Data SISA tersimpan di HP ini. Kalau ganti HP tanpa backup, data hilang."_
- [ ] Copy card EN: _"SISA data lives on this phone. Switch phones without a backup and it's gone."_
- [ ] Link `"Cara backup ›"` membuka sheet guide 3-step
- [ ] Setelah onboarding selesai, routing ke `/onboarding` di-block (redirect ke `/`)
- [ ] Empty state tagihan: _"Belum ada tagihan bulanan. Tambah ›"_
- [ ] Empty state goal: _"Setup Dana Darurat lo. Mulai ›"_

**Priority:** 🔴 P0 | **Points:** 2

---

## Sprint 4 — Home Canvas (Basic)

> **Sprint Goal:** Home canvas Basic lengkap dan bisa dibaca — semua modul tampil dengan data nyata dari IndexedDB. Fokus sprint ini bukan interaksi (itu Sprint 5), tapi _rendering yang benar_ dan _kalkulasi yang akurat_.
>
> **Kenapa pisah render dan interaksi?** Karena kalkulasi yang salah lebih berbahaya dari swipe yang belum kerja. Lebih baik home yang bisa dibaca tapi belum interaktif, daripada home yang interaktif tapi angkanya salah.

---

### US-4.1 | Header Bar

**Sebagai** user,
**saya ingin** melihat header yang identik dengan design SISA,
**agar** branding konsisten dan saya tahu di mana settings berada.

**Acceptance Criteria:**

- [ ] Wordmark "SISA" — font 11px, weight 700, letter-spacing 1.5px
- [ ] Settings icon kanan: 3 garis horizontal dengan dot asimetris di tiap garis (bukan hamburger biasa)
- [ ] Tap settings icon → navigasi ke Settings
- [ ] Tidak ada border circle di settings icon

**Notes:** Settings icon yang _bukan_ hamburger adalah sinyal visual bahwa ini "controls", bukan "navigation". Detail kecil tapi penting untuk positioning sebagai operator tool.

**Priority:** 🟡 P1 | **Points:** 1

---

### US-4.2 | Modul Saldo Total & Wallet List

**Sebagai** Aqil,
**saya ingin** melihat total saldo dan list wallet saya di home,
**agar** saya langsung tahu kondisi keuangan saya secara menyeluruh tanpa perlu navigasi ke tempat lain.

**Acceptance Criteria:**

- [ ] Angka saldo total — 38px, semibold, JetBrains Mono
- [ ] Subtitle: `"Rp X terpakai kemarin"` atau `"Rp X masuk kemarin"` (dinamis dari transaksi terakhir)
- [ ] Wallet list auto-expanded (tidak perlu tap untuk expand)
- [ ] Saldo per wallet — JetBrains Mono, tabular-nums
- [ ] Summary breakdown (muncul kalau ada tagihan/tabungan): baris tagihan (−), tabungan (−), sisa (bold)
- [ ] Basic: max 4 wallet ditampilkan

**Notes:** Saldo yang ditampilkan di sini adalah **total saldo** (semua wallet dijumlah). Yang ditampilkan sebagai hero di bawahnya adalah **sisa** (saldo − tagihan − tabungan). Dua angka berbeda, dua fungsi berbeda.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-4.3 | Modul Budget Hari Ini

**Sebagai** Aqil,
**saya ingin** melihat budget harian saya dengan formula yang transparan,
**agar** saya tahu bukan hanya angkanya tapi juga _dari mana_ angka itu berasal.

**Acceptance Criteria:**

- [ ] Formula: `(saldo − tagihan tersisa − target tabungan) ÷ hari sampai gajian`
- [ ] Angka budget — 30px hero
- [ ] Progress bar tebal 22px — fill cobalt untuk terpakai, track `--surface-2` untuk sisa
- [ ] Footer 2 baris: kiri `"Rp X terpakai"`, kanan `"Rp Y sisa hari ini"`
- [ ] Meta header kanan: `"N hari sampai gajian (tgl X)"` — eksplisit tanggal
- [ ] Icon ⓘ kecil → tap → popup formula penjelasan
- [ ] Kalkulasi menggunakan `useClock()` — tidak ada `Date.now()` langsung

**Priority:** 🔴 P0 | **Points:** 3

---

### US-4.4 | Modul 2 Kolom — Budget Minggu & Sisa Gajian

**Sebagai** Aqil,
**saya ingin** melihat dua metrik forecast sekaligus — budget minggu ini dan sisa pas gajian,
**agar** saya punya gambaran horizon menengah selain budget harian.

**Acceptance Criteria:**

- [ ] Layout grid 2 kolom sejajar
- [ ] Kolom kiri: "budget minggu ini" — total budget sampai hari Minggu
- [ ] Kolom kanan: "sisa pas gajian" — prediksi saldo di hari terakhir sebelum gajian
- [ ] Sisa pas gajian punya status signal: `aman` (hijau) / `ketat` (amber) / `bahaya` (merah) — inline text color, bukan badge
- [ ] Akurasi prediksi inline: `"akurasi: 81% ›"` (kalau sudah ada data historis)
- [ ] Saldo 0 → tampil `"—"` bukan `"Rp 0"` yang misleading

**Priority:** 🟡 P1 | **Points:** 2

---

### US-4.5 | Modul Tagihan Bulan Ini

**Sebagai** Aqil,
**saya ingin** melihat tagihan saya diurut berdasarkan urgency,
**agar** yang paling mendesak selalu muncul di atas tanpa perlu scroll.

**Acceptance Criteria:**

- [ ] Ranking urgency: (1) lewat jatuh tempo + belum dibayar, (2) due hari ini, (3) dalam 7 hari, (4) sisanya di-collapse
- [ ] Max 4 tagihan tampil — sisanya di-expand via link `"lihat X lagi ›"`
- [ ] Simbol `±` di depan nominal tagihan variabel
- [ ] Tagihan yang sudah dibayar tidak muncul di list utama

**Priority:** 🔴 P0 | **Points:** 2

---

### US-4.6 | Notification Card Kondisional

**Sebagai** Aqil,
**saya ingin** melihat alert hanya saat ada tagihan yang benar-benar urgent,
**agar** saya tidak notification fatigue — kalau card itu muncul, artinya serius.

**Acceptance Criteria:**

- [ ] Card hanya muncul jika ada tagihan lewat tempo atau due hari ini
- [ ] Jika tidak ada urgent: card tidak ada sama sekali (bukan card kosong)
- [ ] Background `--signal-danger-bg`, border-left 3px `--signal-danger`
- [ ] Tap card → bottom sheet daftar urgency detail
- [ ] Card muncul di atas modul saldo, bukan di bawah

**Priority:** 🟡 P1 | **Points:** 1

---

### US-4.7 | Modul Goal Tabungan

**Sebagai** Aqil,
**saya ingin** melihat goal tabungan saya dengan visual yang jelas mana yang sedang diisi dan mana yang antri,
**agar** saya bisa langsung baca prioritas tabungan saya tanpa baca label atau angka persen.

**Acceptance Criteria:**

- [ ] Goal aktif ("lagi diisi"): bar 3px parsial + persentase + warna hidup
- [ ] Goal antri ("nunggu giliran"): tanpa bar sama sekali, teks redup, italic "nunggu giliran"
- [ ] Goal tercapai: bar penuh + ikon ✓ + teks "tercapai"
- [ ] Perbedaan aktif vs antri harus tegas secara visual — bukan opacity decay halus
- [ ] Goal Rp 0 total tabungan: tidak ada bar (bukan bar kosong)
- [ ] Footer meta: `"nabung lagi: [nama goal teratas] · tahan & geser untuk ganti urutan"`

**Notes:** Paradigma waterfall: total tabungan "dituang" dari goal teratas ke bawah. Goal teratas adalah yang sedang "diisi" — hanya ada satu yang aktif pada satu waktu (kecuali kalau goal atas sudah penuh dan masih ada sisa).

**Priority:** 🟡 P1 | **Points:** 2

---

### US-4.8 | Footer Catatan Terakhir

**Sebagai** Aqil,
**saya ingin** melihat catatan terakhir dalam satu baris di footer home,
**agar** ada sinyal visual bahwa data saya masih fresh tanpa app jadi terasa seperti expense tracker.

**Acceptance Criteria:**

- [ ] 1 baris: nama transaksi (primary) + amount (JetBrains Mono, `--signal-danger` untuk keluar) + link `"semua catatan ›"` (`--accent`)
- [ ] Tap `"semua catatan ›"` → History Sheet
- [ ] Tidak ada list transaksi, tidak ada "berapa pengeluaran hari ini" — satu baris saja

**Priority:** 🟢 P2 | **Points:** 1

---

### US-4.9 | Bottom Action Area (3 Tombol)

**Sebagai** user,
**saya ingin** tiga aksi utama selalu tersedia di bawah layar,
**agar** tidak perlu navigasi untuk aksi yang paling sering dilakukan.

**Acceptance Criteria:**

- [ ] Tiga tombol: `+ Catat` (kiri, 64px) · `Cek Dulu` (tengah, flex-1, cobalt) · `Andai` (kanan, 64px)
- [ ] Cek Dulu dominan visual: background `--accent` (cobalt), teks putih, subtitle `"aman ga gue beli ini?"`
- [ ] Catat dan Andai: background `--surface`, teks `--ink-primary`
- [ ] Area ini fixed bottom — tidak scroll bersama konten
- [ ] Haptic feedback saat tap (via Vibration API, feature-detect)

**Priority:** 🔴 P0 | **Points:** 2

---

### US-4.10 | Unit Test Kalkulasi Home

**Sebagai** developer,
**saya ingin** semua kalkulasi home tercover unit test,
**agar** perubahan formula tidak bisa secara tidak sengaja merusak angka yang ditampilkan ke user.

**Acceptance Criteria:**

- [ ] Test budget harian: saldo normal, saldo 0, tagihan > saldo, gajian tanggal 31, freelance mode
- [ ] Test sisa gajian: tanpa tagihan, dengan tagihan, saldo mepet
- [ ] Test waterfall goal: total tabungan dibagi ke goal sesuai urutan
- [ ] Semua test menggunakan `FixedClock` — tidak ada flakiness karena waktu
- [ ] Coverage: happy · empty · boundary per fungsi

**Priority:** 🟡 P1 | **Points:** 2

---

## Sprint 5 — Interaksi Home & Quick Log

> **Sprint Goal:** Data di home bergerak — user bisa mencatat transaksi, menandai tagihan dibayar, reorder goal, dan melihat history. Ini yang membuat home jadi "hidup" bukan hanya dashboard statis.

---

### US-5.1 | Swipe Tagihan untuk Reveal Panel

**Sebagai** Aqil,
**saya ingin** swipe kiri di baris tagihan untuk reveal aksi "tandai dibayar",
**agar** saya bisa mark paid dalam 2 aksi tanpa navigasi ke halaman lain.

**Acceptance Criteria:**

- [ ] Swipe kiri → reveal action panel di belakang baris
- [ ] Panel menampilkan tombol `"tandai dibayar"`
- [ ] Swipe kanan / tap di luar → dismiss panel
- [ ] Haptic light saat panel reveal

**Priority:** 🔴 P0 | **Points:** 2

---

### US-5.2 | Push Sheet Tandai Dibayar

**Sebagai** Aqil,
**saya ingin** mengisi detail pembayaran sebelum konfirmasi,
**agar** data yang masuk ke history akurat — nominal aktual (bukan estimasi), dari wallet yang benar, di tanggal yang benar.

**Acceptance Criteria:**

- [ ] Push sheet berisi: preview item + note dashed (info otomatis kurangi saldo) + nominal editable (pre-fill estimasi) + wallet picker radio + tanggal
- [ ] Wallet picker: radio list, tampilkan saldo per wallet, **tidak ada auto-select** — wajib pilih
- [ ] Tagihan variabel: hint `"selisih +Rp X · normal untuk tagihan variabel"` di bawah nominal
- [ ] Tanggal: default "hari ini", quick pills `"hari ini / kemarin / 2 hari lalu / pilih tanggal ›"`
- [ ] Tombol `"Konfirmasi"` disabled sampai wallet dipilih

**Notes:** Wallet tidak di-auto-select karena asumsi yang salah lebih buruk daripada satu langkah ekstra. User yang punya 2 wallet harus decide sendiri bayar dari mana.

**Priority:** 🔴 P0 | **Points:** 3

---

### US-5.3 | Konfirmasi Tandai Dibayar — 4 Efek Atomik

**Sebagai** Aqil,
**saya ingin** satu tap Konfirmasi menghasilkan semua efek yang diperlukan sekaligus, dengan opsi batal dalam 5 detik,
**agar** tidak ada state yang "setengah jadi" dan saya punya safety net kalau salah tap.

**Acceptance Criteria:**

- [ ] 4 efek atomik saat konfirmasi: (1) saldo wallet turun, (2) entry masuk log catatan dengan tag `"tagihan · [nama]"`, (3) tagihan di-mark paid, (4) toast muncul
- [ ] Toast format: `"✓ [nama] [−Rp nominal] tercatat · dari [wallet] · barusan"` + `"Ubah"` + `"Batal"` + countdown bar 5 detik
- [ ] `"Batal"` → revert **semua** 4 efek — tidak ada partial revert
- [ ] `"Ubah"` → buka push sheet lagi pre-filled
- [ ] Toast auto-dismiss setelah 5 detik
- [ ] Toast posisi: di atas bottom action area (bukan di top screen)
- [ ] Haptic medium saat konfirmasi berhasil

**Priority:** 🔴 P0 | **Points:** 3

---

### US-5.4 | Expand Wallet Detail dari Saldo

**Sebagai** Aqil,
**saya ingin** tap angka saldo total untuk lihat detail wallet,
**agar** saya bisa cek breakdown per wallet tanpa navigasi ke Settings.

**Acceptance Criteria:**

- [ ] Tap saldo total → inline expand atau Wallet Sheet (bottom sheet)
- [ ] Wallet Sheet menampilkan semua wallet dengan saldo masing-masing
- [ ] Dari Wallet Sheet: bisa tap wallet individual untuk Wallet Detail

**Priority:** 🟡 P1 | **Points:** 1

---

### US-5.5 | Tap Tagihan untuk Detail Sheet

**Sebagai** Aqil,
**saya ingin** tap baris tagihan untuk melihat detail selengkapnya,
**agar** saya bisa cek frekuensi, nominal estimasi, dan riwayat bayar tanpa harus pergi ke Settings.

**Acceptance Criteria:**

- [ ] Tap baris tagihan → push sheet detail (bukan modal overlay)
- [ ] Detail berisi: nama, frekuensi, nominal/estimasi, last paid date, status occurrence
- [ ] Tap notification card → bottom sheet daftar urgent (bukan push sheet)

**Priority:** 🟡 P1 | **Points:** 2

---

### US-5.6 | Quick Log — Mode Keluar

**Sebagai** Aqil yang baru bayar sesuatu,
**saya ingin** catat pengeluaran dalam 3 tap tanpa perlu isi banyak field,
**agar** logging tidak terasa seperti chore dan saya tetap mau melakukannya.

**Acceptance Criteria:**

- [ ] Tap `"+ Catat"` → bottom sheet muncul dari bawah
- [ ] Toggle default: `keluar`
- [ ] Wallet chip horizontal, default = wallet terakhir dipakai + saldo kecil di chip
- [ ] Nominal numpad auto-focus — user langsung bisa ngetik
- [ ] Label opsional: chip scroll (makan, transport, belanja...) — boleh skip
- [ ] Tanggal: quick pills `"hari ini / kemarin / pilih tanggal ›"` — default hari ini
- [ ] Catatan opsional: collapsed by default
- [ ] Tap `"Catat"` → saldo wallet turun + masuk log + toast (dengan Batal 5 detik)

**Priority:** 🔴 P0 | **Points:** 3

---

### US-5.7 | Quick Log — Mode Masuk

**Sebagai** Aqil yang baru terima income,
**saya ingin** catat income dengan toggle sederhana,
**agar** saldo saya langsung terupdate tanpa harus pergi ke Settings.

**Acceptance Criteria:**

- [ ] Toggle ke `masuk`
- [ ] Field: wallet + nominal + label opsional (gaji, freelance, transfer masuk...) + tanggal
- [ ] Tap `"Catat"` → saldo wallet naik + masuk log dengan tag income + toast

**Priority:** 🟡 P1 | **Points:** 1

---

### US-5.8 | Quick Log — Mode Nabung

**Sebagai** Aqil yang mau nabung,
**saya ingin** catat tabungan tanpa harus memilih goal mana yang dituju,
**agar** nabung semudah masukkan uang ke celengan — tidak perlu thinking, langsung lakuin.

**Acceptance Criteria:**

- [ ] Toggle ke `nabung`
- [ ] Field: wallet + nominal + tanggal
- [ ] **Tidak ada step pilih goal** — uang otomatis masuk ke goal teratas (waterfall dari US-4.7)
- [ ] Tap `"Catat"` → total tabungan naik + goal dihitung ulang + saldo wallet turun + toast
- [ ] Toast: `"✓ Nabung Rp X · masuk [nama goal teratas] · barusan"`
- [ ] `"Batal"` = revert atomik: transaksi terhapus + total tabungan dikembalikan + goal dihitung ulang ke kondisi sebelumnya

**Notes:** "Celengan ayam" paradigm — orang yang masukin uang ke celengan tidak mikir "ini buat tujuan apa." Mereka hanya nabung. Pilihan goal via drag-drop di home, bukan per-transaksi.

**Priority:** 🔴 P0 | **Points:** 2

---

### US-5.9 | Tarik Tabungan via Toggle "Dari Tabungan"

**Sebagai** Aqil yang perlu pakai uang tabungan untuk kebutuhan mendesak,
**saya ingin** toggle "dari tabungan" saat catat pengeluaran,
**agar** saya bisa tarik tabungan tanpa flow terpisah, dan app menginformasikan saya kalau tariknya melebihi saldo tabungan.

**Acceptance Criteria:**

- [ ] Quick Log mode keluar: ada toggle `"dari tabungan"` (off by default)
- [ ] Tarik ≤ total tabungan: langsung proceed, total tabungan turun, goal kering dari bawah ke atas
- [ ] Tarik > total tabungan: app tanya conversational: `"Tabungan lo cuma Rp X, tapi mau keluar Rp Y. Sisa Rp Z dari mana?"` dengan dua pilihan: `"Ambil dari operasional"` atau `"Batal, ralat nominal"`
- [ ] App tidak proaktif menawarkan toggle ini saat saldo operasional mepet — hanya user yang bisa aktifkan

**Priority:** 🟡 P1 | **Points:** 2

---

### US-5.10 | History Sheet

**Sebagai** Aqil,
**saya ingin** melihat semua transaksi saya dalam satu sheet,
**agar** saya bisa cek riwayat kalau ada yang tidak sesuai tanpa harus export data.

**Acceptance Criteria:**

- [ ] Akses via `"semua catatan ›"` di footer home
- [ ] Urutan reverse chronological (terbaru di atas)
- [ ] Filter: semua / keluar / masuk / nabung
- [ ] Tiap baris: nama + wallet + tanggal + amount (JetBrains Mono)
- [ ] Transaksi keluar: amount merah (`--signal-danger`). Masuk: hijau (`--signal-safe`)

**Priority:** 🟡 P1 | **Points:** 2

---

### US-5.11 | Drag-Drop Reorder Goal

**Sebagai** Aqil,
**saya ingin** drag-drop goal untuk mengubah urutan prioritas,
**agar** saya bisa memutuskan goal mana yang diisi duluan tanpa harus pergi ke Settings.

**Acceptance Criteria:**

- [ ] Long-press → drag handle muncul → bisa di-drag ke posisi baru
- [ ] Drop → urutan tersimpan ke DB
- [ ] Setelah reorder: total tabungan dihitung ulang ke urutan baru
- [ ] Goal yang naik ke atas: bar nyala. Goal yang tadinya aktif dan turun: bar mati
- [ ] Visual feedback saat drag: baris yang di-drag sedikit terangkat (shadow tipis)

**Priority:** 🟡 P1 | **Points:** 2

---

## Sprint 6 — Cek Dulu & Andai (Basic)

> **Sprint Goal:** Dua fitur flagship berfungsi penuh untuk Basic tier. Setelah sprint ini, SISA sudah bisa mendemonstrasikan _kenapa dia ada_ — bukan expense tracker, tapi decision support tool.
>
> **Test demo yang harus bisa dilakukan setelah sprint ini:** Buka app → Cek Dulu → ketik nominal → lihat angka bergerak real-time → tutup → Andai → tumpuk 3 variabel → lihat hasil. Kalau demo ini bisa dilakukan dalam 60 detik, sprint sukses.

---

### US-6.1 | Buka Cek Dulu Canvas

**Sebagai** Aqil yang lagi di kasir atau Shopee,
**saya ingin** buka Cek Dulu dan langsung bisa ketik nominal tanpa step tambahan,
**agar** saya bisa dapat jawaban dalam 5 detik.

**Acceptance Criteria:**

- [ ] Masuk dari DecisionHero (home): nominal dari home input ter-carry ke CekDuluPage — tidak input dua kali
- [ ] Masuk via bottom bar "Cek Dulu": input kosong, auto-focus, user ketik dari sini
- [ ] Tidak ada toggle, tidak ada step, tidak ada form — satu input: nominal
- [ ] Back button / gesture back tersedia

**Priority:** 🔴 P0 | **Points:** 1

---

### US-6.2 | Comparison Real-Time Before vs After

**Sebagai** Aqil,
**saya ingin** melihat dampak pembelian berubah real-time saat saya mengetik nominal,
**agar** saya langsung _merasakan_ berapa besar dampaknya tanpa harus tap "hitung".

**Acceptance Criteria:**

- [ ] Setiap keystroke → kolom "kalau beli" bergerak real-time
- [ ] Kolom "sekarang": redup (`--ink-tertiary`)
- [ ] Kolom "kalau beli": pekat (`--ink-primary`)
- [ ] Tidak ada tombol "hitung" — hasil muncul otomatis
- [ ] Debounce tidak diperlukan — update setiap digit

**Priority:** 🔴 P0 | **Points:** 2

---

### US-6.3 | Baris Comparison Adaptif

**Sebagai** Aqil,
**saya ingin** melihat baris comparison yang muncul sesuai seberapa berat pengeluaran yang saya masukkan,
**agar** bertambahnya baris sendiri sudah jadi sinyal — tidak perlu app bilang "awas bahaya".

**Acceptance Criteria:**

- [ ] Baris 1 (jatah harian sampai gajian): selalu muncul
- [ ] Baris 2 (sisa operasional): muncul saat nominal menembus batas operasional
- [ ] Baris 3 (tabungan kepotong): muncul hanya saat nominal menyentuh tabungan
- [ ] Baris 3 punya sub-note: berapa yang diambil dari tabungan
- [ ] Tidak ada label "aman / ketat / bahaya" — angka yang bicara
- [ ] Insight list muncul di bawah comparison frame saat nominal > 0:
  - "Setara N hari jatah harian lo."
  - "X% dari sisa lo bulan ini."
  - "Butuh ~N hari nabung untuk pulih ke level tabungan sekarang." (hanya saat tabungan kepotong)
- [ ] Meta kecil di bawah: `"dihitung dari saldo total · N wallet · Rp X"`

**Priority:** 🔴 P0 | **Points:** 3

---

### US-6.4 | Tutup Cek Dulu Tanpa Catat

**Sebagai** Aqil yang hanya mau "intip" konsekuensi,
**saya ingin** bisa tutup Cek Dulu tanpa ada yang ter-log,
**agar** saya bebas konsultasi sesering mau tanpa takut data saya jadi berantakan.

**Acceptance Criteria:**

- [ ] Tombol `"Tutup"` → dismiss canvas
- [ ] Tidak ada transaksi yang dibuat
- [ ] Tidak ada saldo yang berubah
- [ ] Tidak ada prompt "yakin mau keluar?" — langsung dismiss

**Priority:** 🔴 P0 | **Points:** 1

---

### US-6.5 | Jadi Beli — Lanjut ke Quick Log

**Sebagai** Aqil yang memutuskan jadi beli,
**saya ingin** nominal yang sudah saya ketik di Cek Dulu langsung ter-fill di Quick Log,
**agar** saya tidak perlu ngetik ulang dan tidak ada celah kesalahan input.

**Acceptance Criteria:**

- [ ] Tombol `"Jadi beli — catat keluar"` membuka Quick Log Sheet
- [ ] Nominal sudah terisi (dari Cek Dulu)
- [ ] User masih harus pilih wallet dan bisa tambah label — tidak langsung commit
- [ ] Cek Dulu canvas dismiss setelah Quick Log terbuka

**Priority:** 🟡 P1 | **Points:** 1

---

### US-6.6 | Buka Andai Canvas & Stack Variabel

**Sebagai** Aqil yang mau skenario "andai gue beli laptop + gaji telat bulan ini",
**saya ingin** buka Andai Canvas dan tumpuk beberapa variabel sekaligus,
**agar** saya bisa melihat dampak gabungan berbagai keputusan, bukan hanya satu per satu.

**Acceptance Criteria:**

- [ ] Tap `"Andai"` → full canvas dengan back button
- [ ] Baseline card di atas: selalu nempel, menampilkan kondisi "sekarang" sebagai titik banding
- [ ] Chip picker: `+ beli`, `+ income`, `+ tagihan`, `+ target nabung`
- [ ] Setiap chip yang ditap → item baru masuk ke stack pengandaian
- [ ] Tiap item di stack: jenis andai + deskripsi + nominal/perubahan + tombol hapus (×)
- [ ] Stack bisa menampung kombinasi variabel apapun dalam urutan apapun

**Priority:** 🔴 P0 | **Points:** 3

---

### US-6.7 | Hasil Andai — Comparison Before-After

**Sebagai** Aqil,
**saya ingin** melihat dampak semua pengandaian saya dalam tiga metrik yang jelas,
**agar** saya bisa ambil keputusan berdasarkan angka, bukan perasaan.

**Acceptance Criteria:**

- [ ] Hasil: 3 metrik comparison before → after: (1) jatah harian sampai gajian, (2) sisa pas gajian, (3) total tabungan
- [ ] "Sebelum" tampil redup, "sesudah" tampil pekat — konsisten dengan Cek Dulu
- [ ] Tidak ada verdict "aman/bahaya" — angka saja
- [ ] Hasil update real-time saat user tambah/hapus item di stack
- [ ] Jatah harian adalah metrik pertama (konsistensi anchor dengan Cek Dulu)

**Priority:** 🔴 P0 | **Points:** 2

---

### US-6.8 | Basic User Coba Simpan Andai — Lihat Tag Pro

**Sebagai** Aqil (user Basic) yang tertarik fitur simpan,
**saya ingin** melihat tag Pro hanya saat saya coba simpan, bukan sebelum masuk canvas,
**agar** saya bisa explore Andai sepenuhnya sebelum dihadapkan dengan upsell.

**Acceptance Criteria:**

- [ ] Tombol "Andai" di home tidak punya tag Pro
- [ ] Basic user bisa buka canvas, tambah variabel, lihat hasil — penuh, tanpa batasan
- [ ] Tag Pro muncul hanya saat tap `"Simpan skenario"`
- [ ] Setelah tap Simpan: informasi Pro yang jelas + link upgrade — kalkulasi tetap tampil, tidak hilang

**Notes:** "Pro paywall di dalam, bukan di depan pintu" adalah keputusan filosofis. Kita ingin user _merasakan value_ dulu sebelum dihadapkan dengan conversion moment.

**Priority:** 🟡 P1 | **Points:** 1

---

### US-6.9 | Unit Test Kalkulasi Cek Dulu & Andai

**Sebagai** developer,
**saya ingin** semua kalkulasi Cek Dulu dan Andai tercover unit test,
**agar** refactor formula tidak bisa secara tidak sengaja memecah core value proposition app.

**Acceptance Criteria:**

- [ ] Test Cek Dulu: nominal 0, nominal < daily budget, nominal > saldo operasional, nominal > saldo + tabungan
- [ ] Test Andai: satu variabel, kombinasi semua variabel, variabel hapus dan tambah ulang
- [ ] Test semua menggunakan `FixedClock`
- [ ] Happy · empty · boundary per fungsi

**Priority:** 🟡 P1 | **Points:** 2

---

## Sprint 7 — Settings & Profil

> **Sprint Goal:** User bisa mengelola semua kondisi keuangan (wallet, tagihan, goal, income) dan preferensi app. Ini yang membuat app "milik mereka" — bukan hanya bisa dilihat, tapi bisa dikonfigurasi.

---

### US-7.1 | Akses Settings dari Header

**Sebagai** user,
**saya ingin** tap settings icon di header dan langsung lihat settings yang berguna,
**agar** saya tahu di mana semua kontrol app ini berada.

**Acceptance Criteria:**

- [ ] Tap settings icon → Settings screen/sheet
- [ ] Settings menampilkan profil card di atas (nama, tier badge, sisa hari aktif)
- [ ] Tap profil card → Profil screen

**Priority:** 🟡 P1 | **Points:** 1

---

### US-7.2 | Ganti Tema & Bahasa

**Sebagai** Aqil,
**saya ingin** mengubah tema dan bahasa dari Settings,
**agar** app terasa nyaman untuk saya gunakan.

**Acceptance Criteria:**

- [ ] Section Tampilan: segmented control tema (`terang / gelap / sistem`)
- [ ] Dropdown bahasa (Indonesia / English)
- [ ] Perubahan tema: immediate, real-time — tidak perlu restart
- [ ] Catatan kecil: `"gelap = segera hadir"` untuk dark mode
- [ ] Pilihan tersimpan ke `settings` dan persisten setelah close app

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.3 | Export Backup JSON & CSV

**Sebagai** Aqil,
**saya ingin** export semua data saya ke file JSON dan CSV,
**agar** saya bisa backup mandiri dan tidak bergantung pada server siapapun.

**Acceptance Criteria:**

- [ ] `"Export backup"` → download `.json` berisi semua data + `schemaVersion` + `exportedAt`
- [ ] `"Export transaksi"` → download `.csv` dengan semua transaksi (tanggal, nominal, label, wallet)
- [ ] Format nominal IDR: titik ribuan (1.000.000, bukan 1000000)
- [ ] Keduanya tersedia di Basic — export adalah hak user, bukan fitur premium
- [ ] Tap export → file download langsung, tidak perlu konfirmasi

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.4 | Import Backup dari File

**Sebagai** Aqil yang ganti HP,
**saya ingin** import backup dari file JSON yang sudah saya export sebelumnya,
**agar** semua data saya kembali tanpa setup ulang dari awal.

**Acceptance Criteria:**

- [ ] File picker menerima `.json`
- [ ] Validasi `schemaVersion` — file dari versi app yang tidak kompatibel ditolak dengan pesan jelas
- [ ] Preview ringkasan sebelum konfirmasi: berapa wallet, transaksi, goal, tagihan
- [ ] Konfirmasi → overwrite data yang ada
- [ ] Import sukses → toast konfirmasi
- [ ] Import gagal (file corrupt) → error yang jelas, data lama tidak berubah

**Notes:** Import adalah operasi destructive — data yang ada akan ter-overwrite. Preview sebelum konfirmasi adalah safety net yang penting.

**Priority:** 🟡 P1 | **Points:** 3

---

### US-7.5 | Hapus Semua Data

**Sebagai** Aqil yang mau reset app,
**saya ingin** bisa hapus semua data dengan konfirmasi eksplisit,
**agar** tidak ada aksi tak sengaja yang menghapus bulan kerja pencatatan.

**Acceptance Criteria:**

- [ ] Konfirmasi dua langkah: (1) warning modal, (2) user harus ketik `"HAPUS"` untuk konfirmasi
- [ ] Setelah hapus → redirect ke onboarding (fresh start)
- [ ] Tidak ada undo setelah konfirmasi — ini permanent

**Notes:** Dua langkah konfirmasi adalah standar untuk destructive action. Ketik "HAPUS" memastikan user tidak bisa "slip of the finger."

**Priority:** 🟢 P2 | **Points:** 1

---

### US-7.6 | Profil — Overview Kondisi Keuangan

**Sebagai** Aqil,
**saya ingin** satu tempat untuk melihat dan mengelola semua kondisi keuangan saya,
**agar** saya tidak perlu hunting di menu berbeda untuk ubah tagihan vs wallet vs goal.

**Acceptance Criteria:**

- [ ] Profil screen menampilkan: tier badge + sisa hari aktif
- [ ] Section: Profil Keuangan, Dompet & Mata Uang, Tagihan, Goal Tabungan, Lisensi
- [ ] Tiap section bisa di-tap untuk edit detail

**Priority:** 🟡 P1 | **Points:** 1

---

### US-7.7 | Edit Income Schedule

**Sebagai** Aqil yang tanggal gajiannya berubah,
**saya ingin** mengubah income schedule dari Profil,
**agar** semua kalkulasi budget langsung menggunakan tanggal yang baru.

**Acceptance Criteria:**

- [ ] Tap tipe income → edit form muncul
- [ ] Bisa ganti: tipe (tetap/freelance/mix) + detail sesuai tipe
- [ ] Weekend behavior muncul kontekstual (hanya saat tanggal gajian pertama kali jatuh di weekend setelah perubahan)
- [ ] Perubahan langsung mempengaruhi kalkulasi home

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.8 | Kelola Wallet dari Profil

**Sebagai** Aqil,
**saya ingin** tambah, rename, dan hapus wallet dari Profil,
**agar** saya bisa kelola dompet saya seiring berubahnya kebutuhan.

**Acceptance Criteria:**

- [ ] Section Dompet: list semua wallet + total saldo
- [ ] Tap wallet → Wallet Detail: rename inline, hapus (dengan konfirmasi), `"Sesuaikan saldo"`
- [ ] Tambah wallet baru: sampai limit tier (Basic: 4, Pro: 10)
- [ ] Hapus wallet yang punya transaksi: konfirmasi dengan warning "history transaksi ikut terhapus"

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.9 | Sesuaikan Saldo Wallet

**Sebagai** Aqil yang lupa catat beberapa pengeluaran dan saldo-nya jadi tidak sinkron,
**saya ingin** sesuaikan saldo wallet dengan percakapan yang mengarahkan saya,
**agar** saldo kembali akurat tanpa saya perlu manual cari pengeluaran yang hilang.

**Acceptance Criteria:**

- [ ] User input saldo aktual → app hitung selisih
- [ ] App tanya: `"Selisih ini dari mana?"` dengan 3 pilihan
- [ ] Pilihan 1 `"Lupa catat pengeluaran"` → buat transaksi `−Rp selisih` dengan tag `"koreksi"` dan timestamp `"antara catatan terakhir & sekarang"`
- [ ] Pilihan 2 `"Transfer ke wallet lain"` → user pilih wallet tujuan → buat 2 entry pasangan (tidak dihitung sebagai spend)
- [ ] Pilihan 3 `"Koreksi (saldo awal salah)"` → update angka saja, tidak ada transaksi, note bahwa akurasi prediksi bisa terpengaruh

**Notes:** Pilihan 1 membuat pengeluaran yang hilang tetap masuk sebagai expense di history — jujur secara data, tidak disembunyikan.

**Priority:** 🟡 P1 | **Points:** 3

---

### US-7.10 | Kelola Tagihan dari Profil

**Sebagai** Aqil,
**saya ingin** tambah, edit, dan hapus tagihan dari Profil,
**agar** daftar tagihan saya selalu akurat dan kalkulasi budget tidak berdasarkan data basi.

**Acceptance Criteria:**

- [ ] Section Tagihan: list semua tagihan + total
- [ ] Tambah tagihan: nama + nominal (tetap atau variabel) + frekuensi (7 pilihan) + due date
- [ ] Edit tagihan: semua field bisa diubah
- [ ] Hapus tagihan: konfirmasi (warning kalau ada pending occurrence)
- [ ] 7 frekuensi: sekali / mingguan / 2 mingguan / bulanan / 2 bulanan / 3 bulanan / tahunan

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.11 | Kelola Goal Tabungan dari Profil

**Sebagai** Aqil,
**saya ingin** tambah, edit target, dan hapus goal dari Profil,
**agar** goal saya mencerminkan prioritas hidup saya yang terus berubah.

**Acceptance Criteria:**

- [ ] Section Goal: list semua goal + total tabungan tersimpan
- [ ] Tambah goal: nama + target nominal
- [ ] Edit target: mengubah target langsung mempengaruhi waterfall (goal di bawah otomatis dihitung ulang)
- [ ] Hapus goal: konfirmasi + informasi "saldo tabungan dari goal ini kembali ke pool dan mengalir ke goal selanjutnya"
- [ ] Reorder urutan goal (drag-drop, sama dengan di home)
- [ ] Basic: max 4 goal. Goal ke-5 → Pro upsell

**Priority:** 🟡 P1 | **Points:** 2

---

### US-7.12 | Lihat Status Lisensi & Ganti Kode

**Sebagai** Aqil yang license-nya hampir habis,
**saya ingin** melihat status dan sisa hari lisensi saya, dan bisa perpanjang dari dalam app,
**agar** saya tidak tiba-tiba kehilangan akses tanpa tahu cara memperpanjang.

**Acceptance Criteria:**

- [ ] Section Lisensi: status aktif/expired + tanggal expired + tier
- [ ] `"Ganti kode lisensi"` → input field untuk aktivasi kode baru
- [ ] `"Perpanjang / Beli"` → link ke Clicky (IDR) dan Gumroad (USD), buka tab baru
- [ ] Expired tapi dengan data: akses data tetap ada, hanya kalkulasi dan fitur core yang di-lock (graceful degradation)

**Priority:** 🟡 P1 | **Points:** 1

---

### US-7.13 | Backup Guide & FAQ

**Sebagai** Aqil,
**saya ingin** panduan backup yang jelas dan FAQ yang menjawab pertanyaan umum,
**agar** saya bisa mandiri tanpa harus kontak support untuk hal-hal dasar.

**Acceptance Criteria:**

- [ ] `"Cara backup"` → Sheet guide 3-step: (1) backup rutin via export, (2) pindah HP, (3) kenapa manual
- [ ] `"FAQ"` → halaman teks dengan pertanyaan umum
- [ ] `"Kebijakan privasi"` → halaman teks
- [ ] `"Kontak"` → link ke @win32_icang (buka tab baru / DM)
- [ ] Footer Settings: `"SISA · v[versi] · created by chandra gumelar"`

**Priority:** 🟢 P2 | **Points:** 1

---

## Sprint 8 — PWA Hardening, Polish & Pro Features

> **Sprint Goal:** App siap dijual. Bisa diinstall sebagai PWA, jalan offline, Pro features hidup, dan lulus Lighthouse audit.
>
> **Definition of Done sprint ini berbeda:** bukan hanya "fitur berjalan" tapi "bisa diinstall di HP dan dipakai tanpa internet."

---

### US-8.1 | Install SISA sebagai PWA

**Sebagai** Aqil,
**saya ingin** bisa install SISA di HP saya seperti install app dari App Store,
**agar** SISA ada di home screen dan bisa dibuka langsung tanpa buka browser dulu.

**Acceptance Criteria:**

- [ ] Web App Manifest benar: nama `"SISA"`, icon maskable, `theme_color: #EEF1F5`, `display: standalone`
- [ ] Install prompt muncul setelah onboarding selesai (bukan saat pertama buka)
- [ ] App lulus semua item PWA checklist di Lighthouse
- [ ] Installed app tidak ada browser chrome (address bar, dll) — full standalone

**Priority:** 🔴 P0 | **Points:** 3

---

### US-8.2 | Fungsi Penuh Offline

**Sebagai** Aqil di area tanpa sinyal,
**saya ingin** SISA tetap berfungsi penuh tanpa koneksi internet,
**agar** saya bisa Cek Dulu di kasir meskipun sinyal tidak ada.

**Acceptance Criteria:**

- [ ] Service Worker menggunakan strategi cache-first untuk app shell
- [ ] Semua fitur berfungsi offline: Cek Dulu, Andai, Quick Log, home, history, settings
- [ ] Satu-satunya yang butuh internet: link ke Clicky/Gumroad (buka tab baru — already acceptable)
- [ ] Test: matikan jaringan → semua navigasi dan aksi tetap bisa digunakan

**Priority:** 🔴 P0 | **Points:** 3

---

### US-8.3 | Notifikasi Update Non-Intrusif

**Sebagai** Aqil,
**saya ingin** tahu kalau ada versi baru SISA tanpa app tiba-tiba reload sendiri saat saya sedang input,
**agar** saya tidak kehilangan data yang sedang diisi karena update.

**Acceptance Criteria:**

- [ ] Update tersedia → banner muncul: `"versi baru tersedia · muat ulang ›"`
- [ ] Banner tidak auto-dismiss, tidak blocking
- [ ] App **tidak** auto-reload saat user sedang di form atau input
- [ ] Tap `"muat ulang"` → app reload ke versi baru

**Priority:** 🟡 P1 | **Points:** 2

---

### US-8.4 | Prediksi Uang Sisa 3 Bulan (Pro)

**Sebagai** Dira (user Pro),
**saya ingin** melihat prediksi saldo saya untuk 3 bulan ke depan di home,
**agar** saya bisa plan ke depan, tidak hanya reaktif ke kondisi sekarang.

**Acceptance Criteria:**

- [ ] Card full-width di bawah 2-col — hanya muncul untuk Pro
- [ ] 3 kolom angka: bulan 1, bulan 2, bulan 3 — label bulan kecil uppercase + nominal JetBrains Mono
- [ ] Angka polos tanpa opini label ("aman", "ketat", "bahaya")
- [ ] Tap `"detail ›"` → Forecast Detail Sheet dengan asumsi prediksi + breakdown per bulan
- [ ] Basic user tidak melihat card ini sama sekali (bukan greyed-out)

**Priority:** 🟡 P1 | **Points:** 3

---

### US-8.5 | Simpan Skenario Andai (Pro)

**Sebagai** Dira,
**saya ingin** menyimpan skenario Andai dengan nama dan mengaksesnya kembali nanti,
**agar** saya bisa kembali ke skenario yang sudah saya pikirkan sebelumnya tanpa harus input ulang.

**Acceptance Criteria:**

- [ ] Tap `"Simpan skenario"` (Pro) → sheet penamaan dengan saran otomatis dari isi skenario
- [ ] Snapshot isi skenario ditampilkan untuk konfirmasi
- [ ] Tap Simpan → skenario masuk ke Rak Skenario
- [ ] Rak: maks 10 skenario. Skenario ke-11 → user harus hapus yang lama dulu
- [ ] Tap baris di rak → buka ulang di Andai Canvas dengan variabel terisi (bisa diedit)
- [ ] Swipe kiri di rak → hapus skenario

**Priority:** 🟡 P1 | **Points:** 3

---

### US-8.6 | Bandingkan 2 Skenario Berdampingan (Pro)

**Sebagai** Dira yang menimbang dua pilihan,
**saya ingin** melihat dua skenario berdampingan dalam satu layar,
**agar** saya bisa langsung bandingkan trade-off tanpa mental switching antara dua layar.

**Acceptance Criteria:**

- [ ] Mode banding: centang maksimal 2 skenario dari rak → tampil 2 kolom berdampingan
- [ ] Tiap kolom: nama skenario + ringkasan variabel + 3 metrik (jatah harian / sisa gajian / tabungan) before-after
- [ ] Mau ganti skenario ke-3: unchecklist salah satu, checklist yang baru
- [ ] Baseline `"sekarang tanpa diandai"` selalu tersedia sebagai pilihan banding
- [ ] 2 kolom maksimal — 380px tidak muat 3 kolom yang masih kebaca

**Priority:** 🟡 P1 | **Points:** 2

---

### US-8.7 | Forecast 3-Bulan di Andai Canvas (Pro)

**Sebagai** Dira,
**saya ingin** melihat dampak skenario saya ke 3 bulan ke depan langsung dari Andai Canvas,
**agar** saya tidak hanya tahu dampak ke gajian berikutnya, tapi juga jangka menengah.

**Acceptance Criteria:**

- [ ] Blok di bawah hasil (Pro only): 3 kolom per bulan, angka polos
- [ ] Basic user tidak melihat blok ini
- [ ] Angka di blok ini mengikuti variabel skenario yang aktif (bukan baseline)

**Priority:** 🟢 P2 | **Points:** 2

---

### US-8.8 | Multi-Currency Strict Isolation (Pro)

**Sebagai** Dira,
**saya ingin** bisa switch antara konteks IDR dan USD dengan satu tap,
**agar** dua currency saya benar-benar terpisah dan tidak pernah tercampur.

**Acceptance Criteria:**

- [ ] Segmented control `[IDR][USD]` muncul di header — hanya untuk Pro dengan 2 currency aktif
- [ ] Tap segmen → seluruh app ganti context: wallet, tagihan, goal, kalkulasi — semua ikut ganti
- [ ] Wallet IDR tidak muncul di mode USD, dan sebaliknya
- [ ] Tagihan yang dibuat di mode IDR hanya muncul di mode IDR
- [ ] Tidak ada cross-currency summing atau konversi otomatis
- [ ] Basic user tidak melihat segmented control ini

**Priority:** 🟡 P1 | **Points:** 3

---

### US-8.9 | Header "SISA · Pro" untuk User Pro

**Sebagai** Dira,
**saya ingin** melihat identifikasi Pro di header,
**agar** ada konfirmasi visual bahwa fitur Pro saya aktif.

**Acceptance Criteria:**

- [ ] Header Pro: `"SISA · Pro"` — dot separator, `"Pro"` lowercase 10px weight-500 `--ink-secondary`
- [ ] Header Basic: `"SISA"` saja — tanpa mention tier
- [ ] Perubahan header otomatis saat tier berubah

**Priority:** 🟢 P2 | **Points:** 1

---

### US-8.10 | Haptic Feedback di Aksi Penting

**Sebagai** Aqil yang pakai HP,
**saya ingin** ada feedback haptic saat melakukan aksi penting,
**agar** saya tahu aksi berhasil meskipun tidak melihat layar.

**Acceptance Criteria:**

- [ ] Mark paid konfirmasi → haptic medium
- [ ] Swipe reveal panel → haptic light
- [ ] Quick Log Catat → haptic light
- [ ] Implementasi via Vibration API dengan feature-detect — tidak crash di browser tanpa support
- [ ] Haptic tidak muncul untuk aksi scroll atau hover

**Priority:** 🟢 P2 | **Points:** 1

---

### US-8.11 | Backup Reminder Eskalasi

**Sebagai** Aqil yang jarang backup,
**saya ingin** diingatkan untuk backup secara bertahap tanpa dibombardir setiap minggu,
**agar** saya backup sebelum terlambat, tapi tidak merasa di-nag.

**Acceptance Criteria:**

- [ ] Hari 30 sejak export terakhir → card dismissible muncul di home
- [ ] Dismiss → card muncul lagi di hari 45, lalu 60
- [ ] Setelah hari 60: interval makin pendek (70, 80, 90...)
- [ ] Card tidak pernah blocking — selalu dismissible
- [ ] Timestamp "export terakhir" update setiap kali user export

**Priority:** 🟢 P2 | **Points:** 2

---

### US-8.12 | Lighthouse Score Layak Launch

**Sebagai** developer,
**saya ingin** SISA lulus Lighthouse audit dengan score yang layak,
**agar** app tidak punya masalah performa atau accessibility yang terdeteksi dari hari pertama.

**Acceptance Criteria:**

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90
- [ ] PWA checklist: semua item hijau
- [ ] Test dilakukan di production build, bukan dev server

**Priority:** 🟡 P1 | **Points:** 2

---

## Appendix — Keputusan yang Perlu Owner

Beberapa pertanyaan terbuka dari PRD yang tidak bisa dijawab oleh PM atau developer sendiri:

| #   | Pertanyaan                                                                                             | Dampak |
| --- | ------------------------------------------------------------------------------------------------------ | ------ |
| A1  | Bar budget harian saat terpakai > daily budget — indikator apa? Bar penuh + warna merah?               | US-4.3 |
| A2  | Cek Dulu subtitle `"aman ga gue beli ini?"` — hilang setelah berapa kali pakai? N=1 atau N=3?          | US-6.1 |
| A3  | Andai Basic: autosave draft lokal supaya tidak hilang kalau tutup tidak sengaja?                       | US-6.6 |
| A4  | Urutan chip variabel Andai: `+ beli → + income → + tagihan → + target nabung` — sudah paling intuitif? | US-6.6 |

---

_Dokumen ini adalah living document. Update setiap kali ada keputusan baru, story baru, atau story yang di-drop._
_Total: 77 user stories · 8 sprint · ~24–32 hari kerja estimasi_
