import type { Allocation } from '@/db/database'

export interface AllocationResult {
  sisaUang: number
  mengendap: number
  jatahHariIni: number
  spentToday: number
}

export function computeFromAllocation(
  allocation: Allocation,
  params: {
    totalSaldo: number
    tagihanUnpaid: number
    spentSinceLock: number
    spentToday: number
  },
): AllocationResult {
  const { totalSaldo, tagihanUnpaid, spentSinceLock, spentToday } = params
  const sisaUang = Math.max(0, allocation.jatahHarian * allocation.daysAtLock - spentSinceLock)
  const mengendap = totalSaldo - tagihanUnpaid - sisaUang
  return { sisaUang, mengendap, jatahHariIni: allocation.jatahHarian, spentToday }
}

export interface RelockInput {
  totalSaldo: number
  tagihanUnpaid: number
  buatDipakai: number
  sisaHari: number
  now: number
  periodEndDate?: number | null
}

export function relock(input: RelockInput): Allocation {
  const { buatDipakai, sisaHari, now, periodEndDate = null } = input
  return {
    id: 1,
    jatahHarian: sisaHari > 0 ? Math.round(buatDipakai / sisaHari) : 0,
    daysAtLock: sisaHari,
    lockedAt: now,
    periodEndDate: periodEndDate ?? null,
  }
}

/**
 * Single source of truth untuk perhitungan anggaran periode.
 *
 * Formula baru (income-based, bukan total-saldo-based):
 *   Anggaran Operasional = Pemasukan Periode − Tagihan Belum Lunas − Target Tabungan
 *   Jatah Harian         = Anggaran Operasional ÷ Hari Periode  [FIXED awal periode]
 *   Sisa Periode         = Anggaran Operasional − Terpakai Periode  [LIVE]
 *   Sisa Hari Ini        = Jatah Harian − Terpakai Hari Ini
 *   Uang Mengendap       = Total Saldo − Pemasukan Periode − Tagihan Belum Lunas
 *
 * Dipakai di: Home (SaldoModule), Cek Dulu, Andai.
 */

export type BudgetMode = 'normal' | 'bertahan' | 'hari-gajian' | 'hari-terakhir'

export interface BudgetPeriodeInput {
  /** Sum of masuk transactions since period start. */
  pemasukanPeriode: number
  /** Unpaid tagihan occurrences from now until next payday. */
  unpaidTagihanTotal: number
  /** Total earmarked savings (totalNabung). */
  targetTabungan: number
  /** Total calendar days in this pay period (7/14/~30). Fixed at period start. */
  hariPeriode: number
  /** Sum of keluar+tagihan (non-savings) transactions since period start. Live. */
  spentThisPeriode: number
  /** Sum of keluar+tagihan (non-savings) transactions today. */
  spentToday: number
  /** Total wallet balance — used only for uangMengendap and freelance saldo floor. */
  totalSaldo: number
  /** True for freelance: cap jatahHarian at totalSaldo ÷ hariPeriode. */
  useSaldoFloor: boolean
  /**
   * When set (non-null): activates alokasi path.
   * Hero is operasionalBudget-based, not income-based.
   * null → income-based path (backward compat for users without alokasi set).
   */
  operasionalBudget?: number | null
  /**
   * Model B locked jatah harian — computed once on re-divide events, stored in Settings.
   * Only used when operasionalBudget != null.
   */
  jatahHarianLocked?: number | null
}

export interface BudgetPeriodeResult {
  pemasukanPeriode: number
  /** Clamped ≥ 0. Use for display and computing jatahHarian. */
  anggaranOperasional: number
  /** May be negative (tagihan > pemasukan). Use to compute shortfall. */
  anggaranRaw: number
  /** Null only when mode === 'hari-gajian' (avoids divide-by-zero). */
  jatahHarian: number | null
  /** Live: anggaranOperasional − spentThisPeriode. May go negative if overspent. */
  sisaPeriode: number
  /** jatahHarian − spentToday. 0 when jatahHarian is null. */
  sisaHariIni: number
  /** Parallel metric — NOT part of anggaran. totalSaldo − pemasukanPeriode − tagihan. */
  uangMengendap: number
  hariPeriode: number
  mode: BudgetMode
  /** Amount by which tagihan exceed pemasukan. > 0 only in 'bertahan' mode. */
  shortfall: number
}

