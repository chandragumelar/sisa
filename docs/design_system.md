# SISA — Design System

> **Versi:** 2.0 (Electric Violet Ledger)
> **Mode:** Light + Dark + System
> **Paradigma visual:** _Violet Ledger_ — soft-modern, flat, angka mono sebagai hero.
> **Prinsip turunan dari PRD:** Opinionated, honest, hard numbers, no sugarcoating, no fake gamification.

---

## 0. Philosophy

SISA adalah **decision support tool**, bukan tracker yang cantik. Karena itu visual-nya harus terasa seperti **alat** — bukan seperti app lifestyle, bukan seperti dompet digital warna-warni, bukan editorial magazine.

Tiga prinsip yang nge-drive semua keputusan di bawah:

1. **Hierarchy dari kontras canvas vs card, bukan dari shadow.** Canvas bertone, card putih bersih + border tipis = card "ngangkat" tanpa drop-shadow. Trik ini dipinjem dari GitHub/Linear.
2. **Dark-first premium, light high-contrast.** Dark mode dirancang sebagai pengalaman utama yang terasa mahal (surface naik dari near-black, accent violet pop di atas gelap); light mode tetap tegas kontrasnya, bukan sekadar kebalikan warna.
3. **Pembagian warna tegas, ga ada overlap fungsi.** Violet = bisa ditekan/brand. Merah = bahaya. Amber = ketat. Hijau = aman. Setiap hue cuma punya satu pekerjaan.

---

## 1. Color Tokens

### 1.1 Surfaces

| Token         | Hex (light) | Hex (dark) | Pakai untuk                                                       |
| ------------- | ----------- | ---------- | ------------------------------------------------------------------ |
| `--canvas`    | `#FFFFFF`   | `#0A0A0B`  | Background utama screen                                          |
| `--surface`   | `#F7F6FA`   | `#131316`  | Card, modul, container yang harus "ngangkat"                     |
| `--surface-2` | `#EFEEF5`   | `#1A1A1F`  | Track progress bar, empty state bar                               |
| `--surface-3` | `#E6E4EE`   | `#242429`  | Surface ketiga (lebih dalam dari surface-2) — heatmap empty cell |

### 1.2 Ink (text)

| Token             | Hex (light) | Hex (dark) | Pakai untuk                                |
| ----------------- | ----------- | ---------- | ------------------------------------------- |
| `--ink-primary`   | `#141216`   | `#F3F2F6`  | Heading, amount utama, nama item penting   |
| `--ink-secondary` | `#5C5867`   | `#A8A5B3`  | Body text, label deskriptif, nama wallet   |
| `--ink-tertiary`  | `#948FA0`   | `#6E6B7A`  | Meta-info, helper text, footer, swipe hint |

### 1.3 Borders

| Token           | Hex (light) | Hex (dark) | Pakai untuk                                    |
| --------------- | ----------- | ---------- | ------------------------------------------------ |
| `--border-hair` | `#E4E2EC`   | `#232228`  | Border default card, divider antar row          |
| `--border-soft` | `#D8D5E3`   | `#302F38`  | Border subtle (jarang dipakai, untuk variasi)  |

### 1.4 Accent — Electric Violet

Violet sengaja occupy hue yang ga disentuh signal apapun (merah/amber/hijau). Ini bahasa **interactive / brand**.

| Token            | Hex (light) | Hex (dark) | Pakai untuk                                     |
| ---------------- | ----------- | ---------- | -------------------------------------------------- |
| `--accent`       | `#7C5CFF`   | `#8B5CF6`  | CTA utama (Cek Dulu), link, elemen yang bisa ditap |
| `--accent-hover` | `#6A47F5`   | `#9E75FF`  | Hover/pressed state                             |
| `--accent-bg`    | `#F1EEFF`   | `#1E1830`  | Background subtle untuk info chip / hint        |
| `--accent-br`    | `#D9D0FF`   | `#3A2E5C`  | Border accent, underline decoration link        |
| `--accent-text`  | `#FFFFFF`   | `#FFFFFF`  | Teks/icon di atas background accent             |

### 1.5 Signal — Saturated, Anti-Pastel

Signal harus **kelihatan**. Ga ada pastel. User butuh tau langsung "ini bahaya" vs "ini aman" dalam 0.3 detik.

