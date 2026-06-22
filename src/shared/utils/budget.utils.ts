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
  } = input

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
