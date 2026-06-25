// Row visibility thresholds:
//   Row 1 (jatah harian)        — always
//   Row 2 (sisa gajian)         — nominal > dailyBudget (exceeds one day's allocation)
//   Row 3 (uang mengendap)      — nominal > sisaUang (exceeds full remaining)

export interface CekDuluInput {
  nominal: number
  /** Live remaining operational budget this period. */
  sisaUang: number
  /** Effective daily: sisaUang ÷ daysUntilPayday. Null on hari-gajian. */
  dailyBudget: number | null
  daysUntilPayday: number
  /** Uang mengendap (parked money outside operational). */
  mengendap: number
  /** Daily budget for recovery days calculation. */
  jatahHarian: number
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

  // Row 3 — uang mengendap kepotong (appears when nominal > sisaUang)
  showMengendapRow: boolean
  mengendapBefore: number
  mengendapAfter: number
  mengendapDrawn: number

  // Insights
  daysEquivalent: number // ceil(nominal / dailyBefore)
  portionPct: number // round(nominal / sisaUang * 100)
  recoveryDays: number // ceil(mengendapDrawn / jatahHarian); 0 if none drawn
}

export function calcCekDulu(input: CekDuluInput): CekDuluResult {
  const { nominal, sisaUang, dailyBudget, daysUntilPayday, mengendap, jatahHarian } = input

  const availableOp = Math.max(0, sisaUang)
  const daily = dailyBudget !== null ? dailyBudget : 0

  const afterAvailableOp = availableOp - nominal
  const afterDaily = daysUntilPayday > 0 ? Math.max(0, afterAvailableOp / daysUntilPayday) : 0

  const mengendapDrawn = Math.max(0, Math.min(mengendap, nominal - availableOp))
  const afterMengendap = mengendap - mengendapDrawn

  const daysEquivalent = nominal > 0 && daily > 0 ? Math.ceil(nominal / daily) : 0
  const portionPct = nominal > 0 && availableOp > 0 ? Math.round((nominal / availableOp) * 100) : 0
  const recoveryDays =
    mengendapDrawn > 0 && jatahHarian > 0 ? Math.ceil(mengendapDrawn / jatahHarian) : 0

  return {
    dailyBefore: daily,
    dailyAfter: afterDaily,
    dailyDelta: afterDaily - daily,

    showSisaRow: nominal > daily,
    sisaBefore: availableOp,
    sisaAfter: afterAvailableOp,

    showMengendapRow: nominal > availableOp,
    mengendapBefore: mengendap,
    mengendapAfter: afterMengendap,
    mengendapDrawn,

    daysEquivalent,
    portionPct,
    recoveryDays,
  }
}