| Token                 | Hex (light) | Hex (dark) | Pakai untuk                                          |
| --------------------- | ----------- | ---------- | ------------------------------------------------------ |
| `--signal-danger`     | `#C8362F`   | `#F0685F`  | Lewat tempo, jatuh tempo hari ini, pengeluaran (−Rp) |
| `--signal-danger-bg`  | `#FDECEC`   | `#301414`  | Background notif urgent                              |
| `--signal-danger-br`  | `#F5C9C6`   | `#4E211F`  | Border notif urgent                                  |
| `--signal-caution`    | `#A5720A`   | `#E8B23D`  | Status "ketat", prediksi mepet                       |
| `--signal-caution-bg` | `#FBF1DD`   | `#2E2510`  | Background chip/notif "ketat"                        |
| `--signal-caution-br` | `#F0DCA8`   | `#4A3C18`  | Border chip/notif "ketat"                             |
| `--signal-safe`       | `#1A8A55`   | `#3ECB82`  | Income, status aman, surplus                         |
| `--signal-safe-bg`    | `#E9F7EF`   | `#122B1E`  | Background chip/notif "aman"                          |
| `--signal-safe-br`    | `#C9EBD8`   | `#1F4430`  | Border chip/notif "aman"                              |

### 1.6 Data Visualization Colors

**Categorical palette** — 8 named category colors for spending breakdowns. Used consistently across Sankey, category sparkline, ranking bars. Never use accent (`#7C5CFF`) for data — it's reserved for interactive elements.

Token pattern: `--viz-cat-{category}` where category is: `makanan`, `transport`, `belanja`, `tagihan`, `hiburan`, `kesehatan`, `investasi`, `lainnya`.

| Token                 | Hex (light) | Hex (dark) |
| ---------------------- | ----------- | ---------- |
| `--viz-cat-makanan`    | `#BD6E4F`   | `#E38A67`  |
| `--viz-cat-transport`  | `#4E75AF`   | `#73A0E2`  |
| `--viz-cat-belanja`    | `#955A89`   | `#C27EB3`  |
| `--viz-cat-tagihan`    | `#008389`   | `#20ACB3`  |
| `--viz-cat-hiburan`    | `#A8A06D`   | `#C3B97D`  |
| `--viz-cat-kesehatan`  | `#6A9F90`   | `#7ABAA8`  |
| `--viz-cat-investasi`  | `#2E728D`   | `#509DBE`  |
| `--viz-cat-lainnya`    | `#828690`   | `#787A80`  |

Helper: `getCategoryColor(categoryKey)` from `src/shared/utils/vizColors.ts` — maps category names (case-insensitive) to CSS vars, falls back to `--viz-cat-lainnya` for unmapped categories (e.g. `Pendidikan`). Use `VIZ_CAT_PALETTE` instead when you only have an index, not a category key.

**Sequential palette** — 4-shade "Metric Blue" ramp for single-metric bar charts (monthly keluar/masuk). `--viz-seq-1` (most inactive) through `--viz-seq-4` (active/current). Deliberately NOT violet — avoids confusion with accent. Exposed as the `VIZ_SEQ` array in the same helper file.

**Signal colors in charts** — `--signal-safe` and `--signal-caution` remain for semantic data: net positive/negative, surplus/deficit, "Sisa" node in Sankey, spiked/highlighted category in ranking. These are NOT part of the category palette and are never replaced by `getCategoryColor()`.

### 1.7 `[data-theme='dark']`

Dark mode bukan cuma invert warna — surface naik bertingkat dari canvas near-black (`#0A0A0B`) ke surface lebih terang, border lebih terang dari surface (bukan lebih gelap, biar tetap "ngangkat"), dan accent violet dinaikkan saturasinya biar tetap pop di atas gelap. Semua token dark ada di kolom "Hex (dark)" tabel §1.1–1.6 di atas, dan didefinisikan di selector `[data-theme='dark']` pada `tokens.css` — bukan `prefers-color-scheme` media query, karena app punya toggle tema manual.

### 1.8 Aturan Warna (Hard Rules)

