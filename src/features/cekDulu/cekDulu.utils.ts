// Row visibility thresholds (AC 6.3):
//   Row 1 (jatah harian)      — always
//   Row 2 (sisa gajian)       — nominal > dailyBudget (exceeds one day's allocation)
//   Row 3 (tabungan kepotong) — nominal > availableOp (exceeds full sisa)

import { calcSisa } from '@/shared/utils/sisa.utils'

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
  // "sisa" here = total sisa, not the calcSisaPasGajian formula
  sisaBefore: number
  sisaAfter: number

  // Row 3 — tabungan kepotong (appears when nominal > availableOp)
  showTabunganRow: boolean
  nabungBefore: number
  nabungAfter: number
  nabungDrawn: number

  // Insights
  daysEquivalent: number // ceil(nominal / dailyBefore) — opportunity cost in days
  portionPct: number // round(nominal / availableOp * 100) — % of sisa bulan ini
  recoveryDays: number // ceil(nabungDrawn / dailyBefore) — days of saving to recover; 0 if no tabungan drawn
}

export function calcCekDulu(input: CekDuluInput): CekDuluResult {
  const { nominal, totalSaldo, unpaidTagihanTotal, daysUntilPayday, totalNabung } = input

  const availableOp = Math.max(0, calcSisa(totalSaldo, unpaidTagihanTotal, totalNabung))
  const dailyBudget = daysUntilPayday > 0 && availableOp > 0 ? availableOp / daysUntilPayday : 0

  const afterAvailableOp = availableOp - nominal
  const afterDailyBudget = daysUntilPayday > 0 ? Math.max(0, afterAvailableOp / daysUntilPayday) : 0

  const nabungDrawn = Math.max(0, Math.min(totalNabung, nominal - availableOp))
  const afterNabung = totalNabung - nabungDrawn

  const daysEquivalent = nominal > 0 && dailyBudget > 0 ? Math.ceil(nominal / dailyBudget) : 0
  const portionPct = nominal > 0 && availableOp > 0 ? Math.round((nominal / availableOp) * 100) : 0
  const recoveryDays = nabungDrawn > 0 && dailyBudget > 0 ? Math.ceil(nabungDrawn / dailyBudget) : 0

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

    daysEquivalent,
    portionPct,
    recoveryDays,
  }
}
