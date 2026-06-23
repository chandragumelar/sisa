# SISA — PM User Stories

> Dibuat dari codebase yang live (bukan PRD, bukan docs). Fokus: behavior dari perspektif user, bukan teknis.
> Bahasa produk: Indonesia (default). Copy ditulis verbatim dari codebase.

---

## Daftar Isi

1. [Onboarding](#1-onboarding)
2. [Home Page](#2-home-page)
   - 2a. CekDulu Card (adaptive, 3 state)
   - 2b. Saldo Module ("Anggaran Operasional")
   - 2c. Monthly Module ("Bulan Ini")
   - 2d. Tagihan Module
   - 2e. Goal Module
   - 2f. Berbagi & Keamanan Card
   - 2g. Backup Card (kondisional)
   - 2h. Banner Transisi Periode (H-2, kondisional)
3. [Bottom Action Bar](#3-bottom-action-bar)
4. [Catat — QuickLog Sheet](#4-catat--quicklog-sheet)
5. [Cek Dulu — Full Page](#5-cek-dulu--full-page)
6. [Andai — Skenario Hipotetis](#6-andai--skenario-hipotetis)
7. [Riwayat — History Sheet](#7-riwayat--history-sheet)
8. [Profil Sheets (dari Home)](#8-profil-sheets-dari-home)
   - 8a. Dompet
   - 8b. Tagihan
   - 8c. Goal Tabungan
9. [Settings / Setelan](#9-settings--setelan)
10. [Berbagi & Keamanan — Halaman Detail](#10-berbagi--keamanan--halaman-detail)
    - 10a. Ajak Pasangan (/ajak-pasangan)
    - 10b. Gabung dengan Kode (/gabung-kode)
    - 10c. Hub Berbagi & Keamanan (/berbagi-keamanan)
    - 10d. Pulihkan Profil (/pulihkan)

---

## 1. Onboarding

Onboarding terdiri dari beberapa step berurutan. Semua data dikumpulkan di memori sementara, tidak tersimpan ke database sampai user menyelesaikan step terakhir.

### Step 0 — Install Guide (Opsional)

**Copy heading:** "Pasang di layar utama biar kayak app beneran"

User disambut panduan cara install PWA sebelum lanjut. Ada dua tab: iPhone dan Android.

**iPhone:**

1. Tap ikon Bagikan — tombol kotak dengan panah ke atas, di tengah bawah layar
2. Scroll ke bawah, pilih "Tambahkan ke Layar Utama"
3. Tap Tambah di pojok kanan atas

- Hint: "Gak ketemu opsinya? Coba buka di Safari ya."

**Android:**

1. Tap ⋮ — tiga titik di pojok kanan atas
2. Pilih "Tambahkan ke layar utama" atau "Instal aplikasi"
3. Tap Tambah atau Instal

CTA: **"Sudah dipasang"** | Link: **"Nanti dulu ›"** (skip)

---

### Step 1 — Aktivasi Lisensi

**Copy heading:** "Tempel kode lisensi"
**Copy sub:** "Kode dikirim ke email lo abis beli."
**Placeholder input:** "Paste kode dari email lo"

User memasukkan license key yang diterima via email setelah pembelian.

**Alur:**

- User menempel/mengetik kode → tap **"Aktivasi"**
- Selama verifikasi: tombol berubah jadi "Memverifikasi…"
- Jika berhasil: lanjut ke step berikutnya
- Jika gagal — ada 3 jenis error:
  - Key expired: `"kode sudah expired — perpanjang atau beli baru ›"` (link ke halaman pembelian)
  - Key invalid: `"kode ga valid, cek email lo lagi"`
  - Error lain: `"terjadi kesalahan, coba lagi"`

Link di bawah: **"Belum punya kode? Beli di sini ›"**

---

### Step 2 — Pengenalan Produk

**Copy heading:** "Data lo, ga kemana-mana."
**Copy body 1:** "Catat duit, andai skenario, cek sebelum beli."
**Copy body 2:** "Ga ada akun. Ga ada server. Kami ga tau lo siapa."

Layar informasi. CTA: **"Lanjut"** | Link: **"Lewati ›"** (skip)

---

### Step 3 — Pilih Tipe Pemasukan

**Copy heading:** "Tipe pemasukan lo"
**Copy sub:** "SISA pakai ini untuk ngitung jatah harian lo dan prediksi saldo saat gajian. Cuma tersimpan di HP lo."

User memilih satu dari tiga opsi:

| Pilihan     | Label                     | Sub                                  |
| ----------- | ------------------------- | ------------------------------------ |
| Gaji tetap  | "Gaji tetap"              | "Masuk tanggal yang sama tiap bulan" |
| Tidak tetap | "Freelance / tidak tetap" | "Nggak tentu tanggal dan jumlahnya"  |
| Campuran    | "Campuran"                | "Ada gaji, ada juga pemasukan lain"  |

CTA: **"Lanjut"**

---

### Step 4 — Detail Pemasukan (kondisional berdasarkan step 3)

Heading dan field berbeda berdasarkan tipe pemasukan:

#### Jika "Gaji tetap":

- **Heading:** "Tanggal gajian"
- **Sub:** "SISA hitung mundur dari tanggal ini — biar jatah harian lo presisi, bukan tebak-tebakan."
- **Field 1 — Frekuensi gajian:** dropdown Bulanan / Mingguan / 2 Mingguan
- **Field 2 — Tanggal gajian** (jika Bulanan): pilih 1–31, label "Tanggal {d}"
- **Field 2 — Tanggal patokan siklus** (jika Mingguan/2 Mingguan): date picker; hint "Pilih salah satu tanggal gajian kamu — jadwal dihitung dari sini"
- **Field 3 — Berapa pemasukan lo per periode?** (opsional): input nominal; hint "Disimpan lokal di device lo aja, bukan ke server."

#### Jika "Campuran":

- **Heading:** "Detail pemasukan"
- **Sub:** "Kalau ada gaji tetap, isi tanggalnya. Pemasukan lain bisa dicatat manual nanti."
- **Field 1–2:** sama dengan "Gaji tetap" (frekuensi + tanggal gajian / anchor)
- **Field 3 — Minimum saldo aman** (opsional): input nominal
- **Field 4 — Berapa gaji tetap lo per periode?** (opsional): input nominal; hint "Disimpan lokal di device lo aja, bukan ke server."
- **Field 5 — Rata-rata pemasukan**: input nominal + dropdown "Per Bulanan/Mingguan/2 Mingguan"; hint "Estimasi aja — SISA tetap jaga pakai batas saldo aman biar nggak nabrak."

#### Jika "Freelance / tidak tetap":

- **Heading:** "Batas aman saldo"
- **Sub:** "Karena nggak ada tanggal gajian pasti, SISA pakai ini sebagai patokan aman. Lo yang tentuin angkanya."
- **Field 1 — Minimum saldo aman** (wajib): input nominal; hint "SISA akan kasih peringatan kalau saldo lo di bawah angka ini."
- **Field 2 — Rata-rata pemasukan**: input nominal + dropdown "Per Bulanan/Mingguan/2 Mingguan"; hint "Estimasi aja — SISA tetap jaga pakai batas saldo aman biar nggak nabrak."
- Note: untuk freelance, payday = hari terakhir bulan ini.

CTA: **"Lanjut"**

---

### Step 4.5 — Konfirmasi Gajian Terakhir (tetap/campuran saja)

Step ini muncul **setelah Step 4** hanya untuk tipe "Gaji tetap" dan "Campuran". Freelance langsung lanjut ke Step 5.

**Copy heading:** "Kapan terakhir lo nerima gaji?"
**Copy sub:** "Dari sini SISA bisa hitung jatah harian yang akurat."

3 opsi pilihan (radio buttons):

| Opsi                 | Label                              | Sub                                             |
| -------------------- | ---------------------------------- | ----------------------------------------------- |
| **a — preset**       | "Sekitar {tanggal}"                | (tanggal dihitung otomatis = gajian sebelumnya) |
| **b — picker**       | "Pilih tanggal lain"               | (muncul date input di bawah setelah dipilih)    |
| **c — pertama kali** | "Belum pernah, ini gajian pertama" | "SISA pakai saldo sekarang sebagai patokan"     |

CTA: **"Lanjut"** (disabled sampai salah satu opsi dipilih; untuk opsi b, juga butuh tanggal terisi)

---

### Step 5 — Pilih Mata Uang Utama

**Copy heading:** "Mata uang utama"
**Copy sub:** "Semua nominal akan ditampilkan dalam mata uang ini."
**Placeholder:** "Pilih mata uang…"

User memilih dari daftar mata uang. Ada search box, dua tab: Populer dan Semua. Jika tidak ditemukan: "Mata uang tidak ditemukan".

CTA: **"Lanjut"**

---

### Step 6 — Setup Dompet

**Copy heading:** "Dompet lo"
**Copy sub:** "Tambah rekening, dompet tunai, atau e-wallet. Saldo bisa diisi nanti."

User menambah minimal satu dompet:

- **Field nama:** Placeholder untuk dompet pertama: "Nama dompet (cth: BCA, GoPay)", untuk dompet berikutnya: "Nama dompet"
- **Field saldo:** "Saldo sekarang (opsional)" — bisa dikosongkan

User bisa tambah lebih dari satu dompet dengan klik **"+ Tambah dompet lain"**.
Setiap dompet bisa dihapus (tombol hapus per row).

CTA: **"Lanjut"**

---

### Step 7 — Mata Uang Kedua (Opsional)

**Copy heading:** "Mata uang kedua"
**Copy sub:** "Lo bisa pantau dua mata uang sekaligus. Bisa diatur ulang nanti."
**Placeholder:** "Pilih mata uang kedua…"

User bisa pilih mata uang kedua untuk pantau dua currency sekaligus.

CTA: **"+ Tambah"** | Link: **"Nanti aja"** (skip)

---

### Selesai Onboarding

Semua data (tipe income, tanggal gajian, mata uang, dompet) disimpan sekaligus ke database. User langsung masuk ke Home.

---

## 2. Home Page

Home adalah satu halaman scroll vertikal. Di **header** ada: wordmark "sisa", badge `{n} lewat tempo` (tap → UrgentTagihanSheet), toggle currency (jika dual currency), ikon settings.

Komponen diurutkan dari atas ke bawah:

1. (kondisional) Backup Card — muncul di atas segalanya jika sudah lama tidak backup
2. (kondisional) Banner Transisi Periode — H-2 sebelum gajian
3. CekDulu Card
4. Saldo Module ("Anggaran Operasional")
5. Monthly Module ("Bulan Ini")
6. Tagihan Module
7. Goal Module
8. Berbagi & Keamanan Card

---

### 2a. CekDulu Card (Adaptive, 3 State)

Card ini berubah bentuk berdasarkan kelengkapan data user.

**State 0 — Kosong (tidak ada wallet & tidak ada tagihan)**

- Label: "Cek Dulu"
- Heading: "Yuk, kenali kondisi keuanganmu"
- Body: "Isi data tagihan dan wallet dulu — nanti card ini bisa nunjukin kondisi keuanganmu dan simulasi andai-andai."
- CTA: **"Tambah tagihan pertama"** → buka sheet Tambah Tagihan

**State 1 — Sebagian (ada wallet ATAU ada tagihan, tapi belum keduanya)**

- Badge: **ESTIMASI**
- Section label: "KELENGKAPAN DATA"
- Checklist 2 baris:
  - **Tagihan** — jika sudah diisi: "✓ {n} tagihan ditambahkan" | jika belum: "Perlu diisi →" (buka tambah tagihan)
  - **Tabungan** (opsional) — jika sudah nabung: "opsional" | jika belum: "Catat tabungan →" (buka QuickLog mode nabung)
- Disclaimer: "Estimasi belum akurat — lengkapi data {item yang belum diisi}"
- 2 baris estimasi:
  - "Sisa gaji estimasi" → angka sisa saat ini
  - "Tagihan tetap" → total unpaid tagihan
- Input harga disable dengan peringatan: "Aktif setelah {item} diisi"
- CTA: **"Tambah {item yang belum} sekarang"**

**State 2 — Penuh (ada wallet DAN ada tagihan)**

- Badge: **✓ AKURAT**
- Heading 2 baris: "Aman beli" / "sekarang?"
- Input harga (numeric, currency symbol di kiri, placeholder: "Berapa harganya?")
- Tombol: **"Cek sekarang"** → navigasi ke /cek-dulu dengan harga yang diisi
- Enter key juga submit
- Link bawah: "atau simulasi dengan Andai →" → navigasi ke /andai

---

### 2b. Saldo Module ("Anggaran Operasional")

**Label card:** "Anggaran Operasional"

Module ini tampil dalam 3 mode berdasarkan kondisi keuangan. Header selalu ada: label "Anggaran Operasional" di kiri, dan di kanan: pill countdown `{n} hari ke gajian` (normal/hari-pertama), badge `MODE BERTAHAN` (bertahan), atau badge `Hari terakhir` (hari-terakhir).

---

#### Mode: Normal (termasuk hari-pertama)

**Hero:**

- Label: "Jatah Harian" + ikon ⓘ (tooltip)
- Badge kondisi (kondisional, freelance/mix yang mendekati/melewati batas minimum saldo):
  - Mendekati: "● Mendekati batas aman lo — pertimbangkan kurangi pengeluaran sekarang."
  - Di bawah: "● Anggaran lo sudah di bawah batas aman — kurangi pengeluaran segera."
- Angka hero: `{jatahHarian}/hari`
- Sub: `{sisaPeriode} · {n} hari ke gajian`

**Expand rincian** — tombol `∨ kok bisa segini? ∨` (tap toggle):

- "Pemasukan periode" → amount
- "− Tagihan belum bayar" → amount (hanya jika ada)
- "− Target nabung" → amount (hanya jika ada)
- "= Anggaran Operasional" + ikon ⓘ (tooltip) → amount (bold)
- meta: "+ {n} hari periode"
- "= Jatah Harian" → `{amount}/hari` (bold)
- footer: "Udah jalan {x} hari → sisa {amount}"

**Tooltip "Jatah Harian":** "Anggaran Operasional dibagi jumlah hari periode — ini yang boleh lo pakai per hari. Fixed di awal periode, bukan berubah tiap hari."

**Tooltip "Anggaran Operasional":** "Pemasukan periode dikurangi tagihan belum bayar dan target nabung. Ini uang yang 'bebas' untuk operasional harian."

---

#### Mode: Bertahan (pemasukan < tagihan + nabung)

- Badge merah: "MODE BERTAHAN"
- Pesan: "Uangmu sudah ter-booking habis sampai gajian — ini yang harus lo tutup:"
- Kotak shortfall:
  - Label kiri: "KEKURANGAN"
  - Label kanan: "Aman mulai" + tanggal gajian berikutnya
  - Angka besar: nominal shortfall
- Note: "Tagihan + target nabung melebihi pemasukan periode ini."

---

#### Mode: Hari Terakhir (daysUntilPayday = 0)

- Badge: "Hari terakhir"
- Sub-label: "Sisa hari ini"
- Angka besar: sisaPeriode
- Note: "Ini hari terakhir periode. Besok periode baru dimulai dan jatah harian dihitung ulang."

---

#### Layer 3 — Konteks (selalu tampil di bawah semua mode)

**Baris "Total Saldo"** — tap untuk expand/collapse daftar dompet:

- Setiap dompet: dot berwarna + nama + saldo
- Tap dompet → buka WalletEditSheet

**Baris "Uang Mengendap"** — ikon 🔒 + label "Uang Mengendap" + sub "di luar periode ini" + nominal (muted):

- Uang Mengendap = Total Saldo − Anggaran Operasional − Tagihan belum lunas − Tabungan

**Link "lihat riwayat →"** → buka HistorySheet

---

**Jika tidak ada dompet:** tombol **"+ Tambah dompet"** muncul di bawah card.

---

### 2c. Monthly Module ("Bulan Ini")

Card ringkasan keuangan bulanan.

**Header:** "Bulan Ini" + label bulan berjalan (misal "Jun 2026")

**3 baris data:**
| Label | Warna | Icon |
|-------|-------|------|
| Pemasukan | hijau (--signal-safe) | ↗ chart up |
| Pengeluaran | merah (--signal-danger) | ↘ chart down |
| Tabungan | aksen (--accent) | ↑ simpan |

Semua angka filtered per currency aktif.

---

### 2d. Tagihan Module

**Label section:** "tagihan bulan ini"

Menampilkan daftar tagihan aktif yang belum lunas, diurutkan berdasarkan urgensi:

1. **Lewat tempo** (displayed sebagai blok merah alert di atas)
2. Jatuh tempo hari ini
3. Jatuh tempo dalam 7 hari
4. Normal

**Jika tidak ada tagihan:**

- Copy: "Catat tagihan rutin — listrik, internet, streaming — biar budget lo akurat dan gak kecolongan."
- Tombol: **"+ Tambah tagihan"** → buka sheet Tambah Tagihan

**Tampilan tagihan lewat tempo (blok khusus):**

- Ikon segitiga bahaya (merah)
- Nama tagihan
- "Lewat tempo — segera bayar"
- Nominal tagihan
- Tombol: **"Bayar"** → buka Mark Paid sheet

**Tampilan tagihan regular (baris):**

- Nama tagihan (kiri atas)
- "jatuh tempo {tanggal formatted, e.g. '15 Jun'}" (kiri bawah)
- Nominal (kanan)
- Tap baris → buka Tagihan Detail sheet

**Maksimal 4 tagihan non-lewat-tempo yang terlihat.** Jika ada lebih: "**+ {n} tagihan lagi**" (collapse/expand)

**Total zone:** "Total — {jumlah semua nominal aktif}"

**Swipe kiri** di baris tagihan → reveal tombol "tandai dibayar" (gesture hint: "geser kiri untuk tandai dibayar")

**Tombol di bawah:** **"+ Tambah tagihan"**

---

### 2e. Goal Module

**Label section:** "mimpi lo"

Menampilkan daftar tabungan goals user.

**Jika tidak ada goal:**

- Empty heading: "Tulis mimpi lo di sini"
- Copy: "misal: laptop 20jt, liburan Bali, dana darurat — supaya lo tau lagi nabung buat apa."
- Hint: "Lalu menabung di tab Menabung — mimpi paling atas otomatis terisi duluan."
- Tombol: **"+ Catat mimpi baru"** → buka form tambah goal

**Waterfall sistem:** Dana tabungan diisi ke goal secara berurutan dari atas ke bawah. Goal paling atas = prioritas utama. Goal berikutnya dapat sisa setelah goal di atasnya terpenuhi.

Formula alokasi per goal:

```
saved[i] = min(remaining_savings, goal[i].target)
remaining_savings -= saved[i]

Status:
- "tercapai" (reached) jika saved >= target
- "aktif / sedang ditabung" jika belum tercapai dan belum ada yang aktif sebelumnya
- "antri / nunggu giliran" untuk semua goal berikutnya
```

**Tampilan per goal:**

- Progress bar visual (persentase)
- Nama goal
- Status badge: "menabung →" / "tercapai ✓" / "nunggu giliran"
- Label detail: "prioritas" (goal aktif) / "antrian" + nomor urut

**Interaksi:**

- Tap goal → buka detail/edit
- Tahan + drag → reorder goal (urutan menentukan prioritas waterfall)
- Hint saat ada goal aktif: "nabung lagi: {nama goal aktif} · tahan & geser untuk ganti urutan"

**Toast setelah tambah goal baru:**

- Title: "Mimpi tercatat!"
- CTA: **"Mulai menabung sekarang"** → buka QuickLog mode nabung
- Dismiss: "Nanti saja"

**Tombol di bawah:** **"+ Catat mimpi baru"**

---

### 2f. Berbagi & Keamanan Card

Card dengan dua baris aksi.

**Jika status solo:** Banner dismissable muncul di atas card:

- Ikon shield kuning
- Title: "Amankan data kamu"
- Desc: "Hubungkan HP-mu agar data tidak hilang jika ganti perangkat."
- Tombol: **"Siapkan Sekarang"** → /ajak-pasangan
- Tombol close (×) → dismiss banner 7 hari

**Jika status connected:** Badge di dalam card:

- Dot hijau + "Profil Bersama: {nama profil atau nama pasangan}"

**Label card:** "BERBAGI & KEAMANAN"

**Baris 1 — Ajak Pasangan:**

- Ikon users
- Title: "Ajak Pasangan"
- Sub: "Kelola keuangan bersama"
- Tap → /ajak-pasangan

**Baris 2 — Amankan Data:**

- Ikon shield
- Title: "Amankan Data"
- Sub (solo): "Hubungkan nomor HP-mu"
- Sub (connected): "Data terlindungi • terhubung"
- Tap → /berbagi-keamanan

---

### 2g. Backup Card

Card kondisional — muncul di **atas semua card** berdasarkan waktu terakhir backup.

**Jika sudah lama tidak backup:**

- Title: "Sudah lama gak backup!"

**Jika belum pernah backup:**

- Title: "Backup data lo"

Copy: "Data SISA tersimpan di HP ini. Kalau ganti HP tanpa backup, data hilang."

Tombol: **"Cara backup ›"** → buka panduan backup (bottom sheet)

**Sheet panduan backup:**

- Title: "Cara backup data SISA"
- Instruksi step-by-step (arahkan ke Settings → export backup)
- CTA: **"Oke, ngerti"**

---

### 2h. Banner Transisi Periode (H-2)

Banner non-blocking — muncul **H-2 sebelum gajian** (daysUntilPayday ≤ 2), hanya jika `lastPaydayConfirmed < nextPayday`. Tidak ada tombol dismiss. Berlaku untuk income type tetap dan mix (freelance tidak tampil).

**Layout banner:**

- Heading: "Gajian bentar lagi?"
- Sub: "Konfirmasi saat gaji masuk biar jatah harian periode baru bisa dihitung."
- Tombol: **"Udah gajian"** → buka BottomSheet konfirmasi

**BottomSheet konfirmasi:**

- Title: "Mulai periode baru?"
- Body: "Gaji bulan ini dianggap sudah masuk. Jatah harian dihitung ulang dari awal."
- Field "Gajian tanggal": date input (default: hari ini)
- Field "Nominal gaji": nominal input (default: fixedIncome jika ada)
- Tombol: **"Ya, mulai periode baru"** → update lastPaydayConfirmed + fixedIncome, reload home
- Tombol: **"Batal"** → tutup sheet

Setelah konfirmasi, banner hilang dan jatah harian dihitung ulang.

---

## 3. Bottom Action Bar

Bar fixed di bawah layar, tiga tombol:

**Kiri — Catat:**

- Icon + label "Catat"
- Sub tidak ada (aria: "Catat transaksi")
- Tap → buka QuickLog Sheet (mode keluar by default)
- Label full: "Catat pengeluaran / pemasukan"

**Tengah — Cek Dulu:**

- Icon + label "Cek Dulu"
- Sub: "aman ga gue beli ini?"
- Tap → navigasi ke /cek-dulu

**Kanan — Andai:**

- Icon + label "Andai"
- Tap → navigasi ke /andai

---

## 4. Catat — QuickLog Sheet

Sheet yang muncul dari bawah untuk mencatat transaksi baru atau mengedit yang sudah ada.

**3 Mode (tab):**

- **keluar** → pengeluaran
- **masuk** → pemasukan
- **nabung** → tabungan

**Field utama:**

- Input nominal (numeric keyboard, currency symbol di kiri, format otomatis dengan separator ribuan)
- Mode selector tabs

**Field tambahan (selalu tampil):**

- Pilih dompet (dropdown dari daftar wallet user)
- Pilih tanggal: tombol "Hari ini" / "Kemarin" / date picker custom (label: "Pilih tanggal")
- "**+ tambah catatan**" → expand kolom catatan (placeholder: "Catatan...")

**Mode nabung — field khusus:**

- Toggle "dari tabungan" (keluar dari saldo tabungan yang sudah disisihkan, bukan nabung baru)
- Jika amount melebihi total tabungan saat toggle aktif: warning "Tabungan kamu cuma {amount} — mau pakai semua tabungan?"

**Submit:**

- Edit mode: **"Simpan"**
- New mode: **"Catat"**
- Selama submit: "Menyimpan..."

**Setelah berhasil catat:**

- Toast muncul sesuai mode:
  - keluar: "{nama label} — {amount}" + opsi **"Ubah"**
  - masuk: "Pemasukan dicatat" + opsi **"Ubah"**
  - nabung: "Nabung dicatat" + opsi **"Ubah"**
  - tagihan (via mark paid): "{nama tagihan} ditandai dibayar"
- Opsi **"Batal"** (undo) tersedia selama toast aktif

**Edit mode (buka dari history):**

- Field terisi otomatis dari data transaksi yang diedit
- Nominal, mode, wallet, tanggal, catatan — semua bisa diubah

---

## 5. Cek Dulu — Full Page

Route: `/cek-dulu`

Halaman untuk menjawab pertanyaan "aman ga gue beli ini?"

**Copy header:**

- Title: "Cek Dulu"
- Sub: "aman ga gue beli ini?"

**Input harga:**

- Label: "harga barang"
- Input numeric besar (font 48px default, mengecil otomatis jika angka panjang)
- Currency symbol di kiri
- Context bawah: "sampai gajian: {days} hari lagi · saldo total {amount}"
- Auto-focus saat page buka

**Frame perbandingan (sekarang → kalau beli):**

**Baris 1 — Jatah Harian (selalu tampil):**

- Label: "jatah harian sampai gajian"
- Kolom "sekarang" dan "kalau beli"
- Formula:
  ```
  Jatah Harian = Saldo Bebas ÷ Hari Menuju Gajian
  Jatah Harian Setelah Beli = (Saldo Bebas − Harga) ÷ Hari Menuju Gajian
  ```
- Delta ditampilkan: selisih per hari + jumlah hari

**Baris 2 — Sisa Operasional (muncul jika harga > 1 hari jatah harian):**

- Label: "sisa operasional" + badge "baru muncul"
- Menampilkan saldo bebas sekarang vs setelah beli

**Baris 3 — Tabungan Kepotong (muncul jika harga > total saldo bebas):**

- Label: "tabungan kepotong" + badge "baru muncul"
- Menampilkan total tabungan sekarang vs setelah beli
- Note: "Buat nutupin, {amount} ketarik dari tabungan."
- Formula:
  ```
  Tabungan Terkena = max(0, min(totalTabungan, harga − saldoBebas))
  ```

**Insights (muncul jika harga > 0):**

1. Jika harga setara lebih dari 0 hari: "Harga ini setara {n} hari jatah harian lo — bayangkan sejumlah hari itu sudah 'dipesan' duluan oleh pembelian ini."
   - Formula: `ceil(harga ÷ jatahHarian)`
2. Jika ada porsi: "Pembelian ini makan {pct}% dari total sisa lo sampai gajian. Semakin besar angkanya, semakin sempit ruang gerak untuk kebutuhan lain bulan ini."
   - Formula: `round(harga ÷ saldoBebas × 100)`
3. Jika tabungan terkena: "Pembelian ini nyentuh tabungan lo. Butuh sekitar {n} hari nabung konsisten buat balik ke posisi sekarang — pastiin ini worth it dulu."
   - Formula: `ceil(tabunganTerkena ÷ jatahHarian)`

**Source line:** "dihitung dari saldo total" + "{n} dompet · {total saldo}"

**Action bar bawah:**

- **"Tutup"** → kembali
- **"Jadi beli — catat keluar"** (disabled jika harga 0) → buka QuickLog Sheet pre-filled harga, mode keluar. Sub: "masuk ke history sebagai pengeluaran"

**Setelah konfirmasi beli dari Cek Dulu:** QuickLog terbuka dengan harga yang sudah terisi, user konfirmasi dan catat.

---

## 6. Andai — Skenario Hipotetis

Route: `/andai`

**Copy header:**

- Title: "Andai"
- Sub: "skenario hipotetis"

Halaman untuk mensimulasikan kombinasi kejadian finansial secara hipotetis tanpa mengubah data real.

**Baseline (data sekarang):**

- Label: "sekarang · tanpa diandai"
- "anggaran operasional" → anggaran operasional saat ini (sisaPeriode)
- "total tabungan" → total dana tabungan
- "uang mengendap" → uang yang mengendap di luar periode ini

**Stack "andai...":**
User menambah item satu per satu. Setiap item menampilkan:

- Jenis (beli / income / tagihan / target nabung) dengan warna:
  - beli = merah
  - income = hijau
  - tagihan = kuning
  - target nabung = biru
- Nominal
- Deskripsi (opsional)
- Tombol hapus (×)

**4 jenis item:**

| Jenis             | Label           | Placeholder              | Efek                                  |
| ----------------- | --------------- | ------------------------ | ------------------------------------- |
| **beli**          | "beli"          | "e.g. service mobil"     | Kurangi saldo operasional             |
| **income**        | "income"        | "e.g. gaji, freelance"   | Tambah saldo operasional              |
| **tagihan**       | "tagihan"       | "e.g. langganan baru"    | Kurangi saldo operasional (recurring) |
| **target nabung** | "target nabung" | "e.g. nabung tiap bulan" | Kurangi saldo (tambah tabungan)       |

**Tambah item** (tombol "**+ tambah kejadian**"):

- Buka picker jenis (4 pilihan di atas)
- Setelah pilih jenis: buka sheet mini dengan:
  - Field deskripsi: "Deskripsi (opsional)"
  - Field nominal: "Nominal" (jenis beli/income/tagihan) atau "Target per bulan" (jenis target nabung)
  - CTA: **"Tambah"**

**Hasil "kalau semua ini kejadian":**

- Label: "kalau semua ini kejadian"
- "jatah harian sampai gajian" → jatah harian baru (setelah semua item diterapkan)
- "anggaran operasional" → anggaran operasional baru
- "total tabungan" → total tabungan baru

**Insights (sama seperti Cek Dulu, tapi dihitung dari net effect semua item):**

1. "Skenario ini menggerus {n} hari jatah harian lo — kalau semua ini kejadian, sejumlah hari itu sudah habis sebelum dimulai."
2. "Efek bersih skenario ini mengambil {pct}% dari total sisa lo sampai gajian. Semakin besar angkanya, semakin sempit ruang gerak untuk kebutuhan lain."
3. "Skenario ini mengurangi tabungan lo. Butuh sekitar {n} hari nabung konsisten untuk balik ke posisi sekarang — timbang lagi apakah worth it."

**Disclaimer income** (muncul jika ada item jenis "income"):

- "\* Pemasukan di Andai diasumsikan langsung tersedia, bukan prediksi tanggal."

**Bar perbandingan:** "Bandingkan 2 skenario ini" (tombol muncul jika ada ≥ 2 skenario tersimpan)

**Action bar bawah (3 tombol):**

- **"Reset"** → hapus semua item dari stack
- **"Simpan"** → buka Save Sheet
- **"Banding"** → masuk mode compare

**Save Sheet:**

- Title: "Simpan skenario"
- Label: "Nama skenario"
- Placeholder: "e.g. beli motor + freelance"
- CTA: **"Simpan"**
- Skenario tersimpan tampil di bagian "skenario tersimpan"

**Skenario Tersimpan (Rack):**

- Label: "skenario tersimpan"
- Daftar horizontal scroll nama skenario
- Tap skenario → load kembali item-itemnya
- Tombol hapus per skenario

**Compare Mode:**

- User memilih 2 skenario dari rack → tap **"Banding"** → buka Compare Sheet
- Compare Sheet title: "Banding skenario"
- Menampilkan 3 angka side-by-side:
  - "jatah harian"
  - "sisa operasional"
  - "total tabungan"

---

## 7. Riwayat — History Sheet

Sheet yang muncul dari bawah saat tap "semua catatan ›" di Home.

**Title:** "Riwayat"

**Filter tabs:**

- Semua / Keluar / Masuk / Nabung

**Daftar transaksi** dikelompokkan per tanggal:

- Tanggal header: "Hari ini" / "Kemarin" / format tanggal normal
- Per transaksi:
  - Label/nama (atau fallback "Transaksi")
  - Jenis: Pengeluaran / Pemasukan / Nabung / Tagihan / Transfer
  - Nominal (merah untuk keluar, hijau untuk masuk)
  - Catatan (jika ada)
  - Tombol Edit (ikon pena, aria: "Edit")
  - Tombol Hapus (ikon tong, aria: "Hapus")

**Jika tidak ada catatan:** "Belum ada catatan"

**Tap Edit** → buka QuickLog Sheet mode edit dengan data transaksi terisi

---

## 8. Profil Sheets (dari Home)

Diakses dari area card yang bisa di-tap di home (wallet section, tagihan section, goal section).

### 8a. Dompet

**Sheet List Dompet:**

- Title: "Dompet"
- Daftar semua dompet dengan nama dan saldo
- Tap dompet → buka detail/edit
- Tombol: **"Tambah dompet"**

**Sheet Edit Dompet:**

- Field nama (label: "nama dompet")
- Field "saldo aktual sekarang"
  - Saat user mengubah angka, muncul selisih: "selisih {amount}"
  - Prompt "selisih dari mana?":
    - **"Lupa catat — buat transaksi koreksi"** → buat transaksi keluar/masuk otomatis
    - **"Transfer ke wallet lain — 2 transaksi pasangan"** → pilih wallet tujuan, buat 2 transaksi pasangan
    - **"Koreksi saja — update angka tanpa transaksi"** → langsung update saldo tanpa rekam transaksi
- **"Sesuaikan saldo"** → tombol setelah enter angka baru
- **"Hapus dompet"** → konfirmasi "Yakin hapus {nama}?"

**Sheet Tambah Dompet:**

- Field nama (placeholder: "e.g. BCA, Dana, Tunai")
- Field saldo (label: "saldo awal")
- Bisa tambah lebih dari satu dompet sekaligus: **"+ Tambah dompet"**
- CTA: **"Tambah dompet"**

---

### 8b. Tagihan

**Sheet List Tagihan:**

- Title: "Tagihan"
- Daftar semua tagihan dengan nama, nominal, dan status
- Tap tagihan → buka detail/edit
- Tombol: **"+ Tambah tagihan"**

**Sheet Tambah / Edit Tagihan:**

- Title: "Tambah tagihan" / "Edit tagihan"
- **Field nama** (placeholder: "e.g. Spotify, BPJS")
- **Field nominal** dengan dua opsi:
  - "selalu sama" (fixed amount)
  - "bisa berubah" (variable — nominal = estimasi)
- **Jenis tagihan:**
  - "rutin" (berulang sesuai frekuensi)
  - "sekali" (satu kali saja)
- **Frekuensi** (muncul jika rutin):
  - Mingguan / 2 Mingguan / Bulanan / 2 Bulanan / 3 Bulanan / Tahunan
- **Field tanggal jatuh tempo** (1–31, label: "tanggal jatuh tempo (1–31)")
- **Field tanggal anchor** — titik referensi perhitungan siklus:
  - Untuk mingguan/2mingguan: pilih hari (Senin–Minggu)
  - Untuk bulanan: tanggal di bulan mana mulai hitung siklus
  - Untuk tahunan: bulan mana
- CTA: **"Simpan"** / **"Hapus"** (edit mode)

**Sheet Detail Tagihan:**

- "Nominal" → amount
- "Tgl {day}" → tanggal jatuh tempo
- "Status" → Sudah dibayar bulan ini / Lewat tempo / Jatuh tempo hari ini / Belum dibayar
- "Terakhir dibayar" → tanggal pembayaran terakhir
- Jika urgent (lewat tempo):
  - Badge merah: "Komitmen mendesak"
  - Sub: "Lewat tempo {n} hari" / "Jatuh tempo hari ini"
- Tombol: **"Tandai Dibayar"** / **"Bayar"**
- Konfirmasi hapus: "Yakin hapus {nama}?"

**Sheet Bayar Tagihan (Mark Paid):**

- Title: "Bayar {nama tagihan}"
- **Field nominal** (pre-filled dengan estimasi, label: "Nominal", hint: "estimasi: {amount}")
- **Field "Bayar dari"** → pilih wallet
- **Field tanggal**
- Warning jika saldo tidak cukup: "Saldo {wallet} tidak cukup untuk pembayaran ini."
- CTA: **"Tandai Dibayar"**

---

### 8c. Goal Tabungan

**Sheet List Goal (dari Home):**

- Title: "Goal tabungan"
- Daftar goal dengan progress
- Hint: "Urutan goal diatur di Home lewat drag-drop."
- Tap goal → edit
- Tombol: **"+ Tambah goal"** / **"Tambah goal"**

**Sheet Tambah / Edit Goal:**

- Title: "Tambah goal" / "Edit goal"
- **Field nama** (label: "nama goal", placeholder: "e.g. Emergency fund, Liburan")
- **Field target** (label: "target nominal")
- CTA: **"Simpan"**

**Batasan:** Tier dasar maksimal 3 goals.

---

## 9. Settings / Setelan

Route: `/setelan`

**Header:** "setelan"
**License status di header:**

- Aktif: "Aktif sampai {date} · {n} hari lagi"
- Tidak aktif: "Belum aktif"

---

### Section: Profil

**Baris "pemasukan":**

- Sub: "jenis & tanggal gajian"
- Tap → buka **ProfilIncomeSheet**:
  - Pilih tipe income: tetap / freelance / campuran
  - Tanggal gajian (1–31) — jika tetap atau campuran
  - Weekend behavior: Maju ke Jumat / Mundur ke Senin / Tetap di hari itu / Tidak konsisten
  - Note freelance: "Freelance: sisa = saldo minimum akhir bulan. Payday = hari terakhir bulan."
  - CTA: **"Simpan"**

---

### Section: Tampilan

**Baris "tema":**

- 3 opsi toggle: terang / gelap / sistem
- Note untuk dark mode: "gelap = v2 · belum tersedia"

**Baris "bahasa":**

- Toggle: Indonesia / English
- Instant apply — semua copy berubah langsung tanpa reload

**Baris "mata uang kedua":**

- Pilih dari dropdown currencies
- Tampil "tidak ada" jika belum dipilih
- Jika mata uang kedua masih dipakai di wallet/tagihan/goal saat hendak dihapus:
  - Alert: "Mata uang masih dipakai"
  - Warning: "Hapus dulu semua dompet, tagihan, dan goal dalam mata uang ini sebelum menonaktifkannya."

---

### Section: Data & Backup

**Export backup:**

- Label: "export backup"
- Sub: "file lengkap buat pindah / restore"
- Tap → download file `.json` berisi semua data (wallets, transaksi, tagihan, goals, settings)

**Export transaksi:**

- Label: "export transaksi"
- Sub: "buat dibuka di spreadsheet"
- Tap → download file `.csv` transaksi saja

**Import dari backup:**

- Label: "import dari backup"
- Sub: "restore dari file .json"
- Tap → pilih file `.json` dari device
- Preview sebelum import (sheet konfirmasi):
  - Title: "Import backup"
  - Ringkasan konten: jumlah dompet / transaksi / tagihan / goal
  - Warning: "Data yang ada sekarang akan ditimpa. Tidak bisa di-undo."
  - CTA: **"Restore sekarang"**
- Jika file invalid: "Gagal import" + pesan error

**Hapus semua data:**

- Label: "hapus semua data"
- Sub: "tidak bisa di-undo"
- **Step 1 konfirmasi:**
  - Title: "Hapus semua data"
  - Warning: "Semua transaksi, wallet, tagihan, dan goal akan dihapus permanen. Lisensi tetap tersimpan."
  - CTA: **"Lanjut hapus"**
- **Step 2 verifikasi ketik:**
  - Prompt: "Ketik HAPUS untuk konfirmasi"
  - Input harus berisi persis kata **"HAPUS"** sebelum tombol aktif
  - CTA: **"Hapus semua data"**

---

### Section: Tentang

- "dibuat oleh" → nama studio (pikaxu / collab)
- "twitter" → link Twitter
- "email" → link email

---

### Lisensi (buka dari Settings header atau dari baris terpisah)

**ProfilLicenseSheet:**

- Title: "Lisensi"
- "status" → "aktif" / "Lisensi belum diaktifkan."
- Jika aktif:
  - "masa aktif" → "{n} hari lagi · s/d {date}"
  - Tombol: **"Ganti kode lisensi"**
- Field input kode:
  - Label: "Masukkan kode lisensi"
  - Selama verifikasi: "Memverifikasi…"
  - CTA: **"Aktifkan"**
  - Error invalid: "Kode tidak valid atau tanda tangan tidak cocok."
  - Error expired: "Kode sudah kadaluarsa."
  - Sukses: "Lisensi berhasil diaktifkan!"
- Link: **"perpanjang / beli baru"**

---

## 10. Berbagi & Keamanan — Halaman Detail

Fitur opsional untuk menghubungkan dua perangkat (misalnya: user dan pasangan) agar berbagi satu profil keuangan bersama.

**Model teknis (relevan untuk PM):**

- Setiap device mendapat anonymous ID otomatis (tidak perlu buat akun)
- Data lokal tetap ada, sync ke cloud hanya jika terhubung
- Maksimal 2 device per profil
- Sync otomatis real-time saat terhubung; offline = data lokal berfungsi normal
- Saat gabung profil: data device yang gabung **dibuang**, menggunakan data dari profil host

---

### 10a. Ajak Pasangan — `/ajak-pasangan`

Alur untuk membuat profil bersama dan mengundang pasangan.

**Step 1 — Tampilkan Kode Recovery (hanya muncul pertama kali):**

- User yang pertama "Ajak Pasangan" akan diberi **kode recovery** format: `SISA-XXXX-XXXX-XXXX-XXXX`
- Instruksi: simpan kode ini di tempat aman sebelum lanjut (screenshot, catat, dll)
- Setelah user konfirmasi sudah simpan → maju ke step 2
- Kode recovery ini tidak akan muncul lagi, dipakai untuk memulihkan akses jika ganti HP

**Step 2 — Tampilkan Kode Undang:**

- Kode format: `RUMAH-XXXX` (4 karakter acak, hanya huruf/angka yang tidak ambigu)
- Kode valid 30 menit sejak dibuat
- Kode sekali pakai (setelah dipakai, kode hangus)
- Tombol: **"Salin kode"** (copy ke clipboard)
- Tombol: **"Bagikan via WhatsApp"** → buka WhatsApp dengan teks pre-filled: "Hei! Aku undang kamu gabung ke profil SISA kita..."
- Tombol: **"Buat Kode Baru"** → generate kode baru (jika kode lama expire atau sudah dipakai)
- Jika masih ada kode aktif (belum expire & belum dipakai): kode lama ditampilkan kembali tanpa generate baru

---

### 10b. Gabung dengan Kode — `/gabung-kode`

Alur untuk device kedua bergabung ke profil yang sudah ada.

**Step 1 — Input Kode:**

- 4 box input terpisah, masing-masing satu karakter huruf/angka
- Auto-advance ke box berikutnya setelah isi
- Backspace dari box kosong → pindah ke box sebelumnya
- Paste support: paste string `RUMAH-XXXX` atau hanya `XXXX` → otomatis ekstrak 4 karakter
- Submit otomatis saat 4 karakter terisi

**Step 2 — Konfirmasi Bergabung:**
User melihat preview profil yang akan diikuti:

- Avatar dua orang (inisial A dan S atau inisial dari nama)
- Nama profil yang diundang
- Penjelasan apa yang akan terjadi:
  - Data lokal device ini akan dibuang
  - Akan menggunakan data dari profil host
- Warning: tidak bisa dibatalkan setelah bergabung
- CTA: **"Gabung"** | **"Batal"**

**Step 3 — Berhasil / Error:**

- Berhasil: layar sukses + navigasi ke beranda
- Error:
  - `CODE_NOT_FOUND` → kode tidak ditemukan
  - `CODE_EXPIRED` → kode sudah kadaluarsa (30 menit)
  - `CODE_ALREADY_USED` → kode sudah dipakai
  - `ALREADY_IN_PROFILE` → device ini sudah terhubung ke profil lain
  - `PROFILE_FULL` → profil sudah penuh (sudah ada 2 device)

---

### 10c. Hub Berbagi & Keamanan — `/berbagi-keamanan`

Halaman utama manajemen koneksi.

**Jika terhubung (connected):**

- Tampilkan 2 member card side-by-side:
  - Avatar + nama setiap device/member
  - Status aktif/tidak aktif
- Jika profil sudah penuh (2 device): warning "maks perangkat sudah penuh"
- Tombol: **"Putuskan koneksi"** → buka sheet konfirmasi
  - Sheet konfirmasi: "Yakin putuskan koneksi? Data lokal akan tetap ada, tapi sinkronisasi berhenti."
  - CTA: **"Putuskan"** | **"Batal"**
  - Setelah putus: kembali ke status solo, navigasi ke /

**Jika tidak terhubung (solo):**

- 3 CTA:
  - **"Ajak Pasangan"** → /ajak-pasangan (buat profil + undang)
  - **"Gabung dengan Kode"** → /gabung-kode (ikut profil yang sudah ada)
  - **"Pulihkan Profil"** → /pulihkan (recovery jika ganti HP)

---

### 10d. Pulihkan Profil — `/pulihkan`

Digunakan saat user ganti HP dan ingin klaim kembali akses ke profil bersama.

**Input kode recovery:**

- Satu text input
- Format yang diterima: `SISA-XXXX-XXXX-XXXX-XXXX`
- Validasi client: harus diawali "SISA-" dan minimal 20 karakter
- Tombol paste (salin dari clipboard)
- Enter key submit

**Submit:**

- Sistem mencocokkan hash kode dengan database
- Berhasil: koneksi dipulihkan, navigasi ke /
- Error:
  - `RECOVERY_CODE_INVALID` → kode tidak cocok / salah ketik
  - `PROFILE_FULL` → profil sudah dihuni 2 device lain

**Sukses screen:**

- Pesan berhasil terhubung kembali
- CTA: **"Kembali ke Beranda"** → /

---

## Catatan Lintas Fitur

### Currency Scope

- User bisa punya 2 currency aktif: primary dan secondary
- Toggle currency di Home mempengaruhi semua angka dan daftar (wallet, tagihan, goal hanya tampil yang sesuai currency aktif)
- Tidak ada konversi antar currency — kedua currency sepenuhnya terpisah

### Anggaran Operasional — Definisi & Sumber Kebenaran

Istilah di UI: **"Anggaran Operasional"** (sebelumnya disebut "Saldo Bebas"). Satu formula yang dipakai di seluruh app (home, cek dulu, andai):

```
Anggaran Operasional = Pemasukan Periode − Tagihan Belum Lunas − Target Nabung
```

"Tagihan belum lunas" = semua occurrence tagihan aktif yang belum dibayar dari sekarang sampai gajian berikutnya.

**Uang Mengendap** = Total Saldo − Anggaran Operasional − Tagihan Belum Lunas − Target Nabung (uang yang ada di dompet tapi di luar perhitungan periode ini).

### Payday Calculation

- **Income tetap atau campuran, frekuensi bulanan:** tanggal {incomeDay} bulan ini atau bulan depan (tergantung apakah hari ini sudah lewat incomeDay). Weekend behavior disesuaikan.
- **Income tetap atau campuran, frekuensi mingguan/2 mingguan:** dihitung dari anchor date, cycle 7 atau 14 hari.
- **Freelance:** selalu hari terakhir bulan ini, tanpa weekend adjustment.

### Tagihan Urgency

Tagihan memiliki 4 level urgency:

- **lewat-tempo:** occurrence ada di masa lalu, belum dibayar
- **hari-ini:** occurrence hari ini, belum dibayar
- **dalam-7-hari:** occurrence 1–7 hari ke depan
- **normal:** semua lainnya

Pengurutan di TagihanModule: lewat-tempo → hari-ini → dalam-7-hari → normal. Dalam tier yang sama: urut by dueDay.

### Goal Waterfall (urutan prioritas)

Goal pertama di list = prioritas tertinggi. Seluruh tabungan mengalir ke goal pertama sampai terpenuhi, kemudian ke goal berikutnya. Urutan bisa diubah via drag-drop di Home.

### Toast & Undo

Setiap aksi catat menampilkan toast dengan opsi "Batal" (undo). Toast juga menawarkan "Ubah" (buka QuickLog mode edit dengan data yang baru saja dicatat).

---

_Dokumen ini mencerminkan codebase per Juni 2026 (sprint 2b + sprint 3). Semua copy bersumber dari `src/shared/strings/strings.ts` dan komponen yang live._