- **Jangan pakai violet untuk signal.** Violet cuma untuk hal yang bisa ditekan.
- **Jangan pakai signal untuk dekorasi.** Merah cuma keluar kalau memang ada masalah.
- **Jangan campur signal di satu komponen.** Satu card = satu mood. Notif merah ya merah semua, bukan merah + amber.
- **Hijau jarang muncul.** Hijau itu hadiah, bukan default. Default-nya neutral ink.
- **`--accent` = tindakan, titik.** Kalau user gak bisa nge-tap elemennya, itu bukan tempat buat violet — progress bar, node chart, dot data, ujung skala heatmap semua pakai neutral ink atau `--heat-*`, bukan `--accent`. Refactor `refactor/accent-semantics` nyeberangin ini dari 130+ pemakaian yang campur aduk jadi satu aturan.
- **Satu pengecualian: prefix simbol mata uang.** `.heroPrefix` (angka Sisa, `SaldoModule.module.css`) dan `.ob-input-prefix` (badge "Rp" di input nominal onboarding, `step.css`) tetap violet — bukan tindakan, bukan data, tapi signature brand yang disengaja di titik-titik nominal uang paling penting. Ditulis juga sebagai komentar persis di kedua selektor itu.

---

## 2. Typography

### 2.1 Font Families

```css
--font-sans: 'Manrope', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

- **Manrope** — untuk semua label, heading, body, deskripsi. Sans-only kebijakan. Pakai range weight 400–800.
- **JetBrains Mono** — **khusus angka tabular** (saldo wallet, amount tagihan, amount goal). Tujuannya: angka rapih kolom-kolom, gampang dibanding.

Selalu nyalain feature settings:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: 'tnum', 'lnum'; /* untuk semua angka */
font-feature-settings: 'cv11'; /* body global, alternatif huruf 'l' */
```

### 2.2 Type Scale

| Role               | Size   | Weight     | Letter-spacing  | Contoh dari wireframe             |
| ------------------ | ------ | ---------- | --------------- | ---------------------------------- |
| **Hero amount**    | 38px   | 600        | -1.4px          | Saldo total `Rp 4.730.000`        |
| **Big amount**     | 30px   | 600        | -0.9px          | Budget hari ini `Rp 178.000`      |
| **Card num**       | 19px   | 600        | -0.5px          | Budget minggu ini `Rp 530.000`    |
| **Cek Dulu label** | 17px   | 600        | -0.3px          | Tombol "Cek Dulu"                 |
| **Name bold**      | 13px   | 500        | normal          | Nama tagihan, nama goal           |
| **Wallet name**    | 12.5px | 400        | normal          | "BCA", "Mandiri"                  |
| **Amount mono**    | 12px   | 500        | normal          | Saldo wallet, amount tagihan      |
| **Notif body**     | 11.5px | 400        | normal          | Body notif card                   |
| **Brand wordmark** | 11px   | 700        | 1.5px           | "SISA" di header                  |
| **Bar footer**     | 11px   | 400        | normal          | "Rp 57rb terpakai"                |
| **Meta info**      | 10.5px | 400        | normal          | "9 hari sampai gajian"            |
| **Card sub**       | 10px   | 400        | normal          | "sampai minggu · 4 hari"          |
| **Module label**   | 10px   | 700        | 1.1px UPPERCASE | "budget hari ini", "saldo total"  |
| **Goal badge**     | 8.5px  | 600        | 0.6px UPPERCASE | "DANA DARURAT", "IMPIAN #1"       |
| **Swipe hint**     | 9.5px  | 400 italic | normal          | "geser kiri untuk tandai dibayar" |

### 2.3 Aturan Tipografi

- **Module label selalu UPPERCASE + tracking 1.1px.** Konsistensi ini yang bikin section break kebaca tanpa garis.
- **Negative letter-spacing cuma di angka besar (≥19px).** Bikin angka rapat, terasa "padat informasi". Di body text, jangan.
- **Italic cuma untuk hint instruksional** ("geser kiri untuk..."). Ga buat penekanan.
- **Bold di body = 600.** Bold di angka utama = 600. Konsistensi weight.
- **Jangan pakai font display/serif/decorative.** Sans-only. Editorial vibe = ga relevan untuk operator app.

---

## 3. Spacing & Layout

### 3.1 Container

```
Device frame width:  380px   (mobile-first, max canvas)
Screen padding:      14px horizontal, 14px top, 90px bottom (ruang untuk bottom-action)
Border-radius screen: 30px
```

### 3.2 Spacing Scale

Pakai kelipatan 2 / 4:

```
2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20
```

| Use case                                | Value                                    |
| ---------------------------------------- | ----------------------------------------- |
| Padding card                            | `11-12px` horizontal, `11-13px` vertical |
| Gap antar elemen kecil (label + amount) | `4-6px`                                  |
| Gap antar elemen menengah               | `8-10px`                                 |
| Margin bottom hero block                | `12-16px`                                |
| Divider section (margin)                | `18px`                                   |
| Grid gap (2-col card)                   | `8px`                                    |
| Bottom-action gap                       | `8px`                                    |

