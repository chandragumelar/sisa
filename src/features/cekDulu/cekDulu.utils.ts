// Row visibility thresholds (AC 6.3):
//   Row 1 (jatah harian)      — always
//   Row 2 (sisa gajian)       — nominal > dailyBudget (exceeds one day's allocation)
//   Row 3 (tabungan kepotong) — nominal > availableOp (exceeds full operational budget)

export interface CekDuluInput {
  nominal: number
  totalSaldo: number
  unpaidTagihanTotal: number
  daysUntilPayday: number
  totalNabung: number
}

export interface CekDuluResult {
  // Row 1 — jatah harian sampai gajian
  dailyBefore: number
  dailyAfter: number
  dailyDelta: number

  // Row 2 — sisa pas gajian (appears when nominal > dailyBudget)
  showSisaRow: boolean
  // "sisa" here = total available operational budget, not the calcSisaPasGajian formula
  sisaBefore: number
  sisaAfter: number

  // Row 3 — tabungan kepotong (appears when nominal > availableOp)
  showTabunganRow: boolean
  nabungBefore: number
  nabungAfter: number
  nabungDrawn: number
}

export function calcCekDulu(input: CekDuluInput): CekDuluResult {
  const { nominal, totalSaldo, unpaidTagihanTotal, daysUntilPayday, totalNabung } = input

  const availableOp = Math.max(0, totalSaldo - unpaidTagihanTotal)
  const dailyBudget = daysUntilPayday > 0 && availableOp > 0 ? availableOp / daysUntilPayday : 0

  const afterAvailableOp = availableOp - nominal
  const afterDailyBudget = daysUntilPayday > 0 ? Math.max(0, afterAvailableOp / daysUntilPayday) : 0

  const nabungDrawn = Math.max(0, Math.min(totalNabung, nominal - availableOp))
  const afterNabung = totalNabung - nabungDrawn

  return {
    dailyBefore: dailyBudget,
    dailyAfter: afterDailyBudget,
    dailyDelta: afterDailyBudget - dailyBudget,

    showSisaRow: nominal > dailyBudget,
    sisaBefore: availableOp,
    sisaAfter: afterAvailableOp,

    showTabunganRow: nominal > availableOp,
    nabungBefore: totalNabung,
    nabungAfter: afterNabung,
    nabungDrawn,
  }
}
