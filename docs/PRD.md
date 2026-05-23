# SISA — Product Requirements Document

> **Decision Support App untuk Pengeluaran & Tabungan**
>
> Sebuah PWA yang jawab "aman atau ga kalau gue beli ini sekarang?" dalam hitungan detik.

---

## 📌 Quick Info

| Field             | Detail                                  |
| ----------------- | --------------------------------------- |
| **Product Name**  | SISA                                    |
| **Product Type**  | Progressive Web App (PWA)               |
| **Target Market** | Indonesia (primary), Global (secondary) |
| **Distribution**  | Clicky.id (IDR) + Gumroad (USD)         |
| **Pricing Model** | One-time license key, 3 bulan           |
| **Tiers**         | Basic & Pro                             |
| **Tech Stack**    | PWA (no native app)                     |
| **Status**        | PRD — Pre-development                   |

---

## 🎯 1. Vision & Paradigm

### 1.1 Vision Statement

> User butuh tau apakah keputusan finansial yang mereka mau ambil sekarang aman atau tidak. App ini menjawab pertanyaan itu dalam hitungan detik, tanpa user perlu jadi disiplin atau power user.

### 1.2 Core Paradigm Shift

App ini **bukan expense tracker**. Ini **decision support tool** yang kebetulan butuh tracking sebagai foundation.

| Aspek | Tracker Tradisional | App Ini |
|-------|---------------------|---------||
| Pertanyaan utama | "Gue habis berapa?" | "Gue bisa beli ini nggak?" |
| Aksi utama | Catat transaksi | Konsultasi sebelum beli |
| Home screen | List transaksi | Tombol decision |
| Frekuensi pakai | Setelah transaksi | Sebelum transaksi |
| Tracking | Tujuan | Foundation |
| Tense | Past | Future |

### 1.3 Pertanyaan-Pertanyaan Inti yang Dijawab App

**Pertanyaan utama (Flagship):**

> "Kalau gue keluarin duit segini sekarang, apakah keuangan gue masih aman sampai income berikutnya?"

**Pertanyaan pendukung:**

- "Berapa sisa duit gue sebelum gajian/income berikutnya?"
- "Berapa rata-rata duit yang bisa gue pakai per hari sampai income berikutnya?"
- "Kalau bulan ini gue keluarin pengeluaran besar yang ga rutin (misal service mobil 5jt), keuangan gue jadi gimana?"

Semua pertanyaan ini berorientasi **masa depan**, bukan masa lalu. Itu pembeda fundamental dari tracker.

### 1.4 4 Pilar Produk

> 📌 Pilar di section ini adalah **sikap produk** (paradigma, prinsip, posisi). Eksekusi visualnya ada di 1.5.

**1️⃣ Decision-First, Not Tracking-First** ⭐ _(Flagship)_

- Pre-spending consultation (Cek Dulu)
- Future scenario planning (Andai) — main-mainin skenario hipotetis di bulan ini
- Forecast forward, bukan report backward
- Tracking = foundation, bukan tujuan
- Setiap fitur harus lolos test: _"Does this help user decide BEFORE spend?"_

**2️⃣ Opinionated & Honest**

- App punya pendapat dan ga sungkan nyampein
- Copy punya suara — boleh blunt, anti-fake-friendliness
- Hard numbers, no sugarcoating
- Honest "minus" kalau minus, ga di-softening jadi "tipis"
- No fake gamification (no streak, no confetti, no "great job!")

**3️⃣ Low-Friction, Not Low-Feature**

- User-initiated, bukan app-initiated (PWA reality = no push notif)
- Quick log dalam 5 detik
- Cek Dulu dalam 5 detik
- Minimum tap, maximum information per screen
- Fitur bisa banyak, tapi setiap interaksi cepat

**4️⃣ Local-First, Trust-First**

- Data di device, bukan cloud
- No signup, no email harvesting
- Export user-controlled
- Reconciliation self-healing (kalau data nyimpang, app bantu user benerin tanpa drama)

### 1.5 Visual Direction

App ini **bukan finance-app-genre**. Bukan minimalis pastel, bukan calm-mindful-aesthetic, bukan Monzo/N26/Jenius lineage. Audience Clicky/Gumroad apresiasi tool yang kelihatan **dipikirin sama operator, bukan didekorasi sama design team**.

Referensi genre yang tepat: **dashboard operator modern** — Linear, Vercel, Resend, Pirsch, Plain, Cal.com, OpenStatus. Bukan Mint, bukan YNAB, bukan Copilot Money, bukan app fintech apapun.

**Anti-references (eksplisit, biar tools AI ga kabur ke sana):**

- Skeuomorfik, gradient tombol, glassmorphism, neumorphism
- Soft pastel finance app (mint green, baby blue, lavender)
- Ilustrasi karakter cartoon (Storyset, unDraw, Blush style)
- Rounded-corner-besar + drop-shadow-tebel + emoji-everywhere (era 2018-2022 fintech)
- "Friendly chubby sans-serif" (Poppins, Nunito, DM Sans default; Inter polos di semua tempat)
- High-saturation single accent ala Stripe purple / Cash App green sebagai brand color

**Karakteristik visual yang dimaui:**

- **Information-dense, operator grid.** Home screen tunjukkan 6-8 data point sekaligus (saldo, daily budget, sisa minggu, sisa bulan, next bill, goal progress, prediksi akhir bulan, tagihan belum dibayar). Hierarchy lewat typography & spacing, bukan lewat card-card terpisah dengan gap besar.
- **Typography sebagai sistem, bukan dekorasi.** Sans-only — **Inter Tight** untuk semua teks (label, body, angka hero), **JetBrains Mono** untuk angka tabular (wallet amount, tagihan amount). Hierarchy lewat size + weight + tracking, bukan lewat font family contrast. Variable font wajib. Bukan Poppins/Nunito/DM Sans/Inter polos.
- **Numbers are the hero.** Angka gede, tabular-nums, font-feature-settings "tnum" "lnum". App ini soal angka — angka harus dominan visual, bukan ikut antri sama label dan icon.
- **Warna = signal + 1 accent, bukan brand dominan.** Background tinted light (cool slate `#EEF1F5`), card putih bersih + border tipis. 1 accent color cobalt (`#1F4FE0`) untuk interactive/brand (Cek Dulu, link, bar budget) + 3 signal color (aman/ketat/bahaya). Accent harus occupy hue yang tidak dipakai signal — cobalt (biru) aman dari merah/amber/hijau. Signal color tinggi-kontras dan saturated — bukan pastel — karena fungsinya alarm, bukan estetika.
- **Density terstruktur, bukan rame.** Padat tapi grid jelas, divider tipis (`1px`), whitespace di tempat yang strategis (di antara grup data, bukan di sekeliling tiap elemen).
- **Icon minim & geometric.** Kalau ada, pakai stroke 1.5px, ukuran kecil, warna inherit dari text. Bukan icon ilustratif berwarna. Lucide-style atau Phosphor-thin, bukan Material Rounded. **Settings icon = 3 garis horizontal dengan dot asimetris di tiap garis** (bukan hamburger biasa — dot asimetris ini distinguish settings/controls dari navigation).
- **No fake friendliness.** Ga ada emoji confetti, ga ada "Great job! 🎉", ga ada ilustrasi karakter, ga ada greeting card di home.
- **Motion = fungsional.** Transisi cepat (150-200ms), kasih feedback aksi (angka berubah, status berubah). Bukan animasi welcome, bukan parallax, bukan micro-interaction yang lucu doang.
- **Haptic feedback sebagai primary feedback channel mobile.** Mark paid → haptic medium · swipe action → haptic light · Cek Dulu result "bahaya" → haptic warning. PWA modern support Vibration API.

**Palet committed (Light mode — v1):**

| Token                  | Hex       | Kegunaan                                        |
| ---------------------- | --------- | ----------------------------------------------- |
| `color.canvas`         | `#EEF1F5` | Background utama (cool slate tint, bukan putih) |
| `color.surface`        | `#FFFFFF` | Card, wallet list (putih ngangkat dari canvas)  |
| `color.surface.2`      | `#E4E8EE` | Bar track, inner surface                        |
| `color.ink.primary`    | `#11141A` | Teks utama, angka hero                          |
| `color.ink.secondary`  | `#565C66` | Label, sub-text                                 |
| `color.ink.tertiary`   | `#939AA5` | Meta, timestamp                                 |
| `color.border.hair`    | `#E1E5EB` | Divider tipis, card border                      |
| `color.accent`         | `#1F4FE0` | Interactive/brand (Cek Dulu, link, budget bar)  |
| `color.accent.bg`      | `#EDF1FE` | Accent background tipis                         |
| `color.signal.danger`  | `#D11F1F` | Bahaya, lewat tempo                             |
| `color.signal.caution` | `#B5680A` | Ketat, perlu perhatian                          |
| `color.signal.safe`    | `#1B7A38` | Aman, income                                    |

> 📌 **Semantic naming wajib** — jangan hardcode hex langsung di komponen. Tujuan: dark mode v2 tinggal swap palette, komponen ga perlu disentuh.

> 📌 **Dark mode:** tersedia sebagai opsi di Settings (Light / Dark / System), dengan Light sebagai default. Dark mode dijadwalkan v2 tapi token sudah harus semantic dari v1.

**Brief satu kalimat buat tools vibe coding:**

> _"Bloomberg Terminal kalau dibikin sama tim Linear di 2026, buat personal finance — bukan banking app, bukan budget app, bukan dashboard fintech."_

> ⚠️ **Catatan implementasi:** AI vibe-coding tools cenderung balik ke mean training data (= 2014-2020 fintech aesthetic) kalau ga ditahan. Anti-reference list di atas **wajib** dimasukin ke setiap brief.

---

## 👥 2. Target User

### 2.1 Primary Pain Points

App ini dibangun untuk jawab 3 pain berikut, yang saling menguatkan:

> 💭 **P1 — Decision anxiety**
> "Gue ragu tiap mau spend. Bukan karena ga punya duit, tapi karena ga yakin apakah spend ini bakal bikin gue susah minggu depan."

> 💭 **P2 — Effort barrier**
> "Gue tau harusnya budgeting, tapi gue ga mau jadi orang yang catat tiap transaksi rapi atau analisa kategori. Gue cuma mau jawaban: aman atau ga?"

> 💭 **P3 — Speed barrier**
> "Gue di kasir, di Shopee, di restoran. Gue ga punya 5 menit untuk buka spreadsheet atau hitung sisa budget. Gue butuh jawaban dalam 5 detik."

**Bagaimana 3 pain ini menyangkut vision:**

- P1 = _kenapa_ user butuh app ini (uncertainty di momen decide)
- P2 = _kenapa_ tracker tradisional gagal untuk mereka (effort terlalu tinggi)
- P3 = _kapan_ app harus deliver value (real-time, di momen decide)

### 2.2 Target Archetype

App ini fokus ke **satu archetype**: user yang mau **jawaban cepat**, bukan analisis detail.

| Archetype                         | Motivasi                                              | Apakah Target?                                                  |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| **B — "Gue mau jawaban cepat"**   | Anti-effort, mau outsource pemikiran finansial ke app | ✅ **Primary target**                                           |
| **A — "Gue mau ngerti duit gue"** | Enjoy analysis, kategorisasi, power user spreadsheet  | ❌ Bukan target — biarkan mereka pakai YNAB/Monarch/spreadsheet |
| **C — "Gue ga peduli"**           | Tidak punya motivasi finansial                        | ❌ Bukan target siapapun                                        |

**Sub-segmen di dalam Archetype B:**

| Sub-segmen      | Karakteristik                                                                           | Trigger Buka App                   | Status di V1                                                     |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| **B-anxious**   | Ragu spend karena takut salah. Cenderung buka app _sendiri_ sebelum decide.             | Internal (mereka udah niat)        | ✅ **Core target** — pull-driven habit cocok                     |
| **B-impulsive** | Spend dulu mikir belakangan. Butuh app sebagai _circuit breaker_ sebelum klik checkout. | External (harus di-prompt sesuatu) | ⚠️ Secondary — PWA tanpa push notif sulit jangkau di momen tepat |

> 📌 V1 fokus ke B-anxious karena paradigm pull-driven nyambung. B-impulsive butuh mekanika trigger yang ga ada di PWA (push notif, share intent, browser extension). Worth dipikirin di V2, tapi jangan jadi alasan kompromiin paradigma sekarang.

**Penegasan:** app ini **tidak berkompetisi dengan expense tracker**. App ini berkompetisi dengan:

1. **Status quo "ga pakai app sama sekali"** — orang yang udah uninstall tracker karena anti-tracking dan jalan tanpa apa-apa
2. **Spreadsheet jarang dibuka** — niat budget tapi friction tinggi
3. **Fitur built-in mobile banking** (Indonesia: BCA mobile, Jenius "in & out", Livin' by Mandiri, GoPay analytics) — banyak Archetype B udah pakai ini sebagai "tracker pasif"

Pembeda app ini dari kompetitor #3 (paling underestimated): **forecast forward, lintas-wallet, dan decision-time**. Mutasi BCA cuma tunjukin past, satu wallet, dan ga jawab "boleh ga gue beli ini sekarang."

### 2.3 Personas (Dari Research Reddit)

| Persona                    | Karakteristik                         | Strategi App                                                      |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| **Privacy-Conscious User** | Nggak mau bank sync, data takut bocor | Core target — local-first positioning                             |
| **Overwhelmed Beginner**   | Udah 3x install-uninstall tracker     | Onboarding 2 menit, no signup                                     |
| **Family/Couple Tracker**  | Butuh sync sama pasangan              | Pair Mode (Pro — post-launch)                                     |
| **Spreadsheet Loyalist**   | Power user Excel — archetype A        | ❌ Bukan target. Mereka butuh analysis, app ini ga kasih analysis |
| **Auto-Pilot User**        | Mau full automation                   | ❌ Bukan target — biar pakai Monarch/Rocket                       |

### 2.4 Bonus Outcomes (Bukan Driver, Untuk Marketing Copy)

| Bonus Outcome                                        | Lahir Dari Fitur                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| "Lo punya catatan jujur tanpa harus jadi orang rapi" | Tracking sebagai foundation (riwayat sederhana, no kategorisasi) |
| "Lo ga gampang kehabisan duit sebelum gajian"        | Daily budget rolling + Cek Dulu                                  |
| "Goal nabung lo lebih nyambung sama daily spending"  | Goal mode Konsultan + reframe tabungan sebagai konteks decision  |
| "Lo & pasangan ga cemas mikirin duit bareng"         | Pair Mode (Pro — post-launch)                                    |

> 📌 **Prinsip:** kalau ada konflik trade-off antara driver pain (P1/P2/P3) dan bonus outcome, **selalu pilih yang support driver pain**. Bonus outcome ga boleh jadi alasan kompromiin paradigma decision support.

> ⚠️ **Anti-pattern untuk marketing copy:** hindari janji yang implisit menjanjikan analysis ("tau ke mana duit lo pergi", "kategori spending lo", "report bulanan"). Itu attract Archetype A yang bukan target, dan promise-delivery mismatch karena app sengaja ga bangun pie chart / trend / kategorisasi multi-level.

### 2.5 Retrospective Data — Reframed, Bukan Tracker-Style

App ini **menyediakan beberapa data retrospektif**, tapi dengan cara delivery yang **bukan expense tracker**. Setiap data retro harus lolos filter: _"Does this drive future decision?"_

**Yang masuk (reframed retro):**

| Tracker Tradisional Bilang                | App Ini Bilang                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Bulan ini lo habis 3jt di makanan"       | "Makanan ngambil 40% spending lo. Kalau mau daily budget naik Rp 20rb, di sini kemungkinan bisa potong"      |
| "Pengeluaran lo naik 15% dari bulan lalu" | "Pola spending lo lagi naik. Cek Dulu sekarang akan lebih konservatif karena ini"                            |
| (Tidak ada)                               | "Bulan lalu Cek Dulu prediksi sisa akhir bulan Rp 800rb. Aktualnya Rp 650rb. Akurasi: 81%"                   |
| (Tidak ada)                               | "Lo punya 7 tagihan rutin. Total Rp 2.3jt/bulan. Yang terakhir naik: Spotify (Sept), Netflix (Aug). Review?" |

**Yang TIDAK masuk (tracker-style murni):**

- Pie chart kategori
- Trend line spending over time
- Monthly/yearly summary report
- Cash flow statement
- Comparison year-over-year
- Kategorisasi multi-level

---

## 🖼️ 3. Home Canvas — Spec & Wireframe

### 3.1 Wireframe Files

**Home & States**

| File                              | Keterangan                                                                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home_basic_wireframe_hifi.html`  | Hi-fi Basic tier, light mode, full color                                                                                                                                                     |
| `home_basic_wireframe_lofi.html`  | Lo-fi Basic tier, grayscale skeleton · **Revision pending:** (1) "komitmen" → "tagihan", (2) card Insight Bulan Ini di-drop                                                                  |
| `home_pro_wireframe_lofi.html`    | Lo-fi Pro tier, grayscale skeleton + Pro feature markers · **Revision pending:** (1) "komitmen" → "tagihan", (2) card Insight Bulan Ini di-drop, (3) card "Lihat Refleksi Bulan Ini" di-drop |
| `state_notif_tapped_lofi.html`    | State: notif card lewat tempo ditap → bottom sheet                                                                                                                                           |
| `state_forecast_detail_lofi.html` | State: forecast Pro ditap → detail sheet                                                                                                                                                     |
| `state_tagihan_swiped_lofi.html`  | State: tagihan swipe kiri → 3 stage (reveal, modal, toast)                                                                                                                                   |
| `state_tandai_dibayar_lofi.html`  | State: "tandai sudah dibayar" ditap → push sheet (2 case: KPR variabel + Spotify fix)                                                                                                        |

**Feature Canvases**

| File                                  | Keterangan                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `cekdulu_canvas_wireframe_lofi.html`  | Lo-fi Cek Dulu Canvas: state aktif nominal Rp 5jt, 3 baris adaptif kena dampak        |
| `andai_canvas_wireframe_lofi.html`    | Lo-fi Andai Canvas: state aktif 2 andai ditumpuk, hasil horizon panjang               |
| `simpan_skenario_wireframe_lofi.html` | Lo-fi Simpan Skenario (Pro): State A kasih nama · State B rak skenario + mode banding |
| `quick_log_wireframes_lofi.html`      | Lo-fi Quick Log Sheet: 3 state — mode keluar (default), mode masuk, mode nabung       |
| `history_wireframe_lofi.html`         | Lo-fi History Sheet: log transaksi, filter, search                                    |

**Settings & Profil**

| File                               | Keterangan                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings_wireframe_lofi.html`     | Lo-fi Settings: tema, bahasa, data & backup (export/import/auto-export), tentang + FAQ + kontak · **Revision pending:** footer "SISA · v0.1.0" → "SISA · v0.1.0 · created by chandra gumelar" |
| `profil_wireframe_lofi.html`       | Lo-fi Profil: hub kondisi keuangan user — profil keuangan (income, tanggal gajian, weekend behavior), dompet & mata uang, tagihan, goal tabungan, lisensi                                     |
| `backup_guide_wireframe_lofi.html` | Lo-fi Backup Guide: 3 state — (A) info card di home post-onboarding, (B) sheet guide "cara backup" 3-step, (C) reminder eskalasi (hari 30/45/60+)                                             |

**Onboarding**

| File                             | Keterangan                                                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding_wireframe_lofi.html` | Lo-fi Onboarding Flow: Step 1 bahasa · Step 2 license key · Step 3 mental model · Step 4a–4e income + wallet + currency · Step 5 home · **Revision pending:** Step 3 hapus "Catat seinget lo — " dari copy mental model |

### 3.2 Paradigma Struktural

Home Canvas bukan dashboard tradisional dengan multi-tab navigation. Ini **single-canvas modern 2026** dengan filosofi:

- **No bottom tab bar permanent.** Akses ke feature lain lewat bottom action button (Cek Dulu / Catat / Andai), bottom sheet, atau inline expand.
- **Information density tinggi** dengan hierarchy lewat typography + spacing, bukan card-isolation.
- **Numbers are the hero.** Setiap modul punya 1 angka dominan, label dan meta lebih kecil.
- **Setiap modul punya entry point ke sheet detail** (chevron ›, "lihat semua ›", atau tappable card).

**Navigation pattern modern 2026:**

- **Tap saldo/wallet** → inline expand atau push sheet
- **Tap tagihan detail** → push sheet (bukan modal)
- **Swipe kiri tagihan** → reveal panel → "tandai dibayar" → push sheet konfirmasi
- **Tap notif card** → bottom sheet urgency list
- **Tap forecast Pro** → bottom sheet detail breakdown
- Tidak ada modal dengan overlay gelap + close X di tengah screen — itu pattern 2015

### 3.3 Urutan Modul (top-to-bottom)

| #   | Modul                                                                    | Tujuan                                                | Tappable Target                                                   |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------- |
| 0   | **Header bar**                                                           | Identitas + akses setting                             | Setting icon → Settings Sheet                                     |
| 0a  | **Segmented currency switcher** (Pro only)                               | Switch IDR/USD context                                | Tap segmen → swap currency mode                                   |
| 1   | **Notification card** (kondisional)                                      | Alert tagihan lewat tempo / Pro: phantom subscription | Tap → bottom sheet detail                                         |
| 2   | **Saldo total + Wallet list**                                            | Visibilitas multi-wallet                              | Tap saldo → expand inline / Wallet Sheet                          |
| 3   | **Budget hari ini** (hero, dengan progress bar tebal)                    | Decision foundation                                   | Tap → formula explanation popup                                   |
| 4   | **Budget minggu ini** + **Sisa pas gajian** (2-col)                      | Forecast horizon menengah                             | Tap → detail                                                      |
| 4a  | **Prediksi uang sisa akhir bulan** (Pro only, full-width di bawah 2-col) | Forecast 3-bulan rolling                              | Tap "detail ›" → forecast detail sheet                            |
| 5   | **Tagihan bulan ini** (list full-width, maks 4 + expand)                 | Foundation untuk forecast                             | Tap baris → Tagihan detail Sheet; Swipe kiri → tandai dibayar     |
| 6   | **Goal tabungan** (list sejajar, drag-drop)                              | Konteks decision, bukan tujuan terisolasi             | Tap → Goal detail Sheet; Drag → reorder (hitung ulang dari total) |
| 7   | ~~**Insight bulan ini**~~ _[dropped v1]_                                 | ~~Reframed retro yang drive future decision~~         | —                                                                 |
| 7a  | ~~**Refleksi link**~~ _[dropped v1]_                                     | ~~Entry point ke 6 insight Pro di Refleksi sheet~~    | —                                                                 |
| 8   | **Footer catatan** (1-line)                                              | Trust signal bahwa data masih fresh                   | "semua catatan ›" → History Sheet                                 |
| 9   | **Bottom action area** (3 button: Catat / Cek Dulu / Andai)              | Primary actions                                       | Cek Dulu (cobalt, dominan), Catat & Andai (surface, sekunder)     |

### 3.4 Spec Modul Detail

#### 3.4.1 Header Bar

**Basic:** Brand wordmark "SISA" (11px, 700, letter-spacing 1.5px) + settings icon kanan.

**Pro:** Brand wordmark "SISA · Pro" (dot separator + "Pro" lowercase 10px 500, ink-secondary). Di bawah wordmark: segmented currency control `[ IDR ][ USD ]` — kiri-aligned, subordinate dari brand.

**Settings icon:** 3 garis horizontal dengan **dot asimetris di tiap garis** (berbeda posisi per garis). Pattern ini distinguish "controls/settings" dari hamburger nav biasa. Warna ink-secondary. Tidak ada border circle.

#### 3.4.2 Segmented Currency Switcher (Pro only)

Muncul di bawah header wordmark, hanya untuk user Pro dengan 2 currency aktif.

**Pattern:** Segmented pill `[ IDR ][ USD ]` — active state white surface, inactive ghost di surface-2. JetBrains Mono, 10.5px, letter-spacing 0.3px.

**Behavior:** Tap segmen = swap seluruh app ke currency context itu. **Strict isolation** — IDR dan USD diperlakukan sebagai dua app paralel dalam satu shell:

- Wallet IDR hanya muncul di mode IDR
- Wallet USD hanya muncul di mode USD
- Tagihan IDR hanya muncul di mode IDR (dibuat di mode IDR, dibayar dari wallet IDR)
- Goal IDR hanya muncul di mode IDR
- Tidak ada cross-currency mixing, tidak ada konversi otomatis

User Basic single-currency tidak melihat segmented control sama sekali — row ini collapse.

#### 3.4.3 Sisa Bulan Ini + Wallet List

- **Sisa bulan ini** = angka 38px, hero ranking #1. `sisa = saldo − tagihan belum dibayar − total tabungan`. Ini adalah uang yang benar-benar bebas dipakai untuk operasional.
- **Subtitle**: "Rp [X] terpakai kemarin" atau "Rp [X] masuk kemarin"
- **Wallet list** = card surface dengan border-hair. 1 baris per wallet, label kiri + nominal kanan (JetBrains Mono, tnum). Auto-expanded.
- **Summary breakdown** (di bawah wallet list, hanya muncul kalau ada tagihan/tabungan): baris "tagihan" (−), baris "tabungan" (−), baris "sisa" (bold) — menunjukkan dari mana angka hero berasal.
- **Basic: max 4 wallet. Pro: max 10 wallet.**

**Sesuaikan Saldo (edit saldo wallet):**
Akses dari: Wallet Sheet → tap individual wallet → button "Sesuaikan". Flow ini cover 3 use case dalam satu entry point:

| User pilih                   | Behavior                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| "Lupa catat pengeluaran"     | Buat transaksi `−Rp selisih · catatan: 'koreksi'` dengan range waktu "antara catatan terakhir & sekarang" |
| "Transfer ke wallet lain"    | Buat 2 entry: wallet A −X, wallet B +X. Di-tag sebagai pasangan transfer (tidak dihitung sebagai spend)   |
| "Koreksi (saldo awal salah)" | Update angka saja, no transaction. User paham akurasi prediksi bisa terpengaruh                           |

Conversational UI (bukan form): user input saldo aktual → app hitung selisih → tanya "selisih ini dari mana?" → branching sesuai pilihan.

#### 3.4.4 Budget Hari Ini (Hero Module)

- Label: "budget hari ini" + icon ⓘ kecil (tap → formula popup)
- Angka 30px
- **Bar tebal 22px** — fill cobalt accent untuk terpakai, track surface-2 untuk sisa
- Footer 2 baris: kiri "Rp Xrb terpakai", kanan "**Rp Y** sisa hari ini"
- Meta header kanan: "N hari sampai gajian (tgl X)" — eksplisit tanggal gajian

**Formula popup (saat tap ⓘ):**

> `budget hari ini = (saldo - tagihan tersisa - target tabungan) ÷ hari sampai gajian`

**Income Schedule (basis perhitungan):**
User setup income schedule saat onboarding (editable di Settings → Income Schedule):

| Tipe          | Setup                                                                                | Behavior Formula                                                                      |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Tetap**     | Tanggal gajian + weekend behavior (maju Jumat / mundur Senin / tetap / ga konsisten) | Hitung hari ke tanggal gajian berikutnya. Kalau "ga konsisten": tampilkan "± 2 hari"  |
| **Freelance** | Target saldo minimum akhir bulan                                                     | `budget harian = (saldo - tagihan tersisa - target minimum) ÷ sisa hari di bulan ini` |
| **Mix**       | Tanggal gajian tetap + buffer freelance                                              | Kombinasi. User catat income freelance via Quick Log toggle "masuk"                   |

#### 3.4.5 Budget Minggu Ini + Sisa Pas Gajian (2-col)

| Modul                 | Definisi                                          |
| --------------------- | ------------------------------------------------- |
| **Budget minggu ini** | Total budget yang bisa dipakai sampai hari Minggu |
| **Sisa pas gajian**   | Prediksi saldo di tanggal terakhir sebelum gajian |

Status di Sisa Pas Gajian: `aman` / `ketat` / `bahaya`. Inline text color (signal color), bukan badge. Akurasi prediksi inline: `"akurasi prediksi: 81% ›"`.

#### 3.4.6 Prediksi Uang Sisa Akhir Bulan (Pro only, full-width)

Card full-width di bawah 2-col. **Hanya tampil di Pro.**

- Label: "prediksi uang sisa akhir bulan"
- 3 angka per bulan (format: label bulan kecil uppercase + nominal mono). Polos, tanpa opini status "aman/ketat".
- Footer: "detail ›" → Forecast Detail Sheet
- Forecast Detail Sheet berisi: hero trend bar chart, asumsi prediksi (income/tagihan/spending/nabung), breakdown per bulan, akurasi historis

#### 3.4.7 Tagihan Bulan Ini

**Konsep:** Payung untuk semua pengeluaran yang punya due date + nominal commitment. Dua sub-tipe:

- **Rutin** — recurring (Spotify, KPR, Listrik)
- **Sekali** — one-off berdue date (hutang ke teman, cicilan non-recurring)

Tidak ada tag "rutin/sekali" di UI — redundant.

**Ranking urgency (top 4 yang ditampilkan):**

1. Lewat jatuh tempo & belum dibayar
2. Jatuh tempo hari ini & belum dibayar
3. Jatuh tempo dalam 7 hari (urut dari paling dekat)
4. Sisanya → behind expand link

**Notification card (kondisional):** muncul di atas modul Saldo Total hanya kalau ada tagihan lewat tempo atau due hari ini. Background `color.signal.danger-bg`, border-left `color.signal.danger`. Tap → bottom sheet detail urgency.

**Pro notification card:** Phantom Subscription alert — subscription yang sudah >30 hari tidak dibayar atau dipakai. Background `color.signal.caution-bg`, border-left `color.signal.caution`.

**Tipe nominal:**

- **Tetap** — nominal sama setiap bulan, prefill default
- **Variabel** — nominal berubah-ubah, simbol **±** di depan (mis. "± Rp 3.2jt")

**Flow swipe kiri → tandai dibayar (Push Sheet):**

Swipe kiri di baris tagihan → reveal panel → tap "tandai dibayar" → **push sheet penuh** (bukan modal bottom).

Push sheet berisi:

1. **Preview item** (nama, tipe tetap/variabel, estimasi nominal)
2. **Info note dashed**: "konfirmasi akan otomatis kurangi saldo wallet dan kebuat di log catatan"
3. **Nominal aktual** (input editable, pre-fill estimasi). Kalau variabel: hint selisih dari estimasi dalam bahasa netral ("selisih +Rp X · normal untuk tagihan variabel")
4. **Wallet picker** (radio list, tampilkan saldo per wallet, wajib pilih, tidak ada auto-select)
5. **Tanggal bayar** (default hari ini, editable ke past date via quick pills: "hari ini / kemarin / 2 hari lalu / pilih tanggal ›")

Tap "Konfirmasi" → 4 efek sekaligus: (1) saldo wallet berkurang, (2) entry kebuat di log catatan dengan tag "tagihan · nama", (3) tagihan di-mark paid & hilang dari list aktif, (4) toast di home.

**Toast post-confirm:** muncul di atas bottom action area. Format: "✓ [nama] [−Rp nominal] tercatat · dari [wallet] · barusan" + tombol **Ubah** + **Batal** + countdown bar 5 detik auto-dismiss. "Ubah" → buka push sheet lagi prefilled. "Batal" → revert semua 4 efek.

**Alert anomali tagihan (Basic + Pro):** SISA otomatis bandingkan nominal aktual yang baru diinput saat mark paid vs rata-rata 3 bulan terakhir. Kalau naik signifikan → gentle note di dalam sheet tandai dibayar (bukan popup terpisah).

#### 3.4.8 Goal Tabungan — Waterfall by Total

**Paradigm:** Tabungan itu **satu angka global** — bukan banyak pot terpisah. Total tabungan dibangun dari aksi nabung (lihat 3.4.11 Quick Log). Angka total ini "dituang" ke goal-goal dari urutan teratas ke bawah, seperti air mengisi gelas bertingkat: goal teratas terisi sampai penuh → luber ke goal kedua → penuh → luber ke ketiga, dst.

> 📌 **Perubahan fundamental dari v0.5:** Waterfall lama (Darurat 100% dulu, baru Impian) **dibatalkan**. Tidak ada hierarki bawaan. Tidak ada level yang dipaksa di atas.

**Prinsip:**

1. **Goal sejajar, tidak ada hierarki bawaan.** Urutan murni ditentukan user via drag-drop di home. Yang di atas = yang dikejar duluan.
2. **"Dana Darurat" hanya label, bukan jabatan.** Dana darurat tidak otomatis naik ke atas. App tidak menghakimi: ada user yang sanggup punya buffer, ada yang tidak — keadaan (income vs biaya operasional) yang menentukan, bukan kemalasan. App tidak boleh memaksa prioritas hidup user. Label yang tersedia: **Dana Darurat / Impian #1, #2, #3, dst** — semua setara secara sistem, label hanya penanda.
3. **Nabung = aksi, bukan keputusan alokasi.** Analogi celengan ayam: user yang masukin Rp 100rb tidak mikir "ini buat Impian #3" — dia hanya nabung. Maka di Quick Log mode nabung **tidak ada step "pilih goal"**. Duit otomatis masuk ke goal teratas, luber ke bawah sesuai aturan total.
4. **Reorder = hitung ulang, bukan pindah duit.** Tidak ada event "duit berpindah". Yang ada: total tabungan = X, urutan goal = [A, B, C]. Reorder hanya menyusun ulang urutan → app menghitung ulang isi tiap goal dari total. Total secara keseluruhan tidak ke mana-mana. Konsekuensi: goal yang tadinya terisi sebagian bisa "balik 0" kalau ada goal lain naik ke atasnya — ini bukan kehilangan, hanya re-assign (total tetap utuh).
5. **Edit target = hitung ulang juga.** Naikin target goal teratas → goal di bawahnya otomatis "kering" karena total kesedot ke atas. App tidak memberi warning — biarkan terlihat dari bar yang berubah real-time (jujur sama angka, tidak menggurui).

**Visual state goal (3 kondisi):**

| Kondisi                                                 | Visual                                     | Status text      |
| ------------------------------------------------------- | ------------------------------------------ | ---------------- |
| **Tercapai** (target terpenuhi)                         | Bar full, `color.ink.primary`, ikon ✓      | "tercapai"       |
| **Lagi diisi** (gelas yang sedang ketetesan, umumnya 1) | Bar parsial + persen + warna hidup         | "lagi diisi"     |
| **Antri** (air belum sampai)                            | Tidak ada bar (atau bar kosong abu), redup | "nunggu giliran" |

> Bisa multi-goal "tercapai" sekaligus: kalau beberapa goal teratas target-nya kecil dan total tabungan besar, mereka semua penuh, sisanya netes ke goal berikutnya. Dalam satu layar bisa terlihat: 3 goal ✓, 1 goal 60% lagi diisi, sisanya nunggu.

**Pembeda visual aktif vs antri harus tegas** — bukan sekadar opacity decay halus (model lama 1.0→0.58→0.50 dibatalkan). Goal aktif "nyala" (bar + persen), goal antri "mati" (tanpa bar). Reorder punya konsekuensi visual yang kerasa: drag goal ke atas → dia nyala, yang lama mati.

**Progress bar:** track tipis 3px `color.border.hair`. Fill `color.ink.primary`. Marker finish = segitiga kecil di ujung kanan.

**Basic: max 4 goals. Pro: unlimited goals.** (Tidak ada lagi pembagian "1 Darurat + 3 Impian" — semua slot bebas.)

**Footer goal footer-meta:** "nabung lagi: **[nama goal teratas]** · drag untuk ganti"

**Tarik tabungan:** lihat 3.4.11 (Quick Log — mode keluar, toggle "dari tabungan"). Total tabungan turun → goal kering dari bawah ke atas (kebalikan ngisi).

#### 3.4.9 Insight Bulan Ini

**[DROPPED — 2026-05-22]**

Modul Insight Bulan Ini di-drop dari home canvas v1. Modul ini membutuhkan data window yang cukup sebelum bisa bermakna untuk user baru, dan rotasi 4 insight default dirasa terlalu generic untuk dipertahankan di home. Dihapus dari urutan modul (3.3) dan feature matrix (4.2).

Akan di-rethink bersama Refleksi Sheet sebelum masuk roadmap.

#### 3.4.10 Bottom Action Area

| Button                        | Visual                                                                           | Action               |
| ----------------------------- | -------------------------------------------------------------------------------- | -------------------- |
| **+ Catat** (kiri, 64px)      | Background `color.surface`, icon `+` stroke 1.5px                                | Buka Quick Log Sheet |
| **Cek Dulu** (tengah, flex 1) | Background `color.accent` (cobalt), text putih, subtitle "aman ga gue beli ini?" | Buka Cek Dulu Canvas |
| **Andai** (kanan, 64px)       | Background `color.surface`, icon `git-fork` stroke 1.5px                         | Buka Andai Canvas    |

Cek Dulu dominan visual. Tombol Andai **tidak ada tag "Pro"** meskipun save-scenario adalah Pro feature — tag Pro muncul di dalam Andai saat user coba save scenario, bukan di entry point.

#### 3.4.11 Quick Log Sheet (tap "+ Catat")

**Bentuk:** bottom sheet (bukan push penuh). Drag handle di atas, tap area dim = dismiss.

**Prinsip desain:** nominal > wallet > sisanya opsional. Idealnya user bisa catat hanya dengan: pilih/terima wallet default → ketik nominal → tap Catat (2 aksi inti). Wallet & tanggal sudah ter-default. Itu yang bikin "quick" benar-benar quick. App ini decision-first, bukan tracker-first — maka label & catatan **opsional dan tidak memaksa**.

**Struktur dari atas ke bawah:**

**1. Toggle arah — 3 segmen:** `[ keluar ][ masuk ][ nabung ]`. Default **keluar** (mayoritas kasus = pengeluaran). Toggle ini mengubah field di bawahnya — tiap mode beda isi. "Nabung" jadi segmen sendiri karena secara mental tidak bisa dipaksa masuk "keluar" atau "masuk" (membingungkan user).

**2. Wallet picker (selalu paling atas setelah toggle):** chip horizontal, prefill ke **wallet terakhir dipakai**. Tampil saldo kecil di tiap chip. Wallet kepilih duluan karena **menentukan currency symbol** di nominal. Pilih wallet → bar auto-pindah ke nominal.

**3. Nominal (hero):** angka besar, prefix currency mengikuti wallet terpilih. Numpad auto-focus.

Field setelah 3 elemen inti **berbeda per mode:**

**Mode KELUAR:** 4. **Label** (opsional, chip scroll: makan, transport, belanja...). Disebut "label", bukan "kategori" — lebih ringan, tidak formal. Boleh skip, transaksi tetap tercatat. 5. **Toggle "dari tabungan"** (off default) — mekanisme tarik tabungan. Lihat logika di bawah. 6. **Tanggal** — default "hari ini", quick pills (hari ini / kemarin / pilih tanggal › → kalendar native iOS/Android). 7. **Catatan** (opsional, collapsed). 8. Tombol **Catat** → saldo wallet turun + masuk log.

**Mode MASUK:** 4. **Label** (opsional: gaji, freelance, transfer masuk...). 5. **Tanggal** (default hari ini). 6. **Catatan** (opsional, collapsed). 7. Tombol **Catat** → saldo wallet naik + masuk log (tag income).

**Mode NABUNG:** 4. **Tanggal** (default hari ini).
5. Tombol **Catat** → **total tabungan naik**, otomatis mengalir ke goal teratas (luber ke bawah sesuai 3.4.8). **TIDAK ADA step pilih goal** (paradigma celengan ayam). Saldo wallet turun (uang keluar ke tabungan).

**Tarik tabungan — logika "dari tabungan" (mode keluar):**

Centang "dari tabungan" → pengeluaran ini mengurangi **total tabungan**, bukan operasional. Total tabungan turun → goal kering dari bawah ke atas (3.4.8). Satu cabang logika tunggal:

- **Tarik ≤ total tabungan:** aman. Total tabungan & goal dihitung ulang.
- **Tarik > total tabungan:** app **tanya dulu** (conversational, bukan auto). Contoh: tabungan Rp 500rb, mau keluar Rp 800rb →
  > "Tabungan lo cuma Rp 500rb, tapi mau keluar Rp 800rb. Sisa Rp 300rb dari mana?"
  > ○ Ambil dari operasional
  > ○ Batal, ralat nominal

**Skenario operasional tipis (user kepepet, nyomot tabungan):** user yang **inisiatif** centang "dari tabungan". App **tidak proaktif menawarkan** saat saldo operasional mepet — konsisten dengan prinsip "app tidak menghakimi keadaan user". Jika nominal melebihi tabungan, otomatis jatuh ke pertanyaan di atas. Niat "terencana" vs "kepepet" **tidak dibedakan** di flow Catat (terlalu menghakimi) — keduanya bermuara ke mekanisme yang sama. Pembedaan, kalau perlu, muncul belakangan sebagai insight.

**Toast confirmation (semua mode):** pola sama dengan mark-paid — hitam, di atas bottom action, countdown 5 detik auto-dismiss, tombol **Ubah** + **Batal**.

- Mode nabung: "✓ Nabung **Rp X** · masuk **[nama goal teratas]** · barusan"
- **Batal = revert total (atomik).** Transaksi terhapus + total tabungan dikembalikan + goal dihitung ulang ke kondisi sebelum tap. Tidak ada revert setengah (hapus transaksi tapi progress goal tetap = angka jadi bohong). Berlaku sama untuk nabung maupun tarik tabungan.

#### 3.4.12 Cek Dulu Canvas (tap "Cek Dulu")

**Bentuk:** Full canvas (bukan bottom sheet) — ini momen _keputusan_, butuh ruang baca verdict. Sheet terlalu ringan untuk berat konteksnya.

**Paradigma inti:**

- **Tanpa verdict.** Tidak ada label "aman / ketat / bahaya". App menunjukkan _konsekuensi_, user yang memutuskan. Angka yang ngomong, bukan app yang ngejudge.
- **Comparison before → after.** Dua kolom: "sekarang" (redup, titik banding) → "kalau beli" (pekat, dominan). Selisih yang terasa, bukan angka tunggal.
- **Satu input, nominal saja.** Numpad langsung auto-focus saat canvas kebuka. Tidak ada toggle, tidak ada step tambahan. Target: 5 detik dari buka ke keputusan.
- **Update live.** Tiap digit nominal diketik, kolom "kalau beli" bergerak real-time. Tidak ada tombol "hitung" — hasil muncul otomatis sambil user ngetik.
- **Horizon: sampai gajian.** Cek Dulu mikir jangka pendek — dompet, instan. Skenario multi-variabel & horizon panjang adalah wilayah Andai.

**Skenario yang dijawab:** user lagi di mall, di Shopee jam 11 malem, di kasir — mau tahu "kalau gue checkout ini sekarang, kondisi gue jadi apa?"

**3 baris comparison (adaptif):**

Baris hanya muncul jika nominal menyentuh layer tersebut. Bertambahnya baris adalah sinyal beratnya pengeluaran — tanpa app harus teriak.

| Baris                              | Kondisi muncul                             | Isi                                                                                    |
| ---------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| **1 — Jatah harian sampai gajian** | Selalu ada                                 | `sekarang: 297rb/hr → kalau beli: 80rb/hr`                                             |
| **2 — Sisa pas gajian**            | Muncul saat nominal nembus operasional     | `sekarang: 1.24jt → kalau beli: −180rb`                                                |
| **3 — Tabungan kepotong**          | Muncul hanya saat nominal nyentuh tabungan | `sekarang: 8.5jt → kalau beli: 4.7jt` + sub-note: goal mana yang mundur & berapa bulan |

Baris 3 punya visual inset gelap (heavy) — momen sadar paling telak bahwa ini barang yang kegadai impian, tanpa app bilang "jangan beli".

**Meta kecil (bukan keputusan):** "dihitung dari saldo total · 6 wallet · Rp 9.7jt" — ditampilkan kecil di bawah comparison, bukan hero.

**Basis hitung Cek Dulu:** `availableOp = sisa bulan ini = saldo − tagihan − tabungan`. Row 1 (jatah harian) = `availableOp ÷ hari`. Row 3 (tabungan kepotong) muncul saat nominal > `availableOp` — bukan saat nominal > saldo.

**2 niat user, satu canvas:**

| Niat                    | Aksi                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cuma intip (sneak peek) | Tap **Tutup** — nothing logged, canvas dismiss                                                                                                      |
| Jadi beli               | Tap **"Jadi beli — catat keluar"** → buka Quick Log Sheet dengan nominal sudah terisi. User masih bisa pilih wallet & tambah label sebelum confirm. |

"Jadi beli" tidak langsung commit — sengaja melewati Quick Log biar user bisa assign wallet yang tepat. Akurasi data diutamakan.

#### 3.4.13 Andai Canvas (tap "Andai")

**Bentuk:** Full canvas dengan back button. Bukan bottom sheet — ini meja perencanaan, bukan konsultasi instan.

**Paradigma inti:**

- **Meja perencanaan hipotetis, multi-variabel.** User bisa tumpuk beberapa "andai" sekaligus — beda fundamental dari Cek Dulu yang hanya 1 pengeluaran.
- **Horizon panjang.** Hasil Andai menjawab dampak ke akhir bulan ini + forecast 3 bulan (Pro). Bukan "sampai gajian".
- **4 variabel terkunci:** `beli` (pengeluaran sekali), `income` (pemasukan beda — naik/turun/telat/bonus), `tagihan` (tagihan rutin baru/berubah), `target nabung` (setoran goal naik/turun). Cukup dan bersih — tidak perlu variabel lain.
- **Tanpa verdict.** Sama dengan Cek Dulu — app tunjukkan angka, user yang interpretasi.

**Pembeda tegas dari Cek Dulu:**

| Aspek           | Cek Dulu                         | Andai                                  |
| --------------- | -------------------------------- | -------------------------------------- |
| Jumlah variabel | 1 (satu pengeluaran)             | Banyak, ditumpuk                       |
| Horizon         | Sampai gajian                    | Akhir bulan + 3 bulan                  |
| Input           | Nominal tunggal, numpad langsung | Stack pengandaian, chip picker         |
| Persistence     | Tidak tersimpan                  | Bisa disimpan (Pro)                    |
| Niat user       | Keputusan instan di kasir        | Perencanaan santai, skenario hipotetis |

**Struktur canvas:**

**1. Baseline ("sekarang · tanpa diandai")** — card di atas, selalu nempel. Menampilkan sisa pas gajian dan total tabungan saat ini sebagai titik banding "dunia nyata". Analoginya: ini cabang git yang belum diubah.

**2. Stack pengandaian** — daftar "andai" yang ditumpuk user:

- Tiap item: jenis andai (beli / income / tagihan / target nabung) + deskripsi + nominal/perubahan + tombol hapus (×)
- Tambah via chip picker di bawah: `+ beli` `+ income` `+ tagihan` `+ target nabung`
- Tidak ada urutan wajib — user bebas numpuk kombinasi apapun

**3. Hasil ("kalau semua ini kejadian")** — comparison before → after untuk 3 metrik:

1. Jatah harian sampai gajian
2. Sisa pas gajian
3. Total tabungan

Lalu blok forecast 3-bulan (Pro only): 3 kolom angka per bulan, polos tanpa label opini ("pulih", "aman", dst) — angka saja.

**Tier — pembeda di persistence, bukan hitungan:**

|                                  | Basic                              | Pro         |
| -------------------------------- | ---------------------------------- | ----------- |
| Hitung skenario                  | ✓ penuh                            | ✓ penuh     |
| Tutup canvas → skenario disimpan | ✗ ilang                            | ✓ tersimpan |
| Save scenario                    | ✗ (tag Pro muncul saat tap Simpan) | ✓           |
| Compare 2 skenario berdampingan  | ✗                                  | ✓           |
| Forecast 3-bulan di hasil        | ✗                                  | ✓           |

**Tag Pro di entry point:** tidak ada. Tombol "Andai" di home polos. Basic user bisa buka canvas, main-mainin skenario penuh, lihat hasil — tag Pro baru muncul saat mereka tap "Simpan skenario". Momen konversi di dalam, bukan dinding di depan pintu.

**Simpan Skenario (Pro):**

Tap "Simpan skenario" → sheet penamaan naik di atas canvas yang diredupkan:

- Input nama skenario (ada saran otomatis dari isi: "Andai service mobil + gaji telat")
- Snapshot isi skenario ditampilkan biar user konfirmasi yang benar
- Tap Simpan → skenario masuk ke rak

**Rak skenario (Pro):**

Akses via header "Skenario tersimpan" atau setelah simpan. Isi:

- Baseline acuan ("sekarang tanpa diandai") selalu di atas
- Mode banding: centang maks 2 skenario → tampil berdampingan (2-kolom). Banding maks 2 karena layar 380px hanya muat 2 kolom yang masih kebaca jelas. Mau opsi ke-3: swap salah satu centangan.
- Tiap kolom banding: nama skenario, ringkasan andai, 3 metrik (jatah harian / sisa gajian / tabungan) dengan nilai before & after
- Rak: tiap baris = 1 skenario tersimpan + 1 angka kunci (sisa pas gajian after) + tanggal simpan. **Tap baris → buka ulang di Andai Canvas** (variabel terisi, bisa diedit, simpan ulang). **Swipe kiri → hapus** (konsisten dengan pola swipe tagihan)
- **Maks 10 skenario tersimpan** (sejajar Pro wallet max). Andai adalah meja perencanaan, bukan arsip — lebih dari 10 cenderung tidak ditengok

**Value Pro yang sebenarnya:** bukan "bisa nyimpen" — itu murah. Yang worth dibayar adalah **menjejerkan dua masa depan berdampingan** untuk memilih. Trade-off yang tidak kelihatan tanpa dijejerkan: skenario A = sisa gajian minus tapi tabungan aman, skenario B = sisa gajian plus tapi tabungan kebobol. Dua "buruk" beda jenis — justru itu yang butuh banding.

### 3.5 Decision Log

| Keputusan                                                                              | Rationale                                                                                                                                                                              |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nama app: **SISA**                                                                     | Indonesia-first, dual-market, memorable                                                                                                                                                |
| Light mode default, dark mode opsional (Light/Dark/System)                             | User punya kendali, light default lebih accessible. Dark mode v2 tapi token wajib semantic dari v1                                                                                     |
| **Palet committed: Cool Slate + Cobalt**                                               | Tinted light anti-kusam, cobalt aman dari semua signal color                                                                                                                           |
| **Font: Inter Tight + JetBrains Mono**                                                 | Clean dashboard operator                                                                                                                                                               |
| **Semantic color tokens** wajib dari v1                                                | Dark mode v2 tinggal swap palette                                                                                                                                                      |
| Saldo + wallet list **auto-expanded**                                                  | Reduce friction                                                                                                                                                                        |
| Bottom action: 3 button (Catat, Cek Dulu, Andai)                                       | Modern 2026 pattern, bukan tab bar                                                                                                                                                     |
| Cek Dulu cobalt, dominan visual                                                        | Decision-first paradigm                                                                                                                                                                |
| Icon Andai = `git-fork`                                                                | What-if branching lebih representatif                                                                                                                                                  |
| Bar tebal (22px) budget hari ini pakai cobalt, bar tipis (3px) goal pakai ink-primary  | Cobalt = duit aktif yang bisa dipakai sekarang. Ink = progress tabungan jangka panjang. Pembedaan semantik                                                                             |
| "Tagihan rutin" → "Komitmen bulan ini" → **"Tagihan bulan ini"** (v0.8)                | Cover rutin + sekali bayar. Istilah final: "tagihan" (lebih familiar daripada "komitmen")                                                                                              |
| Simbol **±** untuk tagihan variabel                                                    | User paham dari konteks, anti-over-explain                                                                                                                                             |
| Swipe kiri → **push sheet** (bukan modal langsung)                                     | 3 input (nominal, wallet, tanggal) butuh ruang. Modal bottom terlalu sempit untuk edge case variabel + past date                                                                       |
| Hint selisih nominal variabel pakai bahasa **netral**                                  | Anti-judgmental: "normal untuk tagihan variabel", bukan "kamu over budget"                                                                                                             |
| Toast post-confirm di **atas bottom action**, bukan di top                             | Attention user lagi di area bawah setelah swipe                                                                                                                                        |
| **Notification card kondisional** di atas saldo                                        | Alert time-sensitive di top, saldo tetap bersih. Hanya muncul kalau ada urgent                                                                                                         |
| **Settings icon = 3 garis + dot asimetris**                                            | Distinguish controls dari hamburger nav. Commit ke pattern dari hi-fi original                                                                                                         |
| **Goal sejajar, drag-drop bebas** (waterfall lama dibatalkan)                          | App tidak boleh memaksa prioritas hidup user. Ada yang sanggup punya buffer, ada yang tidak — keadaan yang menentukan, bukan kemalasan. App jujur sama angka, bukan menghakimi pilihan |
| Goal Rp 0 = no bar                                                                     | Bar kosong = visual noise. Bar hanya kalau progress > 0                                                                                                                                |
| **"Dana Darurat" = label, bukan jabatan**                                              | Dana darurat tidak auto-naik. Setara dengan goal lain secara sistem. Label hanya penanda                                                                                               |
| **Tabungan = satu angka global**, dituang ke goal dari atas (waterfall by total)       | Celengan ayam: nabung itu satu aksi, bukan keputusan alokasi. User tidak pilih goal saat nabung                                                                                        |
| Reorder goal = **hitung ulang dari total**, bukan event pindah duit                    | Tidak ada duit nyangkut/kececer. Goal bisa "balik 0" saat di-reorder = re-assign, bukan kehilangan. Total selalu utuh                                                                  |
| Pembeda goal aktif vs antri = **bar nyala vs tanpa bar** (bukan opacity decay)         | Opacity halus tidak kebaca. Harus tegas mana yang sedang diisi vs antri                                                                                                                |
| **Insight Bulan Ini di-drop dari home**                                                | Butuh data window cukup sebelum bermakna. 4 insight default terlalu generic. Di-drop bersama Refleksi Sheet — akan di-rethink dari nol                                                 |
| **Settings icon = 3 garis + dot asimetris** (bukan hamburger)                          | Distinguish controls/settings dari hamburger nav. Dot asimetris berbeda posisi di tiap garis — pattern ini jadi pattern tetap, bukan dekorasi. **Tidak ada border circle.**            |
| **Lisensi masa aktif: 3 bulan** (sebelumnya 6 bulan)                                   | Harga entry lebih rendah = barrier lebih kecil untuk first-time buy. Renewal lebih sering = engagement signal yang lebih baik                                                          |
| Insight: 1 prioritas di home + link sheet                                              | Anti-scroll fatigue                                                                                                                                                                    |
| Akurasi prediksi → inline meta di Sisa Pas Gajian                                      | Hemat ~80px vertical                                                                                                                                                                   |
| Catatan terakhir → 1-line footer                                                       | Tracker-first signal diminimalkan                                                                                                                                                      |
| Haptic feedback sebagai primary mobile feedback                                        | PWA support Vibration API                                                                                                                                                              |
| **"Tandai dibayar"** → push sheet penuh (bukan modal)                                  | 3 input + edge case past date = butuh ruang penuh. Entry point sama dari swipe maupun dari notif sheet                                                                                 |
| Wallet picker dalam tandai dibayar = **radio list, no auto-select, wajib pilih**       | User decide sendiri pakai wallet mana. Auto-select = asumsi yang bisa salah                                                                                                            |
| **Tanggal bayar editable** (past date) dalam tandai dibayar                            | Cover case: KPR bayar tgl 29 meskipun deadline tgl 27                                                                                                                                  |
| Andai entry point **tanpa tag Pro**                                                    | Tag Pro masuk di dalam fitur (saat user coba save scenario), bukan di tombol. Anti-pattern 2020 (padlock everywhere)                                                                   |
| Prediksi 3-bulan: title = **"prediksi uang sisa akhir bulan"**                         | Self-explanatory dari 3 angka bulan yang ditampilkan                                                                                                                                   |
| Prediksi 3-bulan: angka **polos, tanpa opini status**                                  | User paham angka sendiri tanpa perlu label "aman/ketat"                                                                                                                                |
| **Sesuaikan Saldo Wallet**: 3-cara branching (lupa catat / transfer / koreksi)         | Cover semua edge case saldo nyimpang dalam satu entry point                                                                                                                            |
| Transfer antar wallet = **special case dari "Sesuaikan Saldo"**, bukan button terpisah | Reduce complexity, satu entry point cover banyak use case                                                                                                                              |
| Pro: **SISA · Pro** di header (dot separator + lowercase)                              | Eksplisit tapi tidak loud. Operator tool vibe: quiet identifier                                                                                                                        |
| Multi-device sync = **drop total**                                                     | Tidak mau infra/server cost. Ganti dengan export-import manual + backup guide                                                                                                          |
| Export CSV = **Basic**                                                                 | Raw data adalah hak user, bukan fitur premium. Paywalling export = trust violation                                                                                                     |
| **Quick Log: toggle 3 segmen** (keluar/masuk/nabung)                                   | Nabung tidak bisa dipaksa masuk keluar/masuk — beda secara mental, membingungkan user                                                                                                  |
| Quick Log: **wallet dipilih sebelum nominal**                                          | Wallet menentukan currency symbol. Default = wallet terakhir dipakai (lebih sering benar)                                                                                              |
| Quick Log: "kategori" → **"label"**                                                    | Lebih ringan, tidak formal, sesuai vibe anti-tracker. Opsional, tidak memaksa                                                                                                          |
| **Nabung tidak ada step pilih goal**                                                   | Celengan ayam. Duit otomatis ke goal teratas. User pilih prioritas via drag-drop di home, bukan per-transaksi                                                                          |
| Nabung: **earmark dihapus** (v0.9) — satu flow: nabung = saldo turun                   | Earmark bikin user bingung ("saldo kok tidak berkurang?"). Sisa paradigm sudah handle: sisa = saldo − tagihan − nabung. User lihat angka sisa, bukan perlu track earmark terpisah      |
| **Hero = sisa bulan ini** (bukan saldo total) — v0.9                                   | Saldo total bukan angka yang actionable. Sisa = yang bisa beneran dipakai. Formula: `sisa = saldo − tagihan belum dibayar − total tabungan`. Single source of truth: `calcSisa()`    |
| Tarik tabungan = **mode keluar + toggle "dari tabungan"**                              | Tidak perlu flow terpisah. Satu cabang logika: kalau tarik > tabungan, tanya sisanya dari mana                                                                                         |
| Tarik > tabungan = **tanya dulu** (bukan auto)                                         | User sadar duit kesedot dari mana. Konsisten dengan pola Sesuaikan Saldo                                                                                                               |
| Operasional mepet = **user inisiatif** centang "dari tabungan", app tidak proaktif     | App tidak menghakimi keadaan user. Tidak nyolek saat user lagi sempit                                                                                                                  |
| Toast nabung/tarik: **Batal = revert atomik** (transaksi + total tabungan + goal)      | Revert setengah bikin angka bohong (tabungan turun tapi goal tetap terisi). Atomik masuk, atomik keluar                                                                                |
| **Cek Dulu = full canvas**, bukan bottom sheet                                         | Ini momen keputusan — butuh ruang. Sheet terlalu ringan untuk berat konteksnya                                                                                                         |
| Cek Dulu: **tanpa verdict** (no "aman/ketat/bahaya")                                   | App menunjukkan konsekuensi, user yang memutuskan. Angka ngomong sendiri, bukan app yang ngejudge                                                                                      |
| Cek Dulu: **comparison 2 kolom** ("sekarang" redup → "kalau beli" pekat)               | Otak lebih cepat baca perbandingan berdampingan daripada angka tunggal. Selisih yang terasa                                                                                            |
| Cek Dulu: **1 input, nominal saja** — numpad langsung, no toggle                       | User di kasir/Shopee. 5 detik. Toggle sekali/rutin = solusi untuk problem yang tidak ada di skenario ini                                                                               |
| Cek Dulu: **update live** (real-time tiap digit)                                       | "Uang ngempes real-time pas ngetik" — paling komunikatif tanpa tombol hitung                                                                                                           |
| Cek Dulu: **3 baris adaptif** (baris muncul hanya kalau kena dampak)                   | Bertambahnya baris sendiri sudah jadi sinyal beratnya pengeluaran. Beli 50rb = 1 baris kalem, beli 5jt = 3 baris                                                                       |
| Cek Dulu baris 3 (tabungan): **visual heavy/inset gelap**                              | Momen sadar paling telak — impian kegadai — tanpa app bilang "jangan beli"                                                                                                             |
| Cek Dulu "jadi beli": **lewat Quick Log** (bukan langsung commit)                      | User masih bisa assign wallet & label. Akurasi data diutamakan vs kecepatan commit                                                                                                     |
| **Andai = full canvas** dengan back button                                             | Meja perencanaan, bukan konsultasi instan. Butuh space untuk stack variabel & hasil horizon panjang                                                                                    |
| Andai: **4 variabel terkunci** (beli / income / tagihan / target nabung)               | Cukup dan bersih. "Tagihan" bukan "tagihan" — lebih clear. Tidak perlu variabel inflasi/lifestyle drift (itu wilayah Insight)                                                          |
| Andai: **tanpa verdict**, comparison before → after                                    | Konsisten dengan Cek Dulu. Angka yang ngomong, bukan app                                                                                                                               |
| Andai hasil: **jatah harian sampai gajian masuk** sebagai metrik pertama               | Konsistensi dengan Cek Dulu. Ini metrik paling relatable dan jadi anchor baca                                                                                                          |
| Andai forecast 3-bulan: **angka polos, tanpa label opini**                             | "Pulih", "tetap", "aman" = app yang ngejudge. Angka saja, user yang interpretasi                                                                                                       |
| Andai: **Pro beda di persistence**, bukan hitungan                                     | Basic bisa hitung penuh, tapi tutup canvas → ilang. Pro bisa simpan & compare. Hitungannya identik                                                                                     |
| Andai: **maks 10 skenario tersimpan** (Pro)                                            | Sejajar Pro wallet max. Meja perencanaan bukan arsip — lebih dari 10 tidak ditengok                                                                                                    |
| Andai rak: **banding maks 2 skenario berdampingan**                                    | 380px cuma muat 2 kolom yang masih kebaca. Mau ke-3: swap centangan                                                                                                                    |
| Andai rak: **tap baris = edit** (buka ulang Andai Canvas, variabel terisi)             | Skenario hidup, bukan foto mati. Bisa diutak-atik dan simpan ulang                                                                                                                     |
| Andai rak: **swipe kiri = hapus**                                                      | Konsisten pola swipe tagihan. Tidak ada pola interaksi baru                                                                                                                            |

### 3.6 Open Questions

- Behavior bar budget hari ini saat **terpakai > daily budget** (over-budget)? Bar penuh + indikator over? Warna merah?
- Empty state: kalau user belum punya goal sama sekali, hide modul atau tampilkan CTA "buat goal"?
- Subtitle Cek Dulu ("aman ga gue beli ini?") hilang setelah berapa kali pakai? Threshold N=1 atau N=3?
- **Pair Mode** (sync dengan pasangan) — kandidat kuat Pro post-launch. Butuh relay infrastructure yang belum diputuskan. Perlu spec tersendiri saat siap.
- Cek Dulu: apakah baris 2 & 3 yang adaptif perlu ada **visual hint** saat pertama kali muncul, atau langsung muncul tanpa penanda? (di wireframe ada badge "baru muncul" — ini masih perlu dievaluasi)
- Andai: apakah **skenario Basic yang belum disimpan** perlu ada autosave draft lokal (biar ga hilang kalau tidak sengaja tutup canvas), atau dibiarkan ilang sepenuhnya?
- Andai: **urutan chip variabel** (`+ beli` → `+ income` → `+ tagihan` → `+ target nabung`) — apakah urutan ini sudah paling intuitif, atau perlu riset?

---

## 🏷️ 4. Tier & Pricing

### 4.1 Prinsip Split Tier

1. **Flagship paradigm wajib di Basic.** Cek Dulu, Andai, budget hari ini, tagihan, goal tabungan — semua ini inti vision. Paywalling mereka = app kehilangan jati diri.
2. **Pro = amplifier, bukan pintu yang dikunci.** User Basic tidak merasa app-nya cacat. Pro nambah depth, horizon, scale, dan otomasi.
3. **Pro features tidak di-tease sebagai "🔒 locked"** di UI Basic. Pro features tidak muncul sama sekali di Basic — tidak ada greyed-out upsell.
4. **Raw data = hak user.** Export JSON/CSV tetap di Basic.
5. **Test untuk setiap fitur Pro:** _"Apakah Basic user masih punya 95% value tanpa fitur ini?"_ Kalau jawabannya "tidak", fitur itu harus pindah ke Basic.

### 4.2 Feature Comparison

| Fitur                                                | Basic                | Pro                    |
| ---------------------------------------------------- | -------------------- | ---------------------- |
| **Cek Dulu**                                         | ✓                    | ✓                      |
| **Andai** — what-if single skenario                  | ✓                    | ✓                      |
| **Andai** — save & compare multi skenario (maks 10)  | —                    | ✓                      |
| **Catat** — quick log, unlimited transaksi           | ✓                    | ✓                      |
| **Budget hari ini** + formula popup                  | ✓                    | ✓                      |
| **Budget minggu ini + Sisa Pas Gajian**              | ✓                    | ✓                      |
| **Prediksi uang sisa akhir bulan** (3-bulan rolling) | —                    | ✓                      |
| **Tagihan** — rutin + sekali, unlimited              | ✓                    | ✓                      |
| **Alert anomali tagihan**                            | ✓                    | ✓                      |
| **Phantom subscription detection**                   | —                    | ~~✓~~ _[dropped v1]_   |
| **Wallet max**                                       | 4                    | 10                     |
| **Currency**                                         | 1                    | 2 (segmented switcher) |
| **Goal** — sejajar, drag-drop prioritas              | ✓                    | ✓                      |
| **Goal max**                                         | 4                    | Unlimited              |
| **Insight default** (4 rotating)                     | ~~✓~~ _[dropped v1]_ | ~~✓~~ _[dropped v1]_   |
| **Insight Pro** (6 insight di Refleksi sheet)        | —                    | ~~✓~~ _[dropped v1]_   |
| **Refleksi sheet**                                   | —                    | ~~✓~~ _[dropped v1]_   |
| **Akurasi prediksi inline**                          | ✓                    | ✓                      |
| **Export JSON**                                      | ✓                    | ✓                      |
| **Export CSV**                                       | ✓                    | ✓                      |
| **Export Excel template**                            | —                    | ✓                      |
| **PDF monthly Decision Diary**                       | —                    | ✓                      |
| **Scheduled auto-export**                            | —                    | ✓                      |
| **Local-first, no signup**                           | ✓                    | ✓                      |
| **Multi-device sync**                                | —                    | —                      |
| **Pair Mode** (sync dengan pasangan)                 | —                    | Post-launch            |
| **Dark / light / system theme**                      | ✓                    | ✓                      |
| **Haptic feedback**                                  | ✓                    | ✓                      |
| **Beta access + priority support**                   | —                    | ✓                      |

### 4.3 Limits Per Tier

| Resource                   | Basic | Pro       |
| -------------------------- | ----- | --------- |
| Wallet                     | Max 4 | Max 10    |
| Currency                   | 1     | 2         |
| Goal                       | 4     | Unlimited |
| Skenario tersimpan (Andai) | —     | Max 10    |

**Behavior saat Basic user mentok limit:**

> "Lo udah maks 4 wallet di Basic. Upgrade ke Pro untuk sampai 10 wallet ›"

Honest, tidak shame, tidak blocking agresif.

**Behavior saat Pro downgrade ke Basic:**
Data tidak dihapus. Wallet/goal di luar limit Basic menjadi read-only (bisa lihat, tidak bisa tambah/edit baru). User bisa atur ulang manual. Message:

> "Lisensi Pro lo habis. Data lo aman, tapi 4 wallet di luar limit Basic jadi read-only. Perpanjang › atau atur ulang dompet manual ›"

### 4.4 Insight Pro — Refleksi Sheet

**[DROPPED — 2026-05-22]**

Fitur Refleksi Sheet dan 6 Insight Pro (Decision History, Prediction Accuracy, Lifestyle Drift, Phantom Subscription, Income Stability, Goal Velocity) di-drop dari scope v1. Alasan: insight yang ada butuh data window 6 bulan sebelum bisa dirasakan user baru, konsep kurang jelas untuk user, dan beberapa insight (Goal Velocity, Prediction Accuracy) terlalu meta / kering.

Akan di-rethink dari nol sebelum dimasukkan kembali ke roadmap.

### 4.5 Pricing Positioning (Placeholder)

Model: one-time license key, **3 bulan**. Dijual via Clicky.id (IDR) dan Gumroad (USD).

Working assumption (final number menyusul setelah early user research):

- **Basic:** Rp 49k–79k per 3 bulan
- **Pro:** Rp 99k–149k per 3 bulan

Posisi: Basic harus terasa seperti harga yang fair untuk complete decision-support tool — bukan trial, bukan crippled version. Pro untuk user yang sudah pakai Basic dan mau lebih, bukan untuk upsell agresif dari hari pertama.

---

## 📱 5. Onboarding Flow

### 5.1 Prinsip Onboarding

- Target waktu: **< 2 menit** (sesuai persona Overwhelmed Beginner)
- No signup, no email
- User harus masuk ke home screen secepatnya
- License key diinput di onboarding, bukan di paywall gate sebelum app terlihat
- Guide backup/restore disampaikan sekali di awal, tidak berulang

### 5.2 Flow Step-by-Step

> 📌 **Urutan dirombak (v0.8):** license key naik ke depan (setelah bahasa, sebelum intro) — yang sudah bayar tidak perlu baca slide dulu baru bisa aktivasi. Mental model dipangkas 3 slide → 1 slide. Weekend behavior tidak ditanya di onboarding (di-defer kontekstual). Tujuan: tetap di bawah target < 2 menit.

**Step 1 — Pilih Bahasa**

```
SISA

Pilih bahasa
Choose your language

[ ◉ Bahasa Indonesia              ID ]
[ ○ English                       EN ]
```

Tidak ada bahasa default. Dua pilihan equal weight. Tidak ada skip. **Tidak pakai flag emoji** — pakai code chip mono (`ID`/`EN`), konsisten dengan kebijakan anti-emoji-decorative design system.

**Step 2 — License Key**

```
Tempel kode lisensi

[ XXXX-XXXX-XXXX-XXXX ]   (auto-format saat ngetik)

Kode dikirim ke email lo abis beli.

[ Aktivasi ]

Belum punya kode? Beli di sini ›
```

Validasi inline. Error inline "kode ga valid, cek email lo lagi" — bukan modal merah scary. **License di depan (sebelum intro)** karena distribusi via license key: yang baru bayar harus bisa aktivasi cepat, tidak dipaksa baca slide dulu.

**Step 3 — Mental Model (1 slide)**

Bukan tour fitur. Set ekspektasi paradigma supaya user yang baru beli tidak kaget "kok ga ada pie chart." **Dipadatkan jadi 1 slide** (dari 3) — gabungan tiga inti: bukan-tracker + pertanyaan-inti + local-first. Friksi minimal sesuai persona Overwhelmed Beginner.

> "SISA **bukan tracker**.
>
> Catat seinget lo — app jawab satu hal: _aman ga gue beli ini sekarang?_
>
> Data lo **di HP lo**, bukan cloud."

Tombol "Lanjut" di bawah. "Lewati ›" kecil di pojok untuk yang skip. (Detail backup tidak diulang di sini — sudah ada di backup card post-onboarding, lihat 5.3.)

**Step 4a — Tipe Income**

```
Tipe income lo
(ini yang nentuin cara SISA hitung "sisa pas gajian")

○ Gaji bulanan tetap
○ Freelance / project-based
○ Mix — ada gaji + freelance
```

**Step 4b — Detail Income (tergantung pilihan 4a)**

_Kalau Tetap:_

```
Lo gajian tanggal berapa?
[ 25 ▾ ]
```

Hanya tanggal. **Weekend behavior TIDAK ditanya di onboarding.** App default ke "maju ke Jumat" (perilaku paling umum). Pertanyaan asli ("gajian jatuh di weekend → maju Jumat / mundur Senin / tetap / ga konsisten") baru muncul **kontekstual**, yaitu pertama kali tanggal gajian user benar-benar jatuh di Sabtu/Minggu. Alasan: pertanyaan ini abstrak di menit pertama; jauh lebih jelas saat konteksnya nyata. Mengurangi 1 step dari onboarding.

_Kalau Freelance:_

```
Saldo minimum lo
(freelance ga punya tanggal gajian pasti — set batas aman, Cek Dulu ngukur dari sini)
[ Rp ___________ ]
```

**Layar ini HANYA untuk freelance.** Karyawan gaji tetap tidak melihatnya. Logika: gaji tetap punya tanggal gajian → horizon = "sampai tanggal X". Freelance tidak punya tanggal pasti → tidak ada horizon → saldo minimum jadi penggantinya sebagai patokan aman akhir bulan.

_Kalau Mix:_

```
Tanggal gajian tetap + [reminder catat income freelance manual]
```

**Step 4c — Currency Pertama**

```
Mata uang utama lo?
[ 🔍 pilih mata uang... ]  → buka searchable picker
```

**Searchable Picker:** bottom sheet dengan search input. Dua section:

- **Populer:** IDR, USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, CAD
- **Semua (A-Z):** ISO 4217 lengkap (~180 currency)

Format per item: `[symbol]  [code]  [nama lengkap]`

Tidak ada default currency — wajib pilih.

**Step 4d — Wallet Pertama**

```
Tambah wallet pertama lo

Nama wallet
[ ___________ ]   contoh: BCA, Mandiri, Chase, Cash

Saldo sekarang
[ $ ____________ ]   (prefix dari currency yang dipilih di 4c)

[ + Tambah wallet lain ]   (opsional, sampai limit tier)
[ Lanjut › ]
```

Minimal 1 wallet wajib diisi.

**Step 4e — Currency Kedua (Pro only, opsional)**

```
Pakai mata uang lain juga?
Lisensi Pro lo bisa 2 mata uang. Buat yang punya
income atau pengeluaran beda currency.

[ Nanti aja ]    [ + Tambah ]
```

Hanya muncul untuk Pro. Basic langsung ke home. (Copy lama "Lo Pro — bisa tambah currency kedua" diganti — terlalu kaku, terdengar seperti app mengumumkan status.)

**Step 5 — Home**

User landing di home. Data dari setup sudah terisi (saldo dari Step 4d). Empty state guidance subtle (bukan coach mark tooltip):

- Tagihan: "Belum ada tagihan bulanan. Tambah ›"
- Goal: "Setup Dana Darurat lo. Mulai ›"
- Insight: kosong sampai ada data

### 5.3 Backup Guide (Post-Onboarding)

Setelah masuk home pertama kali, muncul **dismissible info card** (bukan modal):

```
ℹ Penting: backup data lo

Data SISA cuma di device ini. Kalau HP ilang/reset,
data ilang. Export backup ke Google Drive/iCloud lo secara rutin.

Cara backup ›    Tutup
```

Tap "Cara backup" → sheet guide:

```
1. Backup rutin
   Buka Settings → Export → Simpan ke Drive/iCloud.

2. Pindah HP
   Di HP lama: Export → simpan file
   Di HP baru: install SISA → onboarding →
   di Step 4, tap "Import dari backup" → pilih file.

3. Kenapa manual?
   Kita ga simpan data lo di server kita.
   Itu yang bikin SISA aman & murah.
   Trade-off: backup jadi tanggung jawab lo.
```

**Reminder periodik:** jika sudah 30 hari sejak export terakhir, muncul dismissible card di home. Dismiss → muncul lagi di hari 45, lalu 60. Setelah hari 60: interval makin pendek (70, 80, 90...). Pattern eskalasi pelan, tidak nag mingguan.

---

## ⚙️ 6. Fitur Spec Tambahan

### 6.1 Multi-Currency (Pro)

**Limit:** Max 2 currency aktif per user.

**Paradigma strict isolation:** IDR dan USD adalah dua konteks terpisah. Tidak ada cross-currency mixing atau konversi otomatis. Wallet, tagihan, dan goal masing-masing melekat ke satu currency dan hanya muncul di mode currency tersebut.

**Switcher UI:** Segmented control `[ IDR ][ USD ]` di bawah header wordmark, kiri-aligned. Active state: white surface. Inactive: ghost di surface-2. Hanya tampil untuk Pro user dengan 2 currency aktif.

**Edit currency:** Settings → Wallet & Currency. Hapus currency = warning bahwa semua wallet di currency itu juga terhapus.

**Notifikasi antar mode:** Notif dari mode IDR tidak muncul saat user di mode USD. Strict isolation.

### 6.2 Wallet & Currency Setup (Settings)

Dua entry point untuk edit wallet/currency:

**A. Settings → "Wallet & Currency"**

- List semua wallet, digroup per currency
- Tambah wallet baru (sampai limit tier)
- Edit nama wallet
- Hapus wallet (dengan konfirmasi, ada history)
- Tambah currency kedua (Pro only, belum mentok limit)

**B. Inline dari Wallet Sheet**

- Tap saldo total → expand/sheet → tap wallet individual → Wallet Detail Sheet
- Di Wallet Detail: rename inline, hapus wallet (danger button), "Sesuaikan saldo"
- Di Wallet Sheet (list level): "+ Tambah wallet" kalau belum mentok limit

### 6.3 Sesuaikan Saldo Wallet

Akses: Wallet Sheet → tap wallet → button "Sesuaikan".

User input saldo aktual → SISA hitung selisih → user pilih:

```
Ke mana [selisih]-nya?

○ Lupa catat pengeluaran
○ Transfer ke wallet lain
○ Koreksi (saldo awal salah)
```

**Lupa catat:** buat transaksi `−Rp selisih · tag: koreksi` dengan timestamp "antara catatan terakhir & sekarang". Honest — pengeluaran yang hilang tetap masuk sebagai expense di history, tidak disembunyikan.

**Transfer ke wallet lain:** user pilih wallet tujuan → buat 2 entry pasangan (tidak dihitung sebagai spend).

**Koreksi:** update angka saja, no transaction. App tidak menghukum, tapi user tau akurasi prediksi mungkin terpengaruh.

### 6.4 Export & Backup

| Format                | Tier  | Keterangan                     |
| --------------------- | ----- | ------------------------------ |
| JSON (raw data)       | Basic | Hak user, selalu tersedia      |
| CSV (semua transaksi) | Basic | Hak user                       |
| Excel template        | Pro   | Pre-formatted, ada pivot setup |
| PDF Decision Diary    | Pro   | Curated narrative per bulan    |
| Scheduled auto-export | Pro   | Otomatis tiap akhir bulan      |

**Import:** user pilih JSON file dari backup sendiri → restore semua data. Tersedia di onboarding (Step 4 ada opsi "Import dari backup") dan di Settings → Data & Backup.

**Tidak ada bank sync.** Indonesia banking tidak ada open API, dan bank sync bertentangan dengan local-first paradigm.

---

## 🏃 7. Sprint Plan

> **Konteks:** Solo developer, development via Claude Code. Sprint = unit kerja yang bisa di-commit dan di-demo secara mandiri. Kalau quota Claude Code habis di tengah sprint, kode yang sudah di-commit aman — sesi berikutnya resume dari sprint yang sama.
>
> **Prinsip urutan:** Basic complete dulu sebelum Pro features. Fondasi (infra + DB + license + onboarding) harus beres sebelum fitur apapun bisa berjalan.
>
> **Definition of Done per sprint:** semua user story di sprint itu pass acceptance criteria-nya, kode di-commit ke branch `feature/sprint-X`, dan di-merge ke `main` via PR dengan CI green.

---

### Sprint 1 — Fondasi Teknis

**Goal:** Project bisa jalan di browser, Dexie tersedia, routing bekerja, design tokens terpasang. Belum ada fitur apapun — ini scaffolding yang membuat sprint berikutnya bisa bergerak cepat.

| #   | User Story                                                                                                                              | Acceptance Criteria                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Sebagai developer, gue mau setup Vite + React + TypeScript + CSS Modules berjalan dengan konfigurasi yang sesuai engineering guidelines | `npm run dev` jalan tanpa error; `npm run build` menghasilkan `dist/`; ESLint + Prettier tidak ada warning; tsconfig strict mode aktif                                           |
| 1.2 | Sebagai developer, gue mau folder structure feature-based terbentuk sesuai spec                                                         | Folder `src/app/`, `src/features/`, `src/shared/`, `src/db/`, `src/store/`, `src/constants/` ada dan mengikuti struktur di engineering guidelines §2                             |
| 1.3 | Sebagai developer, gue mau Dexie database ter-setup dengan schema v1 dan semua tabel terdefinisi                                        | `db/database.ts` ada dengan tabel `transactions`, `wallets`, `tagihan`, `goals`, `settings`, `license`, `meta`; Dexie instance bisa di-import tanpa error                        |
| 1.4 | Sebagai developer, gue mau ClockProvider tersedia di root app dan `useClock()` bisa dipakai di komponen mana saja                       | `ClockProvider` wrap root App; `useClock()` return `{ now, today }`; `FixedClock` tersedia untuk testing; tidak ada `new Date()` / `Date.now()` di luar `SystemClock`            |
| 1.5 | Sebagai developer, gue mau CSS design tokens terpasang sebagai CSS custom properties                                                    | Semua token dari `design_system.md` §1 tersedia sebagai `--canvas`, `--accent`, dll; Inter Tight + JetBrains Mono ter-load; `font-feature-settings: "tnum", "lnum"` aktif global |
| 1.6 | Sebagai developer, gue mau React Router tersetting dengan route dasar                                                                   | Route `/onboarding` dan `/` (home) terdefinisi; redirect logic placeholder ada                                                                                                   |
| 1.7 | Sebagai developer, gue mau GitHub Actions CI jalan dan Vercel auto-deploy tersambung                                                    | Push → CI jalan (tsc + eslint + prettier + vitest + build); PR ke `main` → Vercel preview deploy; merge → Vercel production deploy                                               |
| 1.8 | Sebagai developer, gue mau pre-commit hooks aktif                                                                                       | Husky + lint-staged + commitlint ter-setup; commit format salah di-reject; staged files auto-fix saat commit                                                                     |

---

### Sprint 2 — License & Aktivasi

**Goal:** Sistem license key Ed25519 berjalan end-to-end. User yang punya key bisa aktivasi, app tahu tier-nya, expiry di-enforce. Ini yang membuat SISA bisa dijual.

| #   | User Story                                                                                                                             | Acceptance Criteria                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 | Sebagai developer, gue mau script `gen-license.ts` bisa generate license key yang valid untuk tier Basic dan Pro dengan expiry 90 hari | Script jalan via `npx ts-node scripts/gen-license.ts`; output string key format `base64url.base64url`; `scripts/` dan output key ada di `.gitignore`                                                   |
| 2.2 | Sebagai user, gue mau memasukkan license key di onboarding Step 2 dan app memverifikasi kunci tersebut                                 | Input field menerima key; validasi signature Ed25519 via Web Crypto API; key invalid → error inline "kode ga valid, cek email lo lagi" (bukan modal); key valid → lanjut ke Step 3                     |
| 2.3 | Sebagai app, gue mau menyimpan license yang sudah diverifikasi ke IndexedDB dan membacanya kembali saat app dibuka ulang               | Setelah aktivasi: key + payload + `lastSeenAt` tersimpan di tabel `license`; buka ulang → verify ulang signature → status terbaca benar                                                                |
| 2.4 | Sebagai app, gue mau mendeteksi expiry license dan menampilkan status yang tepat                                                       | `licenseStore` punya status `unactivated / active / expired / invalid / tampered`; expiry dicek via `Clock.now()` vs `payload.exp`; `expired` → pesan perpanjang non-blocking, data tetap bisa diakses |
| 2.5 | Sebagai app, gue mau anti-rollback ringan bekerja untuk mencegah jam device dimundurkan                                                | `lastSeenAt` di-update tiap buka; `Clock.now() < lastSeenAt - TOLERANCE` → status `tampered` → pesan netral "jam device kelihatan mundur"; `TOLERANCE` = 6 jam                                         |
| 2.6 | Sebagai developer, gue mau semua logic license tercover unit test                                                                      | Test: key valid lulus; key palsu gagal; key expired terdeteksi; anti-rollback terpicu; tier Basic vs Pro terbaca benar; happy/empty/boundary semua pass                                                |

---

### Sprint 3 — Onboarding Flow

**Goal:** User baru bisa menyelesaikan setup awal dari bahasa sampai landing di home, dengan data tersimpan ke IndexedDB.

| #   | User Story                                                                                        | Acceptance Criteria                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | Sebagai user baru, gue mau memilih bahasa di layar pertama                                        | Dua pilihan dengan code chip mono `ID`/`EN` (tanpa flag emoji); pilihan tersimpan ke `settings`; tidak ada default — wajib pilih sebelum lanjut               |
| 3.2 | Sebagai user baru, gue mau memasukkan license key sebelum melihat intro app                       | Step 2 setelah pilih bahasa; license verification dari Sprint 2; sukses → lanjut; gagal → error inline                                                        |
| 3.3 | Sebagai user baru, gue mau melihat satu slide mental model yang menjelaskan paradigma SISA        | Copy: "SISA bukan tracker. app jawab satu hal: aman ga gue beli ini sekarang? Data lo di HP lo, bukan cloud."; tombol "Lanjut" + "Lewati ›" kecil di pojok    |
| 3.4 | Sebagai user baru, gue mau memilih tipe income dan mengisi detail yang sesuai                     | Tiga pilihan: Gaji tetap / Freelance / Mix; Tetap → input tanggal gajian; Freelance → input saldo minimum; Mix → tanggal + note; data tersimpan ke `settings` |
| 3.5 | Sebagai user baru, gue mau memilih mata uang utama dari searchable picker                         | Picker bottom sheet dengan search; section Populer + Semua A-Z; format: `[symbol] [code] [nama]`; tidak ada default                                           |
| 3.6 | Sebagai user baru, gue mau menambahkan minimal 1 wallet dengan nama dan saldo awal                | Input nama + saldo; prefix currency dari Step 4c; minimal 1 wajib; opsi tambah wallet lain; data tersimpan ke `wallets`                                       |
| 3.7 | Sebagai user Pro baru, gue mau ditawari menambah currency kedua                                   | Step 4e hanya untuk Pro; "Nanti aja" atau "+ Tambah"; Basic langsung ke home                                                                                  |
| 3.8 | Sebagai user yang selesai onboarding, gue mau landing di home dengan data tersisi dan backup card | Home tampil saldo dari wallet yang dibuat; backup info card muncul (dismissible, bukan modal); routing ke `/onboarding` di-block kalau sudah selesai          |

---

### Sprint 4 — Home Canvas (Basic)

**Goal:** Home canvas Basic lengkap dan bisa dibaca — semua modul tampil dengan data nyata dari IndexedDB. Fokus: rendering dan kalkulasi yang benar.

| #    | User Story                                                                                   | Acceptance Criteria                                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.1  | Sebagai user, gue mau melihat header bar dengan wordmark "SISA" dan settings icon yang benar | Header "SISA" 11px 700 letter-spacing 1.5px; settings icon 3 garis + dot asimetris (bukan hamburger); tap → navigasi ke Settings                                                                 |
| 4.2  | Sebagai user, gue mau melihat saldo total dan list wallet saya                               | Saldo total 38px semibold hero; subtitle "terpakai kemarin / masuk kemarin"; wallet list auto-expanded, saldo JetBrains Mono; Basic max 4 wallet                                                 |
| 4.3  | Sebagai user, gue mau melihat budget hari ini dengan progress bar dan angka yang akurat      | Formula: `(saldo - tagihan tersisa - target tabungan) ÷ hari sampai gajian`; bar 22px cobalt; footer "terpakai · sisa hari ini"; meta "N hari sampai gajian (tgl X)"; kalkulasi via `useClock()` |
| 4.4  | Sebagai user, gue mau melihat budget minggu ini dan sisa pas gajian dalam 2 kolom            | Grid 2 kolom; status "ketat/aman" menggunakan signal color inline (bukan badge); akurasi prediksi inline "akurasi: 81% ›"                                                                        |
| 4.5  | Sebagai user, gue mau melihat tagihan bulan ini — maksimal 4 dengan ranking urgency          | Ranking: lewat tempo → due hari ini → dalam 7 hari → collapsed; simbol `±` untuk variabel; expand link kalau lebih dari 4                                                                        |
| 4.6  | Sebagai user, gue mau melihat notifikasi card jika ada tagihan lewat tempo atau due hari ini | Card kondisional: hanya muncul kalau ada urgent; `--signal-danger-bg`, border-left 3px; kalau tidak ada = tidak ada sama sekali                                                                  |
| 4.7  | Sebagai user, gue mau melihat goal tabungan saya dengan visual aktif vs antri yang tegas     | Goal aktif = bar 3px parsial + persen; goal antri = tanpa bar sama sekali + "nunggu giliran" italic; semua badge `--ink-primary` setara                                                          |
| 4.8  | Sebagai user, gue mau melihat footer catatan terakhir dengan link ke history                 | 1 baris: nama `--ink-primary` + amount mono `--signal-danger` + "semua catatan ›" `--accent`                                                                                                     |
| 4.9  | Sebagai user, gue mau melihat bottom action area dengan 3 tombol                             | Catat (kiri 64px surface); Cek Dulu (tengah flex-1 cobalt, subtitle "aman ga gue beli ini?"); Andai (kanan 64px surface); fixed bottom; haptic saat tap                                          |
| 4.10 | Sebagai developer, gue mau semua kalkulasi home tercover unit test                           | Test budget: saldo normal, saldo 0, tagihan > saldo, gajian weekend, freelance mode; FixedClock; happy/empty/boundary pass                                                                       |

---

### Sprint 5 — Interaksi Home & Quick Log

**Goal:** Semua interaksi di home berfungsi dan user bisa mencatat transaksi via Quick Log. Ini yang membuat data di home bergerak.

| #    | User Story                                                                                         | Acceptance Criteria                                                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | Sebagai user, gue mau swipe kiri tagihan untuk reveal panel "tandai dibayar"                       | Swipe kiri → reveal action panel; tap "tandai dibayar" → buka push sheet penuh                                                                                                                                  |
| 5.2  | Sebagai user, gue mau mengisi push sheet tandai dibayar dengan nominal, wallet, dan tanggal        | Push sheet: preview item; note dashed; nominal editable (pre-fill estimasi, hint selisih untuk variabel); wallet picker radio wajib (tampilkan saldo); tanggal (default hari ini, quick pills)                  |
| 5.3  | Sebagai user, gue mau konfirmasi tandai dibayar menghasilkan 4 efek dan toast yang bisa dibatalkan | 4 efek atomik: saldo turun + log entry + tagihan paid + toast; toast: nama + amount + wallet + Ubah + Batal + 5 detik; Batal → revert semua 4 efek                                                              |
| 5.4  | Sebagai user, gue mau tap saldo total untuk expand wallet list detail                              | Tap saldo → toggle expand atau Wallet Sheet                                                                                                                                                                     |
| 5.5  | Sebagai user, gue mau tap tagihan baris dan notif card untuk detail                                | Tap baris → push sheet detail; tap notif card → bottom sheet list urgent                                                                                                                                        |
| 5.6  | Sebagai user, gue mau mencatat pengeluaran via Quick Log mode keluar                               | Tap Catat → bottom sheet; toggle default "keluar"; wallet chip (default terakhir + saldo); nominal numpad auto-focus; label opsional; tanggal quick pills; catatan collapsed; Catat → saldo turun + log + toast |
| 5.7  | Sebagai user, gue mau mencatat income mode masuk                                                   | Toggle masuk; wallet + nominal + label opsional + tanggal; Catat → saldo naik + log (tag income) + toast                                                                                                        |
| 5.8  | Sebagai user, gue mau mencatat tabungan mode nabung tanpa memilih goal                             | Toggle nabung; wallet + nominal + tujuan (earmark vs pindah wallet); Catat → total tabungan naik + otomatis ke goal teratas (waterfall) + toast; TIDAK ada step pilih goal                                      |
| 5.9  | Sebagai user, gue mau toggle "dari tabungan" untuk tarik tabungan                                  | Centang "dari tabungan"; tarik ≤ tabungan → proceed; tarik > tabungan → conversational prompt: "Tabungan lo cuma Rp X, mau keluar Rp Y. Sisa dari mana?"                                                        |
| 5.10 | Sebagai user, gue mau melihat History Sheet semua transaksi dengan filter dasar                    | "semua catatan ›" → History Sheet; reverse chronological; filter: semua/keluar/masuk/nabung; tiap baris: nama + wallet + tanggal + amount mono                                                                  |
| 5.11 | Sebagai user, gue mau drag-drop goal untuk mengubah urutan prioritas                               | Long-press → drag; drop → reorder tersimpan; total tabungan dihitung ulang ke urutan baru; goal naik ke atas nyala, yang lama mati                                                                              |

---

### Sprint 6 — Cek Dulu & Andai (Basic)

**Goal:** Dua fitur flagship berfungsi penuh untuk Basic tier. Setelah sprint ini, SISA sudah bisa mendemonstrasikan core value proposition-nya.

| #   | User Story                                                                                          | Acceptance Criteria                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.1 | Sebagai user, gue mau membuka Cek Dulu Canvas dan langsung fokus ke numpad                          | Tap Cek Dulu → full canvas; numpad auto-focus; tidak ada step tambahan                                                                                                                           |
| 6.2 | Sebagai user, gue mau melihat perbandingan before-after yang update real-time saat mengetik nominal | Tiap digit → kolom "kalau beli" bergerak real-time; "sekarang" redup; "kalau beli" pekat; tanpa tombol hitung                                                                                    |
| 6.3 | Sebagai user, gue mau melihat baris comparison yang muncul adaptif sesuai beratnya pengeluaran      | Baris 1 (jatah harian) selalu ada; baris 2 (sisa gajian) muncul saat nembus operasional; baris 3 (tabungan) muncul saat nyentuh tabungan + visual inset gelap; tanpa verdict "aman/ketat/bahaya" |
| 6.4 | Sebagai user, gue mau menutup Cek Dulu tanpa mencatat apapun                                        | Tap "Tutup" → dismiss; tidak ada yang ter-log; saldo tidak berubah                                                                                                                               |
| 6.5 | Sebagai user yang jadi beli, gue mau langsung ke Quick Log dengan nominal terisi                    | Tap "Jadi beli — catat keluar" → Quick Log Sheet; nominal sudah terisi; user masih pilih wallet + label                                                                                          |
| 6.6 | Sebagai user, gue mau membuka Andai Canvas dan menambahkan variabel "andai"                         | Tap Andai → full canvas; baseline card selalu di atas; chip picker: `+ beli`, `+ income`, `+ tagihan`, `+ target nabung`; tiap andai masuk stack dengan tombol hapus                             |
| 6.7 | Sebagai user, gue mau melihat hasil Andai — comparison before-after 3 metrik                        | Hasil: jatah harian, sisa gajian, total tabungan; before → after; tanpa verdict; jatah harian sebagai metrik pertama                                                                             |
| 6.8 | Sebagai user Basic, gue mau mencoba simpan Andai dan melihat tag Pro                                | Tap "Simpan" → tag Pro muncul di dalam canvas; Basic tidak bisa simpan; kalkulasi tetap tampil                                                                                                   |
| 6.9 | Sebagai developer, gue mau semua kalkulasi Cek Dulu dan Andai tercover unit test                    | Test Cek Dulu: nominal 0, < daily budget, > saldo, > saldo + tabungan; test Andai: kombinasi variabel; FixedClock; happy/empty/boundary pass                                                     |

---

### Sprint 7 — Settings, Profil & Sesuaikan Saldo

**Goal:** User bisa mengelola kondisi keuangan (wallet, tagihan, goal, income) dan preferensi app (tema, bahasa, export/import).

| #    | User Story                                                                           | Acceptance Criteria                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1  | Sebagai user, gue mau mengakses Settings dari header dan melihat profil di atas      | Tap settings icon → Settings screen; profil card (nama, tier badge, sisa hari); tap profil → Profil screen                                                                                          |
| 7.2  | Sebagai user, gue mau mengubah tema dan bahasa di Settings                           | Section Tampilan: segmented tema (terang/gelap/sistem); dropdown bahasa; perubahan real-time; note "gelap = v2"                                                                                     |
| 7.3  | Sebagai user, gue mau export backup JSON dan CSV                                     | "Export backup" → download `.json` (semua data + schemaVersion + exportedAt); "Export transaksi" → download `.csv` (transaksi, format IDR titik ribuan); keduanya Basic                             |
| 7.4  | Sebagai user, gue mau import backup dari file JSON                                   | File picker `.json`; validasi schemaVersion; preview ringkasan; konfirmasi → overwrite; sukses → toast; gagal → error jelas                                                                         |
| 7.5  | Sebagai user, gue mau menghapus semua data dengan konfirmasi eksplisit               | Konfirmasi dua langkah (warning + ketik "HAPUS"); setelah hapus → redirect onboarding; tidak ada undo                                                                                               |
| 7.6  | Sebagai user, gue mau mengakses Profil dan melihat semua kondisi keuangan            | Profil: nama, tier, sisa hari; section: Profil Keuangan, Dompet & Mata Uang, Tagihan, Goal Tabungan, Lisensi                                                                                        |
| 7.7  | Sebagai user, gue mau mengedit income schedule dari Profil                           | Tap tipe income → edit (tetap/freelance/mix); sub-rows sesuai tipe; weekend behavior muncul kontekstual                                                                                             |
| 7.8  | Sebagai user, gue mau menambah, mengganti nama, dan menghapus wallet dari Profil     | Section Dompet: list + total; tap → Wallet Detail: rename inline, hapus (konfirmasi), "Sesuaikan saldo"                                                                                             |
| 7.9  | Sebagai user yang salah input saldo, gue mau sesuaikan saldo wallet dengan 3 pilihan | Input saldo aktual → hitung selisih → "selisih dari mana?"; (1) Lupa catat → buat transaksi koreksi; (2) Transfer ke wallet lain → 2 entry pasangan; (3) Koreksi saja → update angka no transaction |
| 7.10 | Sebagai user, gue mau mengelola tagihan dari Profil                                  | Section Tagihan: list + total; tambah (nama, nominal tetap/variabel, due date); edit; hapus konfirmasi                                                                                              |
| 7.11 | Sebagai user, gue mau mengelola goal tabungan dari Profil                            | Section Goal: list + total tersimpan; tambah (nama, target); edit target; hapus (konfirmasi + dampak ke total); reorder urutan                                                                      |
| 7.12 | Sebagai user, gue mau melihat status lisensi dan bisa ganti kode atau beli baru      | Section Lisensi: status, masa aktif, ganti kode (input field), perpanjang/beli (link Clicky/Gumroad buka tab baru)                                                                                  |
| 7.13 | Sebagai user, gue mau mengakses panduan backup dan FAQ                               | "Cara backup" → Backup Guide Sheet 3-step; "FAQ" + "Kebijakan privasi" → halaman teks; "Kontak" → link @win32_icang                                                                                 |

---

### Sprint 8 — PWA Hardening, Polish & Pro Features

**Goal:** App siap dijual — bisa diinstall sebagai PWA, jalan offline, Pro features aktif, polish selesai.

| #    | User Story                                                                  | Acceptance Criteria                                                                                                                                                                |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1  | Sebagai user, gue mau install SISA sebagai PWA di device saya               | `vite-plugin-pwa` ter-setup; manifest benar (nama, icon maskable, theme color `#EEF1F5`, display standalone); install prompt muncul setelah onboarding; lulus Lighthouse PWA audit |
| 8.2  | Sebagai user, gue mau SISA berfungsi penuh tanpa koneksi internet           | Service worker precache app shell offline-first; semua fitur offline; satu-satunya butuh internet: link beli (buka tab baru)                                                       |
| 8.3  | Sebagai user, gue mau notifikasi update yang tidak intrusif                 | Update tersedia → banner "versi baru tersedia, muat ulang ›"; tidak auto-reload saat user input                                                                                    |
| 8.4  | Sebagai user Pro, gue mau melihat prediksi uang sisa akhir bulan di home    | Card full-width di bawah 2-col (hanya Pro); 3 kolom angka per bulan; polos tanpa opini; tap "detail ›" → Forecast Detail Sheet                                                     |
| 8.5  | Sebagai user Pro, gue mau menyimpan skenario Andai dan mengaksesnya kembali | Simpan → sheet penamaan dengan saran otomatis; rak skenario (maks 10, baseline selalu di atas); tap → buka ulang prefilled; swipe kiri → hapus                                     |
| 8.6  | Sebagai user Pro, gue mau membandingkan 2 skenario Andai berdampingan       | Mode banding: centang maks 2 → 2 kolom; tiap kolom: nama + ringkasan + 3 metrik before-after; swap untuk ganti skenario ke-3                                                       |
| 8.7  | Sebagai user Pro, gue mau melihat forecast 3-bulan di Andai Canvas          | Blok di bawah hasil (Pro only); 3 kolom per bulan; angka polos tanpa label opini                                                                                                   |
| 8.8  | Sebagai user Pro, gue mau 2 mata uang dengan strict isolation               | Segmented control `[IDR][USD]` di header (Pro + 2 currency aktif); swap → seluruh app ganti context; tidak ada cross-currency mixing                                               |
| 8.9  | Sebagai user Pro, gue mau header "SISA · Pro"                               | "SISA · Pro" dot separator; "Pro" lowercase 10px 500 `--ink-secondary`                                                                                                             |
| 8.10 | Sebagai user, gue mau haptic feedback di aksi penting                       | Mark paid → haptic medium; swipe reveal → haptic light; Vibration API dengan feature-detect (tidak crash di browser tanpa support)                                                 |
| 8.11 | Sebagai user, gue mau backup reminder eskalasi kalau belum backup lama      | Hari 30 → card dismissible; dismiss → hari 45, 60; setelah hari 60 → interval makin pendek; tidak pernah blocking                                                                  |
| 8.12 | Sebagai developer, gue mau Lighthouse score layak untuk diluncurkan         | Performance ≥ 90; Accessibility ≥ 90; Best Practices ≥ 90; SEO ≥ 90; PWA checklist hijau semua                                                                                     |

---

### Ringkasan Sprint

| Sprint | Fokus                      | Deliverable Utama                                                     | Estimasi              |
| ------ | -------------------------- | --------------------------------------------------------------------- | --------------------- |
| **1**  | Fondasi Teknis             | Project setup, Dexie, ClockProvider, design tokens, CI/CD             | 2–3 hari              |
| **2**  | License & Aktivasi         | Ed25519 keygen, verifikasi, expiry, anti-rollback                     | 2–3 hari              |
| **3**  | Onboarding                 | 5 step onboarding, routing, backup card                               | 2–3 hari              |
| **4**  | Home Canvas (Basic)        | Semua modul home render dengan data nyata + kalkulasi benar           | 3–4 hari              |
| **5**  | Interaksi Home & Quick Log | Swipe tagihan, toast, Quick Log 3 mode, history, drag-drop goal       | 4–5 hari              |
| **6**  | Cek Dulu & Andai (Basic)   | Dua fitur flagship functional, real-time update, adaptif rows         | 3–4 hari              |
| **7**  | Settings & Profil          | Manajemen data user, export/import, sesuaikan saldo                   | 4–5 hari              |
| **8**  | PWA & Pro Features         | Install, offline, prediksi Pro, save skenario, multi-currency, polish | 4–5 hari              |
|        |                            | **Total estimasi**                                                    | **~24–32 hari kerja** |

> 📌 Estimasi adalah hari kerja solo dengan Claude Code. Tiap sprint berakhir dengan commit + merge ke `main` — natural checkpoint yang aman kalau quota Claude Code habis di tengah jalan.

---

## 📄 Document Info

| Field            | Value                    |
| ---------------- | ------------------------ |
| **Version**      | 1.0 (Draft)              |
| **Status**       | In Progress              |
| **Last Updated** | 2026-05-22               |
| **Owner**        | Product (TBD)            |
| **Stakeholders** | Founder, Future Dev Team |

### Change Log

| Date       | Change                                                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-22 | **v1.0** — Bab 7 Sprint Plan ditambahkan: 8 sprint, 80 user story, acceptance criteria per story, ringkasan estimasi                                                                                                                                                                                 |
| 2026-05-22 | **v0.9** — Wireframe files diupdate: 6 file baru ditambahkan ke 3.1 (quick_log, history, settings, profil, backup_guide, onboarding). Total wireframe: 15 file. Tabel dipisah per kategori                                                                                                           |
| 2026-05-21 | **v0.8** — Onboarding flow (5.2) dirombak: license key dipindah ke depan (Step 2, setelah bahasa sebelum intro); mental model dipangkas 3 slide → 1 slide; weekend behavior di-defer (tidak ditanya di onboarding, default "maju ke Jumat", muncul kontekstual saat gajian pertama jatuh di weekend) |
| 2026-05-21 | Onboarding Step 1: flag emoji diganti code chip mono (`ID`/`EN`) — konsisten anti-emoji-decorative                                                                                                                                                                                                   |
| 2026-05-21 | Onboarding Step 4b: ditegaskan saldo minimum HANYA untuk freelance (karyawan gaji tetap tidak melihatnya)                                                                                                                                                                                            |
| 2026-05-21 | Onboarding Step 4e: copy "Lo Pro — bisa tambah currency kedua" diganti "Pakai mata uang lain juga?" — terlalu kaku                                                                                                                                                                                   |
| 2026-05-21 | Wireframe lofi baru: settings, profil, onboarding flow (8 layar)                                                                                                                                                                                                                                     |
| 2026-05-21 | Settings/Profil dipisah: Profil = kondisi keuangan user (income, wallet, tagihan, goal, lisensi); Settings = preferensi app (tampilan, data & backup, tentang+FAQ)                                                                                                                                   |
| 2026-05-21 | Export Excel template & PDF Decision Diary di-drop dari scope. Scheduled auto-export di-reframe (PWA tidak bisa background: jadi "ingetin + 1-tap saat app dibuka")                                                                                                                                  |
| 2026-05-21 | Terminologi: "tagihan" → "tagihan" (cover rutin + sekali bayar)                                                                                                                                                                                                                                      |
| 2026-05-21 | Andai Canvas (3.4.13) dispec penuh: full canvas, 4 variabel dikunci (beli/income/tagihan/target nabung), horizon panjang (akhir bulan + forecast 3-bulan Pro), tanpa verdict                                                                                                                         |
| 2026-05-21 | Andai tier split dikunci: Basic = hitung penuh (tidak tersimpan); Pro = save & compare maks 10 skenario berdampingan                                                                                                                                                                                 |
| 2026-05-21 | Andai rak skenario: tap = edit (buka ulang canvas), swipe kiri = hapus, banding maks 2, maks 10 tersimpan                                                                                                                                                                                            |
| 2026-05-21 | Feature matrix diupdate: Andai save & compare (maks 10). Limits table ditambah row skenario tersimpan                                                                                                                                                                                                |
| 2026-05-21 | Wireframe files list diupdate: 3 file baru (cekdulu_canvas, andai_canvas, simpan_skenario)                                                                                                                                                                                                           |
| 2026-05-21 | Decision Log diupdate: 22 keputusan baru dari sesi desain Cek Dulu & Andai                                                                                                                                                                                                                           |
| 2026-05-21 | Open Questions diupdate: 3 pertanyaan baru (badge hint adaptif Cek Dulu, autosave draft Andai Basic, urutan chip variabel)                                                                                                                                                                           |
| 2026-05-21 | **v0.6** — Quick Log Sheet (3.4.11) dispec penuh: toggle 3-segmen keluar/masuk/nabung, wallet sebelum nominal, label (bukan kategori), tarik tabungan via "dari tabungan"                                                                                                                            |
| 2026-05-21 | **Goal model dirombak total (3.4.8):** waterfall lama dibatalkan. Goal sejajar drag-drop, tidak ada hierarki bawaan                                                                                                                                                                                  |
| 2026-05-21 | "Dana Darurat" turun jadi label biasa (bukan jabatan auto-prioritas). App tidak memaksa prioritas hidup user                                                                                                                                                                                         |
| 2026-05-21 | Tabungan = satu angka global, "waterfall by total" (dituang ke goal dari atas ke bawah). Reorder = hitung ulang, bukan pindah duit                                                                                                                                                                   |
| 2026-05-21 | Nabung: tidak ada step pilih goal (celengan ayam). Earmark (skenario B) vs pindah dompet (skenario A) dalam 1 flow                                                                                                                                                                                   |
| 2026-05-21 | Tarik tabungan: tarik > tabungan = tanya dulu. Operasional mepet = user inisiatif (app tidak proaktif). Toast Batal = revert atomik                                                                                                                                                                  |
| 2026-05-21 | **v0.5** — Bab 4 (Tier & Pricing), Bab 5 (Onboarding), Bab 6 (Fitur Spec Tambahan) ditambahkan                                                                                                                                                                                                       |
| 2026-05-21 | Multi-currency spec: strict isolation, segmented control, max 2 currency, Pro only                                                                                                                                                                                                                   |
| 2026-05-21 | Income Schedule: 3 tipe (tetap/freelance/mix), weekend behavior, freelance = target saldo minimum                                                                                                                                                                                                    |
| 2026-05-21 | Sesuaikan Saldo: 3-cara branching (lupa catat / transfer / koreksi)                                                                                                                                                                                                                                  |
| 2026-05-21 | Tandai Dibayar: push sheet penuh (bukan modal), nominal editable, wallet picker wajib, tanggal editable (past date support)                                                                                                                                                                          |
| 2026-05-21 | Prediksi 3-bulan rolling: Pro-only full-width card, title plain "prediksi uang sisa akhir bulan", angka polos tanpa label opini                                                                                                                                                                      |
| 2026-05-22 | **v0.9** — Wireframe files diupdate: 6 file baru ditambahkan ke 3.1 (quick_log, history, settings, profil, backup_guide, onboarding). Total wireframe: 15 file. Tabel dipisah per kategori                                                                                                           |
| 2026-05-22 | Wireframe revision notes ditambahkan ke 3.1 untuk home_basic, home_pro, settings, dan onboarding                                                                                                                                                                                                     |
| 2026-05-22 | **Insight Bulan Ini (modul 7) di-drop dari home canvas.** Dihapus dari urutan modul 3.3, feature matrix 4.2, dan spec 3.4.9. Open question insight toggle juga dihapus                                                                                                                               |
| 2026-05-22 | **Refleksi link (modul 7a) di-drop.** Sudah di-drop v0.8 tapi belum di-update di tabel modul 3.3 — sekarang dikonsistenkan                                                                                                                                                                           |
| 2026-05-22 | **Settings icon dikonfirmasi: 3 garis + dot asimetris, bukan hamburger biasa.** Decision Log 3.5 dipertegas                                                                                                                                                                                          |
| 2026-05-22 | **Masa aktif lisensi diubah: 6 bulan → 3 bulan.** Quick Info table, section 4.5 Pricing, dan Decision Log diupdate                                                                                                                                                                                   |
| 2026-05-22 | Phantom Subscription Detection di-drop dari Pro tier (bagian dari Refleksi yang di-drop)                                                                                                                                                                                                             |
| 2026-05-21 | Multi-device sync: drop total. Diganti dengan export-import manual + backup guide                                                                                                                                                                                                                    |
| 2026-05-21 | Export CSV: diputuskan tetap di Basic (raw data = hak user, bukan fitur premium)                                                                                                                                                                                                                     |
| 2026-05-21 | Andai entry point tanpa tag Pro (tag Pro masuk di dalam fitur, bukan di tombol)                                                                                                                                                                                                                      |
| 2026-05-21 | Pro tier header: "SISA · Pro" (dot separator + lowercase)                                                                                                                                                                                                                                            |
| 2026-05-21 | Wireframe files list diupdate di 3.1 (lofi Basic, lofi Pro, 4 state files)                                                                                                                                                                                                                           |
| 2026-05-21 | Navigation patterns diexplicitkan di 3.2: push sheet vs bottom sheet vs inline expand                                                                                                                                                                                                                |
| 2026-05-21 | Alert anomali tagihan: Basic feature (pure logic, bandingkan nominal vs rata-rata 3 bulan)                                                                                                                                                                                                           |
| 2026-05-21 | Goal opacity decay diupdate: Pro stack 5+ dengan 0.36 minimum                                                                                                                                                                                                                                        |
| 2026-05-21 | Toast post-confirm spec: posisi di atas bottom action, Ubah + Batal + 5 detik countdown                                                                                                                                                                                                              |
| 2026-05-20 | **v0.4** — Visual direction di-commit: palet Cool Slate + Cobalt, font Inter Tight + JetBrains Mono                                                                                                                                                                                                  |
| 2026-05-20 | "Tagihan rutin" → "Komitmen bulan ini" _(istilah ini kemudian diganti "Tagihan bulan ini" di v0.8)_                                                                                                                                                                                                  |
| 2026-05-20 | Notification card kondisional ditambahkan                                                                                                                                                                                                                                                            |
| 2026-05-20 | Insight: 1 prioritas di home + link sheet                                                                                                                                                                                                                                                            |
| 2026-05-20 | Akurasi prediksi: inline meta di Sisa Pas Gajian                                                                                                                                                                                                                                                     |
| 2026-05-20 | Catatan terakhir: 1-line footer                                                                                                                                                                                                                                                                      |
| 2026-05-20 | Goal Rp 0: no bar                                                                                                                                                                                                                                                                                    |
| 2026-05-20 | Icon Andai: git-fork                                                                                                                                                                                                                                                                                 |
| 2026-05-20 | Setting icon: hapus border circle, bare stroke icon                                                                                                                                                                                                                                                  |
| 2026-05-20 | Haptic feedback dimasukkan ke spec                                                                                                                                                                                                                                                                   |
| 2026-05-18 | Bab 1-2 ditulis ulang sebagai fondasi                                                                                                                                                                                                                                                                |
| 2026-05-18 | Archetype B di-split: B-anxious (V1) vs B-impulsive (V2)                                                                                                                                                                                                                                             |
