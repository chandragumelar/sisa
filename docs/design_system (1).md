# SISA — Design System

> **Versi:** 1.1 (sync dengan PRD v0.9 — 2026-05-22)
> **Mode:** Light only (untuk sekarang)
> **Paradigma visual:** _Cool Slate + Cobalt_ — Dashboard operator vibe, sans-only, no editorial, anti-pastel.
> **Prinsip turunan dari PRD:** Opinionated, honest, hard numbers, no sugarcoating, no fake gamification.

---

## 0. Philosophy

SISA adalah **decision support tool**, bukan tracker yang cantik. Karena itu visual-nya harus terasa seperti **alat** — bukan seperti app lifestyle, bukan seperti dompet digital warna-warni, bukan editorial magazine.

Tiga prinsip yang nge-drive semua keputusan di bawah:

1. **Hierarchy dari kontras canvas vs card, bukan dari shadow.** Canvas bertone, card putih bersih + border tipis = card "ngangkat" tanpa drop-shadow. Trik ini dipinjem dari GitHub/Linear.
2. **Cool tinted light, bukan putih polos.** Canvas `#EEF1F5` punya tone tapi tetap terang — cool tone = anti-kusam (kebalikan cream warm yang bikin redup).
3. **Pembagian warna tegas, ga ada overlap fungsi.** Cobalt = bisa ditekan/brand. Merah = bahaya. Amber = ketat. Hijau = aman. Setiap hue cuma punya satu pekerjaan.

---

## 1. Color Tokens

### 1.1 Surfaces

| Token         | Hex       | Pakai untuk                                  |
| ------------- | --------- | -------------------------------------------- |
| `--canvas`    | `#EEF1F5` | Background utama screen (cool slate tinted)  |
| `--surface`   | `#FFFFFF` | Card, modul, container yang harus "ngangkat" |
| `--surface-2` | `#E4E8EE` | Track progress bar, empty state bar          |

### 1.2 Ink (text)

| Token             | Hex       | Pakai untuk                                |
| ----------------- | --------- | ------------------------------------------ |
| `--ink-primary`   | `#11141A` | Heading, amount utama, nama item penting   |
| `--ink-secondary` | `#565C66` | Body text, label deskriptif, nama wallet   |
| `--ink-tertiary`  | `#939AA5` | Meta-info, helper text, footer, swipe hint |

### 1.3 Borders

| Token           | Hex       | Pakai untuk                                   |
| --------------- | --------- | --------------------------------------------- |
| `--border-hair` | `#E1E5EB` | Border default card, divider antar row        |
| `--border-soft` | `#EAEDF2` | Border subtle (jarang dipakai, untuk variasi) |

### 1.4 Accent — Cobalt

Cobalt sengaja occupy hue yang ga disentuh signal apapun (merah/amber/hijau). Ini bahasa **interactive / brand**.

| Token            | Hex       | Pakai untuk                                     |
| ---------------- | --------- | ----------------------------------------------- |
| `--accent`       | `#1F4FE0` | CTA utama (Cek Dulu), progress bar budget, link |
| `--accent-hover` | `#1A44C2` | Hover/pressed state                             |
| `--accent-bg`    | `#EDF1FE` | Background subtle untuk info chip / hint        |
| `--accent-br`    | `#CFD9F9` | Border accent, underline decoration link        |

### 1.5 Signal — Saturated, Anti-Pastel

Signal harus **kelihatan**. Ga ada pastel. User butuh tau langsung "ini bahaya" vs "ini aman" dalam 0.3 detik.

| Token                | Hex       | Pakai untuk                                          |
| -------------------- | --------- | ---------------------------------------------------- |
| `--signal-danger`    | `#D11F1F` | Lewat tempo, jatuh tempo hari ini, pengeluaran (−Rp) |
| `--signal-danger-bg` | `#FCEEEE` | Background notif urgent                              |
| `--signal-danger-br` | `#F4D4D4` | Border notif urgent                                  |
| `--signal-caution`   | `#B5680A` | Status "ketat", prediksi mepet                       |
| `--signal-safe`      | `#1B7A38` | Income, status aman, surplus                         |

### 1.6 Aturan Warna (Hard Rules)

- **Jangan pakai cobalt untuk signal.** Cobalt cuma untuk hal yang bisa ditekan.
- **Jangan pakai signal untuk dekorasi.** Merah cuma keluar kalau memang ada masalah.
- **Jangan campur signal di satu komponen.** Satu card = satu mood. Notif merah ya merah semua, bukan merah + amber.
- **Hijau jarang muncul.** Hijau itu hadiah, bukan default. Default-nya neutral ink.

---