### 3.3 Section Pattern

Setiap section di home ngikutin pattern:

```
[ module-label ]  [ meta-info (opsional, kanan) ]
[ hero data / list ]
[ supporting meta / link expand ]
─────────────── divider 1px ───────────────
```

Divider `--border-hair` setebal 1px, margin atas-bawah `18px`. Ini yang ngedefinisiin **rhythm** scroll. Jangan diganti shadow, jangan diganti card-in-card.

---

## 4. Component Library

### 4.1 Notification Card (Urgent)

```
┌──────────────────────────────────────┐
│ ⚠️  2 tagihan lewat tempo —      ›  │   ← danger-bg, danger-br, border-left 3px
│     Listrik (hari ini) & Hutang Budi  │
└──────────────────────────────────────┘
```

- Background `--signal-danger-bg`, border `--signal-danger-br`, **border-left 3px solid `--signal-danger`** (penanda urgency)
- Border-radius `var(--radius-card)`, padding `11px 12px`
- Icon kiri `--signal-danger`, body `--ink-primary`, **bold-fragment** `--signal-danger`, chevron `--signal-danger`
- **Hanya muncul kalau ada hal urgent.** Kalau ga ada, hilang total (jangan diganti placeholder "semua aman ✓" — itu kebalikan dari prinsip honest).

### 4.2 Hero Amount Block (Saldo / Budget)

Pattern: `[module-label]` → `[hero-amount 38px atau big-amount 30px]` → `[hero-sub atau bar]`.

- Hero amount selalu **Manrope semibold dengan tnum + lnum** (figure tabular & lining).
- Negative letter-spacing wajib di size ini (-1.4px atau -0.9px).
- Sub-line di bawahnya pakai `--ink-tertiary` 11px (saldo) atau `--ink-secondary` 11px (budget bar).

### 4.3 Wallets List (di-nest dalam card)

```
┌──────────────────────────────────────┐
│ BCA               Rp 2.180.000       │
│ ────────────────────────────────     │  ← border-hair 1px
│ Mandiri           Rp 1.420.000       │
│ ShopeePay         Rp 880.000         │
│ Cash              Rp 250.000         │
└──────────────────────────────────────┘
```

- Container: `--surface`, border `--border-hair`, radius `var(--radius-card)`, padding `2px 12px`
- Row: padding `8px 0`, border-bottom `--border-hair` (kecuali last)
- Nama: 12.5px, `--ink-secondary`, regular
- Amount: **mono**, 12px, 500, `--ink-primary`, `tnum`

### 4.4 Progress Bar (Budget Hari Ini)

**Bar Tebal (hero, untuk Budget Hari Ini):**

- Height `4px`, background `--border-hair`, radius `var(--radius-pill)`
- Fill: gradient neutral `--border-soft` → `--ink-tertiary`, radius `var(--radius-pill)` di kiri (sudut kanan flat — bar belum penuh)
- Footer 2-kolom: kiri "terpakai", kanan "sisa hari ini" (`--ink-primary` bold)

**Bar Tipis (Goal):**

- Height `3px`, background `--border-hair`, radius `2px`
- Fill: `--ink-primary`
- Marker target: triangle ke bawah `--ink-tertiary` di ujung kanan

> **Kenapa netral, bukan violet?** Progress bar itu indikator data (berapa persen jatah harian yang udah kepake), bukan tombol — user gak nge-tap dia. `--accent` cuma buat yang bisa ditekan (lihat §1.8). Budget dan goal sama-sama neutral sekarang; bedanya cuma tebal-tipis sesuai hierarki visual (lihat `refactor/sisa-as-hero-section` — Jatah Harian sengaja jadi elemen sekunder).

### 4.5 Two-Column Stat Card

```
┌───────────────┐  ┌───────────────┐
│ BUDGET MINGGU │  │ SISA PAS GAJIAN│
│ Rp 530.000    │  │ Rp 420.000    │
│ sampai minggu │  │ prediksi · KETAT │
│               │  │ ┄┄┄┄┄┄┄┄┄┄┄┄ │ ← dashed border
│               │  │ akurasi: 81%› │
└───────────────┘  └───────────────┘
```