export function calcBudgetPeriode(input: BudgetPeriodeInput): BudgetPeriodeResult {
  const {
    pemasukanPeriode,
    unpaidTagihanTotal,
    targetTabungan,
    hariPeriode,
    spentThisPeriode,
    spentToday,
    totalSaldo,
    useSaldoFloor,
    operasionalBudget,
    jatahHarianLocked,
  } = input

  // ── ALOKASI PATH: user has committed an operasionalBudget ─────────────────
  if (operasionalBudget != null) {
    const anggaranOperasional = operasionalBudget
    const sisaPeriode = operasionalBudget - spentThisPeriode
    const jatahHarian = jatahHarianLocked ?? null
    const uangMengendap = Math.max(0, totalSaldo - unpaidTagihanTotal - operasionalBudget)
    const sisaHariIni = jatahHarian !== null ? jatahHarian - spentToday : 0

    let mode: BudgetMode
    if (hariPeriode === 0) {
      mode = 'hari-gajian'
    } else if (sisaPeriode < 0) {
      mode = 'bertahan'
    } else if (hariPeriode === 1) {
      mode = 'hari-terakhir'
    } else {
      mode = 'normal'
    }

    return {
      pemasukanPeriode: 0,
      anggaranOperasional,
      anggaranRaw: operasionalBudget,
      jatahHarian,
      sisaPeriode,
      sisaHariIni,
      uangMengendap,
      hariPeriode,
      mode,
      shortfall: 0,
    }
  }

  // ── INCOME-BASED PATH (legacy / users without alokasi) ────────────────────
  const anggaranRaw = pemasukanPeriode - unpaidTagihanTotal - targetTabungan
  const anggaranOperasional = Math.max(0, anggaranRaw)
  const shortfall = anggaranRaw < 0 ? Math.abs(anggaranRaw) : 0

  // Guard precedence: hari-gajian > bertahan > hari-terakhir > normal
  let mode: BudgetMode
  let jatahHarian: number | null

  if (hariPeriode === 0) {
    mode = 'hari-gajian'
    jatahHarian = null
  } else if (anggaranRaw <= 0) {
    mode = 'bertahan'
    jatahHarian = 0
  } else if (hariPeriode === 1) {
    mode = 'hari-terakhir'
    let raw = anggaranOperasional
    if (useSaldoFloor) raw = Math.min(raw, totalSaldo)
    jatahHarian = raw
  } else {
    mode = 'normal'
    let raw = anggaranOperasional / hariPeriode
    if (useSaldoFloor) raw = Math.min(raw, totalSaldo / hariPeriode)
    jatahHarian = raw
  }

  const sisaPeriode = anggaranOperasional - spentThisPeriode
  const sisaHariIni = jatahHarian !== null ? jatahHarian - spentToday : 0
  const uangMengendap = totalSaldo - pemasukanPeriode - unpaidTagihanTotal

  return {
    pemasukanPeriode,
    anggaranOperasional,
    anggaranRaw,
    jatahHarian,
    sisaPeriode,
    sisaHariIni,
    uangMengendap,
    hariPeriode,
    mode,
    shortfall,
  }
}

/**
 * Pure function — called on every re-divide event:
 *   1. User sets/edits alokasi (onboarding or home sheet)
 *   2. Payday reset confirmed by user
 *
 * mengendap is clamped to 0 (cannot go negative).
 * jatahHarianLocked is 0 when sisaHari <= 0 (hari-gajian guard).
 */
export function recomputeAlokasi({
  totalSaldo,
  unpaidTagihanTotal,
  operasionalBudget,
  sisaHari,
}: {
  totalSaldo: number
  unpaidTagihanTotal: number
  operasionalBudget: number
  sisaHari: number
}): { mengendap: number; jatahHarianLocked: number } {
  const mengendap = Math.max(0, totalSaldo - unpaidTagihanTotal - operasionalBudget)
  const jatahHarianLocked = sisaHari > 0 ? Math.round(operasionalBudget / sisaHari) : 0
  return { mengendap, jatahHarianLocked }
}
