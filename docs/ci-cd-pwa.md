# SISA — CI/CD (PWA)

**Version:** 1.0
**Last Updated:** 2026-05-22
**Status:** Active
**Stack:** React 18 + Vite + TypeScript · GitHub Actions (CI) · Vercel (deploy)

---

## 0. Konteks

SISA adalah **PWA static** yang deploy ke **Vercel**. Tidak ada store, tidak ada native build, tidak ada backend. Ini mengubah CI/CD secara fundamental dibanding app native:

- **CD = Vercel otomatis.** Push ke `main` → Vercel build & deploy sendiri. **Tidak ada pipeline CD manual** yang perlu ditulis atau di-maintain.
- **CI = cek kualitas kode** sebelum masuk `main`. Itu satu-satunya bagian yang perlu disetup.
- **Tidak ada:** EAS, store review, version gating untuk store, forced update via server, crash monitoring berbayar, rollback store. Semua itu native-only.

Baca bersama `CLAUDE.md`, `engineering-guidelines-pwa.md`. Format commit, testing, dan aturan koding mengacu ke sana — dokumen ini fokus ke **Git workflow + CI + deploy**.

> 📌 Selaras batasan SISA: serverless, 0 cost, less maintenance. CI/CD-nya pun harus 0 cost (GitHub Actions free tier + Vercel free tier) dan minim setup.

---

## 1. Branch Strategy (Solo Dev — Disederhanakan)

SISA dikerjakan solo. Tiga tingkat `develop → staging → main` adalah overkill — itu untuk tim + release ke store. Cukup dua lapis:

| Branch               | Fungsi                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| `main`               | Production. Vercel auto-deploy dari sini. Tidak push langsung — hanya via PR |
| `feature/nama-fitur` | Satu fitur. Dibuat dari `main`, di-merge balik ke `main` via PR              |
| `fix/nama-bug`       | Satu bug fix. Dibuat dari `main`, di-merge balik ke `main` via PR            |

**Aturan:**

- Tidak push langsung ke `main` — selalu lewat PR, **bahkan untuk fix kecil**. Ini muscle memory + bikin CI selalu jalan + Vercel kasih preview deploy per PR.
- Branch `feature/`/`fix/` dihapus setelah merge.
- Tidak perlu `staging` — **Vercel Preview Deployment** sudah jadi staging otomatis: tiap PR dapat URL preview sendiri untuk dites sebelum merge.

> 📌 Kalau nanti SISA berkembang & ada kontributor lain, baru pertimbangkan nambah `develop`. Untuk sekarang, jangan.

---

## 2. Branch Protection (`main`)

Setup di `GitHub → Settings → Branches → Add rule` untuk `main`:

- Require pull request before merging
- Require status checks to pass (CI harus green)
- **Tidak** require approval (solo — tidak ada reviewer lain; ganti dengan self-review §6)
- Do not allow bypassing — owner pun lewat PR untuk konsistensi

**Merge strategy:** **Squash and merge** untuk semua PR ke `main`. Satu PR = satu commit bersih di `main`, gampang revert. Setup di `Settings → General → Pull Requests` (aktifkan squash saja, disable lainnya).

---

## 3. CI — GitHub Actions

### 3.1 Kapan jalan

Otomatis saat: push ke branch apapun, dan PR ke `main`.

### 3.2 Apa yang dicek

| Step           | Command              | Fail artinya                                           |
| -------------- | -------------------- | ------------------------------------------------------ |
| **Install**    | `npm ci`             | Lockfile rusak / dependency tidak tersedia             |
| **TypeScript** | `tsc --noEmit`       | Ada type error — fix sebelum merge                     |
| **ESLint**     | `eslint .`           | Langgar coding standards — fix sebelum merge           |
| **Prettier**   | `prettier --check .` | Format tidak konsisten — jalankan `prettier --write .` |
| **Unit Test**  | `vitest run`         | Ada logic rusak — fix sebelum merge                    |
| **Commitlint** | validasi PR title    | Format commit/PR salah — edit title                    |
| **Build**      | `vite build`         | Build gagal — ada config/import bermasalah             |