- Grid `1fr 1fr`, gap `8px`
- Card: `--surface`, border `--border-hair`, radius `var(--radius-card)`, padding `11px 12px`
- `card-num` 19px semibold, `card-sub` 10px `--ink-tertiary`
- **Status tag inline** (mis. "ketat") pakai `--signal-caution` 500
- **Card meta inline** (mis. "akurasi 81%") dipisah `border-top: 1px dashed --border-hair` — dashed dipakai khusus untuk **meta secondary** yang masih bisa di-tap

### 4.6 List Row (Tagihan)

```
Listrik                                  ± Rp 280rb  ›
jatuh tempo hari ini · belum dibayar
─────────────────────────────────────────────────
Spotify                                   Rp 59rb   ›
3 hari lagi
```

- Row: `flex space-between`, padding `9px 0`, border-bottom `--border-hair`
- **Nama bold** 13px 500 `--ink-primary`
- **Meta meta** 10.5px — `--ink-tertiary` (normal), atau `--signal-danger` 500 (lewat tempo / urgent)
- **Amount mono** 12px 500 `--ink-primary`, `nowrap`, font-mono
- Chevron `›` 13px `--ink-tertiary`, ml `6px`
- **Pattern ± sebelum amount** dipakai untuk angka **estimasi** (bukan pasti). Beda dengan `Rp 500rb` (pasti).

### 4.7 Expand Link & Swipe Hint

```
+ 3 tagihan lainnya · iCloud, Netflix, Indihome ›
                       geser kiri untuk tandai dibayar  ← italic, kanan
```

- Expand link: 11px `--accent`, padding-top `10px`, border-top `--border-hair`. Bold-fragment 500 (bukan 600 — link bukan judul).
- Swipe hint: 9.5px italic `--ink-tertiary`, align right. **Boleh hilang setelah user familiar** (progressive disclosure).

### 4.8 Goal Card (Flat, Drag-Drop)

Goal punya **prinsip baru (v0.8)**: tidak ada hierarki bawaan, tidak ada "jabatan" goal yang otomatis di atas. Urutan murni ditentukan user via drag-drop. Visual-nya nunjukin **aktif vs antri** secara tegas, bukan lewat opacity decay:

```
[DANA DARURAT]  Dana darurat          Rp 3.2jt / Rp 15jt     ← bar parsial (aktif, lagi diisi)
lagi diisi →
████░░░░░░░░░░░░░░░░░░░░░░░ ▼

[IMPIAN #1]     DP rumah              Rp 0 / Rp 80jt          ← no bar (antri)
nunggu giliran

[IMPIAN #2]     Liburan Jepang        Rp 0 / Rp 25jt          ← no bar (antri)
nunggu giliran
```

**Tiga kondisi visual goal:**

| Kondisi        | Visual                                                     |
| -------------- | ------------------------------------------------------------ |
| **Tercapai**   | Bar penuh + icon ✓ + status "tercapai"                     |
| **Lagi diisi** | Bar parsial + persen + warna hidup (ink-primary fill)      |
| **Antri**      | Tidak ada bar sama sekali + status "nunggu giliran" italic |

**Pembeda aktif vs antri harus tegas** — bukan opacity halus. Goal aktif nyala (ada bar + persen), goal antri mati (tanpa bar). Drag goal ke atas → dia nyala, yang lama mati.

- Goal badge: 8.5px uppercase, padding `2px 6px`, radius `3px`, weight 600
  - **Semua badge setara secara visual** — bg `--ink-primary`, text `--canvas`. Tidak ada badge spesial untuk "Dana Darurat". Dana Darurat hanya label, bukan jabatan.
- Status "lagi diisi →" (aktif) atau "nunggu giliran" (italic `--ink-tertiary`, antri)
- **Bar fill hanya muncul di goal aktif** — goal antri tidak punya bar
- Bar: height `3px`, background `--border-hair`, fill `--ink-primary` (bukan violet). Marker target: segitiga kecil di ujung kanan.
- Footer meta: `"nabung lagi: [nama goal teratas] · drag untuk ganti"` — 9.5px italic `--ink-tertiary`

> **Kenapa tidak opacity decay?** Opacity halus (0.55 → 0.48) tidak cukup kebaca dan memberi kesan app menghakimi prioritas. Bar nyala vs no-bar jauh lebih tegas dan jujur. User sendiri yang memutuskan urutan via drag, bukan app.

> **Kenapa semua badge sama?** App tidak boleh memaksa prioritas hidup user. Ada yang sanggup punya buffer darurat, ada yang tidak — keadaan yang menentukan. Dana Darurat bukan jabatan sistem, hanya label penanda.