## 2. Typography

### 2.1 Font Families

```css
--font-sans: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
```

- **Inter Tight** — untuk semua label, heading, body, deskripsi. Sans-only kebijakan.
- **JetBrains Mono** — **khusus angka tabular** (saldo wallet, amount tagihan, amount goal). Tujuannya: angka rapih kolom-kolom, gampang dibanding.

Selalu nyalain feature settings:

```css
font-feature-settings: 'tnum', 'lnum'; /* untuk semua angka */
font-feature-settings: 'cv11'; /* body global, alternatif huruf 'l' */
```

### 2.2 Type Scale

| Role               | Size   | Weight     | Letter-spacing  | Contoh dari wireframe             |
| ------------------ | ------ | ---------- | --------------- | --------------------------------- |
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
| **Module label**   | 10px   | 500        | 0.8px UPPERCASE | "budget hari ini", "saldo total"  |
| **Goal badge**     | 8.5px  | 600        | 0.6px UPPERCASE | "DANA DARURAT", "IMPIAN #1"       |
| **Swipe hint**     | 9.5px  | 400 italic | normal          | "geser kiri untuk tandai dibayar" |

### 2.3 Aturan Tipografi

- **Module label selalu UPPERCASE + tracking 0.8px.** Konsistensi ini yang bikin section break kebaca tanpa garis.
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
| --------------------------------------- | ---------------------------------------- |
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
- Border-radius `10px`, padding `11px 12px`
- Icon kiri `--signal-danger`, body `--ink-primary`, **bold-fragment** `--signal-danger`, chevron `--signal-danger`
- **Hanya muncul kalau ada hal urgent.** Kalau ga ada, hilang total (jangan diganti placeholder "semua aman ✓" — itu kebalikan dari prinsip honest).

### 4.2 Hero Amount Block (Saldo / Budget)

Pattern: `[module-label]` → `[hero-amount 38px atau big-amount 30px]` → `[hero-sub atau bar]`.

- Hero amount selalu **Inter Tight semibold dengan tnum + lnum** (figure tabular & lining).
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

- Container: `--surface`, border `--border-hair`, radius `10px`, padding `2px 12px`
- Row: padding `8px 0`, border-bottom `--border-hair` (kecuali last)
- Nama: 12.5px, `--ink-secondary`, regular
- Amount: **mono**, 12px, 500, `--ink-primary`, `tnum`

### 4.4 Progress Bar (Budget Hari Ini)

**Bar Tebal (hero, untuk Budget Hari Ini):**

- Height `22px`, background `--surface-2`, radius `6px`
- Fill: `--accent` (cobalt), radius `6px 0 0 6px` (sudut kanan flat — bar belum penuh)
- Footer 2-kolom: kiri "terpakai", kanan "sisa hari ini" (`--ink-primary` bold)

**Bar Tipis (Goal):**

- Height `3px`, background `--border-hair`, radius `2px`
- Fill: `--ink-primary` (bukan cobalt — goal pakai neutral karena cobalt sudah "milik" budget)
- Marker target: triangle ke bawah `--ink-tertiary` di ujung kanan

> **Kenapa beda warna fill?** Cobalt = "duit lo yang bisa ditekan/dipakai sekarang" (budget aktif). Hitam = "progress menabung" (goal jangka panjang). Pembedaan semantik, bukan estetik.

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
- Card: `--surface`, border `--border-hair`, radius `10px`, padding `11px 12px`
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
| -------------- | ---------------------------------------------------------- |
| **Tercapai**   | Bar penuh + icon ✓ + status "tercapai"                     |
| **Lagi diisi** | Bar parsial + persen + warna hidup (ink-primary fill)      |
| **Antri**      | Tidak ada bar sama sekali + status "nunggu giliran" italic |

**Pembeda aktif vs antri harus tegas** — bukan opacity halus. Goal aktif nyala (ada bar + persen), goal antri mati (tanpa bar). Drag goal ke atas → dia nyala, yang lama mati.

- Goal badge: 8.5px uppercase, padding `2px 6px`, radius `3px`, weight 600
  - **Semua badge setara secara visual** — bg `--ink-primary`, text `--canvas`. Tidak ada badge spesial untuk "Dana Darurat". Dana Darurat hanya label, bukan jabatan.
- Status "lagi diisi →" (aktif) atau "nunggu giliran" (italic `--ink-tertiary`, antri)
- **Bar fill hanya muncul di goal aktif** — goal antri tidak punya bar
- Bar: height `3px`, background `--border-hair`, fill `--ink-primary` (bukan cobalt). Marker target: segitiga kecil di ujung kanan.
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