> Tidak ada "version check" step (itu untuk store gating native). Tidak ada "expo prebuild". Build check cukup `vite build`.

### 3.3 Runtime

- Runner: `ubuntu-latest`
- Node: lock di `.nvmrc` (versi sama dengan local & Vercel — set Node version di Vercel project settings biar sinkron)
- Package manager: **npm**, jangan campur yarn/pnpm
- Lockfile: `package-lock.json` wajib ter-commit. CI pakai `npm ci`, bukan `npm install`
- Cache: `node_modules`, invalidate by hash `package-lock.json`

### 3.4 Contoh Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  push:
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx prettier --check .
      - run: npx vitest run
      - run: npm run build
```

> Commitlint untuk PR title bisa ditambah sebagai job terpisah pakai action `wagoid/commitlint-github-action`, atau cukup di-enforce lewat pre-commit hook lokal (§5) kalau mau CI seramping mungkin.

### 3.5 Aturan CI

- **Green = mergeable. Red = tidak boleh merge**, kondisi apapun.
- **Jangan skip / disable / suppress** CI check untuk lolos — termasuk Prettier. Fix dulu.
- **Jangan disable test** untuk lolos — kalau test fail, ada alasannya.

---

## 4. CD — Vercel (Otomatis, Tidak Perlu Disetup)

Vercel meng-handle seluruh CD secara gratis. Yang perlu lo lakukan cuma connect repo ke Vercel sekali.

| Trigger           | Yang terjadi                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| Buka PR ke `main` | Vercel buat **Preview Deployment** — URL unik untuk tes PR ini (= staging otomatis) |
| Merge ke `main`   | Vercel **Production Deployment** otomatis — live di domain produksi                 |

**Setup sekali (di Vercel dashboard):**

- Connect GitHub repo
- Framework preset: **Vite**
- Build command: `npm run build` · Output dir: `dist`
- Node version: samakan dengan `.nvmrc`
- Environment variables (kalau ada): set di Vercel project settings. Untuk SISA, kemungkinan **tidak ada secret runtime** karena license diverifikasi pakai public key yang memang boleh di-bundle.

**Tidak ada:**

- Pipeline CD manual — Vercel yang kerja
- Rollback manual — Vercel punya "Instant Rollback" 1-klik ke deployment sebelumnya kalau ada masalah
- Store review / submit — ini PWA, user langsung akses URL atau install dari browser

> 📌 **Rollback PWA:** kalau deploy baru bermasalah, buka Vercel → Deployments → pilih deployment lama yang sehat → "Promote to Production". Hitungan detik, gratis, tanpa review. Jauh lebih sederhana dari store rollback.

---

## 5. Pre-commit Hooks

Feedback cepat sebelum CI — error dalam detik, bukan tunggu CI.

**Tooling:** Husky + lint-staged.

| Hook                  | Yang jalan                                           | Alasan                                        |
| --------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pre-commit`          | ESLint `--fix` + Prettier pada **staged files saja** | Cepat (<5 detik), auto-fix                    |
| `commit-msg`          | commitlint — validasi format commit                  | Enforce conventional commits                  |
| `pre-push` (opsional) | `tsc --noEmit` seluruh project                       | Catch type error sebelum push, hemat waktu CI |

**Tidak di pre-commit:** unit test (lambat, biar CI), build (sangat lambat, hanya CI).

**Bypass:** `git commit --no-verify` hanya untuk emergency yang langsung di-revert. Kalau hook bikin friction berulang, fix konfignya — jangan biasa bypass.

---

## 6. Commit & PR Format

Format commit didefinisikan di `engineering-guidelines-pwa.md` (§11). Enforcement di sini:

- **commitlint** di pre-commit hook (lokal). Opsional juga di CI.
- **PR title** ikut conventional commits — karena squash merge, PR title jadi commit message di `main`.
- Tipe valid: `feat | fix | refactor | chore | test | docs | perf | ci | build | style`
- Valid: `feat: add cek dulu canvas` · Invalid: `update`, `WIP`, `fix stuff`

---

## 7. Self Code Review (Solo Dev)