### 4.9 Insight Card

**[DROPPED — v1]**

Modul Insight Bulan Ini di-drop dari home canvas v1 (PRD v0.9). Komponen ini tidak perlu diimplementasi. Akan di-rethink dari nol sebelum masuk roadmap.

### 4.10 Footer Catatan (1-line)

```
terakhir dicatat: Kopi −Rp 18rb · 2 jam lalu        semua catatan ›
```

- Single line, 11px `--ink-tertiary`
- Item name `--ink-primary` 500
- Amount keluar pakai **mono** `--signal-danger` 500 dengan prefix `−`
- "semua catatan ›" `--accent` dengan underline `--accent-br` (decoration warna lembut, biar ga "loud")

### 4.11 Priority Weight Bar (Fixed)

Three buttons, visual weight scaled by usage frequency — not three equal slots. No input or number visible in the collapsed bar; the input only appears inside the expand sheet.

```
┌───────────────────────────────────────────────────┐
│ [↗]   [🔍 Cek Dulu]         [  + Catat         ] │
│ ghost   outline pill          solid accent flex:1  │
└───────────────────────────────────────────────────┘
```

- Sticky bottom, `background: --canvas`, `border-top: 1px solid --border-hair`
- Padding `14px 14px calc(20px + safe-area-inset-bottom)`, flex row, `align-items: center`, gap `8px`
- **Insight (ghost, smallest):** `34×34px`, radius `12px`, no bg/border, icon `TrendingUp` 18px stroke 2, `--ink-tertiary`. Icon only, no label.
- **Cek Dulu (outline pill, medium):** height `48px`, padding `0 15px`, radius `14px`, border `1.5px solid --border-soft`, bg `--canvas`, color `--ink-secondary`. Icon `Search` 15px + label, gap `7px`.
  - **State 0 (empty):** border `--border-hair`, color `--ink-tertiary`, `opacity: 0.5` → tap adds wallet
  - **State 1 (partial):** border `--signal-caution` + 6px caution dot top-right → tap adds missing item
  - **State 2 (full):** border `--border-soft` (default) → tap toggles expand sheet
  - **Active (sheet open):** border + color `--accent`
- **Catat (solid, dominant):** `flex: 1` — biggest element in the bar, height `48px`, radius `14px`, bg `--accent`, color white, icon `Plus` 17px + label, `box-shadow: --shadow-pill-accent`, haptic on tap.

**Expand sheet (Cek Dulu tap, state 2 only) — bottom sheet, not in-place:**

```
┌───────────────────────────────────────────┐
│                   ──                       │ ← handle
│  [ Cek Dulu ]  [ Andai ]   ← segmented tab │
│  ┌───────────────────────────────────┐     │
│  │ Rp  Berapa harganya?               │     │
│  └───────────────────────────────────┘     │
│  ┌───────────────────────────────────┐     │
│  │         Cek sekarang               │     │
│  └───────────────────────────────────┘     │
└───────────────────────────────────────────┘
```

- `position: absolute`, `bottom: 0`, full-width, `background: --canvas`, radius `24px 24px 0 0`, `box-shadow: --shadow-sheet`
- Handle bar `36×4px`, radius pill, `--border-soft`, centered
- Segmented tab: bg `--surface-2`, border `1px solid --border-hair`, pill radius, active tab bg `--accent` + white text
- **Cek Dulu tab:** currency-prefixed numeric input (auto-focused on open) + full-width accent "Cek sekarang" button
- **Andai tab:** single accent button "Buka Andai →" navigating to `/andai`
- Backdrop `rgba(20, 18, 22, 0.35)` fixed behind sheet — tap closes
- Bar behind the sheet stays visible but dimmed (`opacity: 0.4`, `pointer-events: none`); Cek Dulu button shows its active (accent) state

**Shadow tokens:** `--shadow-pill-accent` on Catat, `--shadow-sheet` on the expand sheet — the only two non-`none` shadows in the system, both intentional elevation for the primary action and the modal-like sheet. Every other surface stays flat (elevation via border).

**Animation:** backdrop fades in `150ms ease-out`; sheet slides up `transform: translateY(100%) → translateY(0)`, `200ms ease-out`. No spring bounce (per §6).

> **Hierarchy intentional:** Catat is the dominant, most-used action — solid, flex:1, only elevated bar button. Cek Dulu is medium-frequency — visible outline pill, no numbers shown until tapped. Insight is lowest-frequency — icon-only ghost button, no label needed once learned.

