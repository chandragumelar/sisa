import { calcDailyBudget, calcDaysUntilPayday } from '@/features/home/home.utils'
import type { Settings } from '@/db/database'

export type AndaiKind = 'beli' | 'income' | 'tagihan' | 'target-nabung'

export interface AndaiItem {
  id: string
  kind: AndaiKind
  desc: string
  amount: number
}

export interface AndaiBaseline {
  totalSaldo: number
  unpaidTagihanTotal: number
  dailyBudget: number
  daysUntilPayday: number
  totalNabung: number
  sisaPasGajian: number
}

export interface AndaiResult {
  dailyBefore: number
  dailyAfter: number
  // sisa = availableOp - baseline.dailyBudget × days
  // (how much is left if you keep spending at the same daily rate)
  sisaBefore: number
  sisaAfter: number
  nabungBefore: number
  nabungAfter: number
}

export function calcAndai(items: AndaiItem[], baseline: AndaiBaseline): AndaiResult {
  const { totalSaldo, unpaidTagihanTotal, dailyBudget, daysUntilPayday, totalNabung } = baseline

  let saldoDelta = 0
  let tagihanDelta = 0
  let nabungDelta = 0

  for (const item of items) {
    switch (item.kind) {
      case 'beli':
        saldoDelta -= item.amount
        break
      case 'income':
        saldoDelta += item.amount
        break
      case 'tagihan':
        // new commitment: reduce available budget (increase obligations, reduce saldo)
        tagihanDelta += item.amount
        saldoDelta -= item.amount
        break
      case 'target-nabung':
        // earmark savings: reduces operational saldo, increases nabung
        saldoDelta -= item.amount
        nabungDelta += item.amount
        break
    }
  }

  const afterSaldo = totalSaldo + saldoDelta
  const afterUnpaidTagihan = unpaidTagihanTotal + tagihanDelta
  const afterAvailableOp = Math.max(0, afterSaldo - afterUnpaidTagihan)
  const afterDailyBudget = calcDailyBudget(afterSaldo, afterUnpaidTagihan, 0, daysUntilPayday)

  const beforeAvailableOp = Math.max(0, totalSaldo - unpaidTagihanTotal)
  const sisaBefore = beforeAvailableOp - dailyBudget * daysUntilPayday
  // "sisa after" uses baseline daily rate so the comparison is meaningful
  const sisaAfter = afterAvailableOp - dailyBudget * daysUntilPayday

  return {
    dailyBefore: dailyBudget,
    dailyAfter: afterDailyBudget,
    sisaBefore,
    sisaAfter,
    nabungBefore: totalNabung,
    nabungAfter: totalNabung + nabungDelta,
  }
}

export function buildAndaiBaseline(
  totalSaldo: number,
  unpaidTagihanTotal: number,
  totalNabung: number,
  settings: Settings,
  nowMs: number,
): AndaiBaseline {
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const dailyBudget = calcDailyBudget(totalSaldo, unpaidTagihanTotal, totalNabung, daysUntilPayday)
  const availableOp = Math.max(0, totalSaldo - unpaidTagihanTotal - totalNabung)
  const sisaPasGajian = availableOp - dailyBudget * daysUntilPayday
  return {
    totalSaldo,
    unpaidTagihanTotal,
    dailyBudget,
    daysUntilPayday,
    totalNabung,
    sisaPasGajian,
  }
}
