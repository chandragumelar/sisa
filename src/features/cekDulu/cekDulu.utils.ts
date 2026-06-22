// Row visibility thresholds:
//   Row 1 (jatah harian)      — always
//   Row 2 (sisa gajian)       — nominal > dailyBudget (exceeds one day's allocation)
//   Row 3 (tabungan kepotong) — nominal > sisaPeriode (exceeds full remaining)

export interface CekDuluInput {
  nominal: number
  /** Live remaining operational budget this period (from calcBudgetPeriode.sisaPeriode). */
  sisaPeriode: number
  /** Effective daily: sisaPeriode ÷ daysUntilPayday. Null on hari-gajian. */
  dailyBudget: number | null
  daysUntilPayday: number
  totalNabung: number
}

export interface CekDuluResult {
  // Row 1 — jatah harian sampai gajian
  dailyBefore: number
  dailyAfter: number
  dailyDelta: number

  // Row 2 — sisa operasional (appears when nominal > dailyBudget)
  showSisaRow: boolean
  sisaBefore: number
  sisaAfter: number

  // Row 3 — tabungan kepotong (appears when nominal > sisaPeriode)
  showTabunganRow: boolean
  nabungBefore: number
  nabungAfter: number
  nabungDrawn: number

  // Insights
  daysEquivalent: number // ceil(nominal / dailyBefore)
  portionPct: number // round(nominal / sisaPeriode * 100)
  recoveryDays: number // ceil(nabungDrawn / dailyBefore); 0 if no savings drawn
}

export function calcCekDulu(input: CekDuluInput): CekDuluResult {
  const { nominal, sisaPeriode, dailyBudget, daysUntilPayday, totalNabung } = input

  const availableOp = Math.max(0, sisaPeriode)
  const daily = dailyBudget !== null ? dailyBudget : 0

  const afterAvailableOp = availableOp - nominal
  const afterDaily = daysUntilPayday > 0 ? Math.max(0, afterAvailableOp / daysUntilPayday) : 0

  const nabungDrawn = Math.max(0, Math.min(totalNabung, nominal - availableOp))
  const afterNabung = totalNabung - nabungDrawn

  const daysEquivalent = nominal > 0 && daily > 0 ? Math.ceil(nominal / daily) : 0
  const portionPct = nominal > 0 && availableOp > 0 ? Math.round((nominal / availableOp) * 100) : 0
  const recoveryDays = nabungDrawn > 0 && daily > 0 ? Math.ceil(nabungDrawn / daily) : 0

  return {
    dailyBefore: daily,
    dailyAfter: afterDaily,
    dailyDelta: afterDaily - daily,

    showSisaRow: nominal > daily,
    sisaBefore: availableOp,
    sisaAfter: afterAvailableOp,

    showTabunganRow: nominal > availableOp,
    nabungBefore: totalNabung,
    nabungAfter: afterNabung,
    nabungDrawn,

    daysEquivalent,
    portionPct,
    recoveryDays,
  }
}