### 4.12 Status Bar / Header

```
SISA                                        ⋮
```

- Brand: 11px 700, letter-spacing `1.5px` (tracking lebar = brand feel)
- Settings icon: hamburger asimetris dengan dot indicator. 18×18px, stroke `--ink-secondary`.

---

## 5. Iconography

- **Library:** **HANYA `lucide-react`.** SVG inline gambar-tangan dilarang untuk icon UI baru — kalau lucide belum punya, cari alternatif terdekat atau tanya owner sebelum bikin custom SVG.
- **Style:** Stroke 1.5–2px, `strokeLinecap="round"`, `strokeLinejoin="round"` (rounded caps/joins, bukan sharp/miter).
- **Size standar:** 16px (inline), 18px (header), 20px (bottom action)
- **Warna:** Inherit `currentColor` — diatur via parent (signal-danger di notif, ink-primary di bottom action)
- **Filled icons:** Hampir tidak pakai. Outline-only philosophy.

---

## 6. Motion & Interaction

Belum dieksekusi di hi-fi statis, tapi committed:

| Pattern                         | Aksi                                      | Durasi         |
| ---------------------------------- | -------------------------------------------- | ---------------- |
| Tap card → detail               | Slide-up modal / page transition          | 200ms ease-out |
| Swipe kiri tagihan              | Reveal "tandai dibayar" action            | follow finger  |
| Notif card tap                  | Slide-up overview lewat tempo             | 200ms          |
| Goal reorder                    | Long-press + drag, dim row jadi `0.7`     | follow finger  |
| Hero amount update (input baru) | Number ticker 300ms, no easing dramatis   | 300ms linear   |
| Cek Dulu submit                 | Result fade-in di tempat (no page change) | 150ms          |

**Aturan motion:**

- Easing standar `ease-out` atau `linear`. **Jangan spring bounce.** Operator app, bukan playful app.
- **No confetti, no celebration animation.** Sudah disebut di PRD: anti fake gamification.
- **No skeleton shimmer animasi.** Pakai static placeholder atau langsung load (data lokal, harusnya instan).

---

## 7. Numerical Formatting

Karena ini app keuangan, **format angka adalah design**.

| Konteks                      | Format                            | Contoh                 |
| ------------------------------- | ------------------------------------ | ------------------------- |
| Amount besar (saldo, budget) | `Rp X.XXX.XXX` titik thousand-sep | `Rp 4.730.000`         |
| Amount kecil / inline        | `Rp Xrb` atau `Rp X,Xjt`          | `Rp 280rb`, `Rp 3.2jt` |
| Estimasi (tagihan variabel)  | Prefix `±`                        | `± Rp 280rb`           |
| Pengeluaran (keluar)         | Prefix `−` + warna danger         | `−Rp 18rb`             |
| Persentase                   | Angka + `%`, bold                 | `40%`, `81%`           |
| Goal progress                | `current / target` mono           | `Rp 3.2jt / Rp 15jt`   |

**Hard rules:**

- **Selalu pakai mono untuk angka di list/tabel** (kolom rapih).
- **Selalu pakai sans di hero amount** (size besar, lebih readable di sans-tight).
- **Selalu pakai `font-feature-settings: "tnum", "lnum"`** di semua angka — mau sans atau mono.
- **Jangan pakai koma sebagai thousand separator.** Indonesia pakai titik. Koma = desimal.
- **Singkat ke "rb" / "jt" saat angka muncul di tempat sempit** (list row, badge, sub-card).

---

## 8. Voice & Copy (Visual-Adjacent)

Design system ini ga lengkap tanpa nyebut voice — karena copy = bagian dari UI.

**Tone committed:**

| Sikap                          | Contoh                                                   |
| ---------------------------------- | ------------------------------------------------------------ |
| Sapaan "lo" / "gue"            | "aman ga gue beli ini?"                                  |
| Lowercase informal di label    | "budget hari ini", "saldo total"                         |
| Sentence case di body          | "Makanan ngambil 40% spending lo bulan ini."             |
| Capitalized untuk nama entitas | "Listrik", "Hutang ke Budi", "Dana darurat"              |
| Honest words, no euphemism     | "lewat 2 hari · belum dibayar" — bukan "perlu perhatian" |
| Hard numbers                   | "Rp 20rb/hari", bukan "sedikit lebih hemat"              |
| Status tegas                   | "ketat", "menabung", "menunggu darurat full"             |