Tidak ada reviewer lain, jadi self-review wajib sebelum merge. Bukan formalitas.

**Prosedur:**

1. Buka PR di **GitHub web** (bukan editor) — perspektif visual beda menangkap bug yang ke-miss.
2. Cek **Vercel Preview Deployment** PR itu — tes fitur seperti user nyata di URL preview.
3. Jeda minimal **30 menit** dari coding terakhir — fresh eyes.
4. Review diff baris per baris seperti me-review punya orang lain.
5. Jalankan **self-review checklist** (engineering-guidelines §13) — jujur, bukan asal centang.
6. Tulis **summary comment** singkat di PR: apa yang berubah, kenapa pendekatan ini, apa risikonya.

**Aturan:** untuk PR > 200 baris, jangan merge di hari yang sama — over-night review. Fresh eyes nangkep yang capek-mata lewatkan.

---

## 8. `.gitignore` (PWA + Aman)

```
# Secrets & environment
.env
.env.local
.env.*.local

# License — KRITIS, jangan pernah commit
scripts/keys/          # private key Ed25519 generator
licenses.log           # record key yang sudah dijual

# Dependencies & build
node_modules/
dist/
.vite/

# Test & coverage
coverage/

# Local junk
.DS_Store
*.log
.vscode/
.idea/
```

**Aturan:**

- `.gitignore` di-review tiap ada tooling/dependency baru.
- **Private key license & `licenses.log` tidak boleh ke-commit, kondisi apapun.** Kalau ke-commit accidentally: jangan cuma `git rm` (sudah di history) — regenerate key pair, ganti public key di bundle, anggap key lama compromised. Untuk repo public, wajib cleanup history (`git filter-repo` / BFG).

---

## 9. Cara Kerja Sehari-hari

```
1. Branch dari main
   git checkout main && git pull
   git checkout -b feature/nama-fitur

2. Kerjakan fitur, commit kecil-kecil (conventional commits)

3. Push
   git push origin feature/nama-fitur

4. CI jalan otomatis — tunggu green
   Vercel buat Preview Deployment — dapat URL tes

5. Buka PR ke main, isi deskripsi + risiko singkat

6. Self code review (§7) — termasuk cek di Vercel preview

7. CI green + self-review beres → squash merge

8. Vercel auto-deploy ke production. Branch feature/ dihapus.
```

---

## 10. Kalau CI Fail

1. Buka GitHub Actions → klik run yang fail → klik step ❌
2. Baca error, fix di local
3. Pastikan pre-commit hook pass sebelum push (hemat waktu CI)
4. Push ulang — CI jalan lagi

**Jangan merge PR yang CI-nya merah, kondisi apapun. Jangan skip CI step untuk lolos.**

---

## 11. Instruksi untuk Claude

1. Pastikan kode tidak bikin TypeScript error, ESLint error, atau Prettier mismatch — ketiganya bikin CI fail.
2. Jangan suggest push langsung ke `main` — selalu lewat branch `feature/` atau `fix/` + PR.
3. Dependency baru → ingatkan owner: konfirmasi dulu (batasan less-maintenance), pastikan lolos test "0 cost & serverless".
4. Tidak ada EAS, store, native build, version gating, atau forced-update server — kalau owner menyinggung ini, ingatkan bahwa SISA adalah PWA static di Vercel.
5. Deploy = otomatis Vercel saat merge ke `main`. Rollback = Vercel "Promote to Production" deployment lama. Jangan bikin pipeline CD manual.
6. Fitur selesai & siap PR → ingatkan owner isi deskripsi + risiko + self code review (cek Vercel preview).
7. Jangan pernah suggest commit private key license atau `licenses.log`. Pastikan `.gitignore` aman tiap ada perubahan tooling.
8. Owner mau bypass PR dengan alasan "fix kecil" → tetap arahkan ke workflow PR normal. Konsistensi > kecepatan sesaat.
9. Situasi tidak tercakup dokumen → tanya owner, jangan asumsi.

---

_Dokumen ini ringkas sengaja, mengikuti realita PWA static + Vercel + solo dev. Update kalau ada perubahan workflow atau tooling._