### 4.11 Bottom Action Bar (Fixed)

```
┌────┐  ┌──────────────────────┐  ┌────┐
│ +  │  │     Cek Dulu         │  │ ⋮  │
│Catat│  │ aman ga gue beli ini?│  │Andai│
└────┘  └──────────────────────┘  └────┘
```

- Position absolute, `bottom: 12px`, `left/right: 12px`, gap `8px`
- **Cek Dulu (CTA utama):** flex 1, bg `--accent`, text white, radius `12px`
  - Label 17px 600, sub `#C5D0F7` 10px (subtle blue di atas cobalt — bukan putih buram)
- **Catat & Andai (CTA sekunder):** width `64px` fixed, bg `--surface`, text `--ink-primary`, radius `12px`
  - Icon stroke 1.5px, label 10px 500

> **Hierarchy intentional:** Cek Dulu paling lebar + paling warna karena ini **flagship action** ("aman ga gue beli ini?"). Catat di kiri karena urutan natural (catat dulu → cek → andai). Andai di kanan karena ini **explorasi**, bukan keputusan utama.

### 4.12 Status Bar / Header

```
SISA                                        ⋮
```

- Brand: 11px 700, letter-spacing `1.5px` (tracking lebar = brand feel)
- Settings icon: hamburger asimetris dengan dot indicator. 18×18px, stroke `--ink-secondary`.

---

## 5. Iconography

- **Style:** Line icons, stroke 1.5–1.8px, `stroke-linecap: round`, `stroke-linejoin: round`
- **Size standar:** 16px (inline), 18px (header), 20px (bottom action)
- **Warna:** Inherit `currentColor` — diatur via parent (signal-danger di notif, ink-primary di bottom action)
- **Filled icons:** Hampir tidak pakai. Outline-only philosophy.
- **Source:** Bisa pakai Feather, Lucide, atau custom — yang penting **konsisten stroke-width**.

---

## 6. Motion & Interaction

Belum dieksekusi di hi-fi statis, tapi committed:

| Pattern                         | Aksi                                      | Durasi         |
| ------------------------------- | ----------------------------------------- | -------------- |
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
| ---------------------------- | --------------------------------- | ---------------------- |
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
| ------------------------------ | -------------------------------------------------------- |
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

## 9. Tier Differentiation (Visual)

Dari PRD: ada **Basic** dan **Pro**. Design system ini di-spec untuk Basic. Aturan visual kalau nantinya ada Pro:

- **Jangan tambah warna baru.** Pro tetap di palette yang sama.
- **Differentiation lewat density, bukan kemewahan.** Pro nampilin lebih banyak module / insight, tapi visual language identik.
- **Badge "Pro"** kalau perlu: pakai `--ink-primary` (hitam) + text `--canvas`, radius `3px`, 8.5px uppercase — **mirip badge goal**, konsisten.

---

## 10. Implementation Checklist

Sebelum push komponen baru, check:

- [ ] Pakai CSS variable, bukan hex hardcode?
- [ ] Angka pakai `tnum` + `lnum` feature settings?
- [ ] Hierarchy lewat ukuran/weight, bukan shadow?
- [ ] Border `--border-hair` 1px untuk semua card?
- [ ] Radius `10px` untuk card, `12px` untuk button besar, `3px` untuk badge?
- [ ] Module label uppercase + tracking 0.8px?
- [ ] Cobalt cuma di hal interactive?
- [ ] Signal cuma di hal yang memang signal (bukan dekoratif)?
- [ ] Copy lowercase informal, "lo/gue", hard numbers?
- [ ] No emoji decorative, no shimmer, no bounce easing?

---

## Appendix: Token Sheet (Copy-Paste Ready)

```css
:root {
  /* Surfaces */
  --canvas: #eef1f5;
  --surface: #ffffff;
  --surface-2: #e4e8ee;

  /* Ink */
  --ink-primary: #11141a;
  --ink-secondary: #565c66;
  --ink-tertiary: #939aa5;

  /* Borders */
  --border-hair: #e1e5eb;
  --border-soft: #eaedf2;

  /* Accent — Cobalt */
  --accent: #1f4fe0;
  --accent-hover: #1a44c2;
  --accent-bg: #edf1fe;
  --accent-br: #cfd9f9;

  /* Signal */
  --signal-danger: #d11f1f;
  --signal-danger-bg: #fceeee;
  --signal-danger-br: #f4d4d4;
  --signal-caution: #b5680a;
  --signal-safe: #1b7a38;

  /* Fonts */
  --font-sans: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

---

_Design system ini hidup. Setiap screen baru yang kepikir tapi ga keangkut di sini = candidate update._