**Anti-pattern (jangan dipakai):**

- ❌ "Great job!" / "Keep it up!" — no fake gamification
- ❌ "Anda" / "Kamu" formal — terlalu jauh
- ❌ "Coba kurangi sedikit" — vague, soft
- ❌ Emoji decorative (🎉 ⭐ 💰) — operator app, bukan reward app
- ❌ "Loading..." spinners panjang — data lokal, harusnya instan

---

## 9. Implementation Checklist

Sebelum push komponen baru, check:

- [ ] Pakai CSS variable, bukan hex hardcode?
- [ ] Angka pakai `tnum` + `lnum` feature settings?
- [ ] Hierarchy lewat ukuran/weight, bukan shadow?
- [ ] Border `--border-hair` 1px untuk semua card?
- [ ] Radius `var(--radius-card)` untuk card, `var(--radius-button)`/`var(--radius-input)` untuk button/input, `var(--radius-pill)` untuk badge/chip/progress, `var(--radius-squircle)` untuk icon box, `var(--radius-sheet)` untuk sheet?
- [ ] Module label uppercase + tracking 1.1px?
- [ ] Violet cuma di hal interactive?
- [ ] Signal cuma di hal yang memang signal (bukan dekoratif)?
- [ ] Copy lowercase informal, "lo/gue", hard numbers?
- [ ] No emoji decorative, no shimmer, no bounce easing?
- [ ] Icon dari `lucide-react` saja, stroke 1.5–2px rounded?
- [ ] Elevation lewat border, bukan `box-shadow` (`--shadow-card` tetap `none`)?

---

## Appendix: Token Sheet (Copy-Paste Ready)

> Nilai di bawah harus selalu sinkron dengan `src/app/tokens.css` (source of truth teknis) — cek file itu kalau ragu.

```css
:root {
  /* Surfaces */
  --canvas: #ffffff;
  --surface: #f7f6fa;
  --surface-2: #efeef5;
  --surface-3: #e6e4ee;

  /* Ink */
  --ink-primary: #141216;
  --ink-secondary: #5c5867;
  --ink-tertiary: #948fa0;

  /* Borders */
  --border-hair: #e4e2ec;
  --border-soft: #d8d5e3;

  /* Accent — Electric Violet */
  --accent: #7c5cff;
  --accent-hover: #6a47f5;
  --accent-dim: #6a47f5;
  --accent-bg: #f1eeff;
  --accent-br: #d9d0ff;
  --accent-text: #ffffff;

  /* Signal */
  --signal-danger: #c8362f;
  --signal-danger-bg: #fdecec;
  --signal-danger-br: #f5c9c6;
  --signal-caution: #a5720a;
  --signal-caution-bg: #fbf1dd;
  --signal-caution-br: #f0dca8;
  --signal-safe: #1a8a55;
  --signal-safe-bg: #e9f7ef;
  --signal-safe-br: #c9ebd8;

  /* Fonts */
  --font-sans: 'Manrope', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Shadow + Radius */
  --shadow-card: none;
  --radius-card: 18px;
  --radius-button: 12px;
  --radius-input: 12px;
  --radius-pill: 999px;
  --radius-squircle: 12px;
  --radius-sheet: 24px;
}

[data-theme='dark'] {
  --canvas: #0a0a0b;
  --surface: #131316;
  --surface-2: #1a1a1f;
  --surface-3: #242429;

  --ink-primary: #f3f2f6;
  --ink-secondary: #a8a5b3;
  --ink-tertiary: #6e6b7a;

  --border-hair: #232228;
  --border-soft: #302f38;

  --accent: #8b5cf6;
  --accent-hover: #9e75ff;
  --accent-dim: #7c4dde;
  --accent-bg: #1e1830;
  --accent-br: #3a2e5c;
  --accent-text: #ffffff;

  --signal-danger: #f0685f;
  --signal-danger-bg: #301414;
  --signal-danger-br: #4e211f;
  --signal-caution: #e8b23d;
  --signal-caution-bg: #2e2510;
  --signal-caution-br: #4a3c18;
  --signal-safe: #3ecb82;
  --signal-safe-bg: #122b1e;
  --signal-safe-br: #1f4430;

  --shadow-card: none;

  color-scheme: dark;
}
```

---

_Design system ini hidup. Setiap screen baru yang kepikir tapi ga keangkut di sini = candidate update._
