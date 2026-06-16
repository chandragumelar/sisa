import { calcDailyBudget, calcDaysUntilPayday } from '@/features/home/home.utils'
import { calcSisa } from '@/shared/utils/sisa.utils'
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
}

export interface AndaiResult {
  dailyBefore: number
  dailyAfter: number
  sisaBefore: number
  sisaAfter: number
  nabungBefore: number
  nabungAfter: number
  daysEquivalent: number
  portionPct: number
  recoveryDays: number
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
        tagihanDelta += item.amount
        break
      case 'target-nabung':
        nabungDelta += item.amount
        break
    }
  }

  const afterSaldo = totalSaldo + saldoDelta
  const afterUnpaidTagihan = unpaidTagihanTotal + tagihanDelta
  const afterNabung = totalNabung + nabungDelta
  const afterDailyBudget = calcDailyBudget(
    afterSaldo,
    afterUnpaidTagihan,
    afterNabung,
    daysUntilPayday,
  )

  const sisaBefore = calcSisa(totalSaldo, unpaidTagihanTotal, totalNabung)
  const sisaAfter = calcSisa(afterSaldo, afterUnpaidTagihan, afterNabung)

  const sisaDelta = sisaBefore - sisaAfter
  const nabungDelta = totalNabung - afterNabung
  const daysEquivalent = sisaDelta > 0 && dailyBudget > 0 ? Math.ceil(sisaDelta / dailyBudget) : 0
  const portionPct =
    sisaDelta > 0 && sisaBefore > 0 ? Math.round((sisaDelta / sisaBefore) * 100) : 0
  const recoveryDays = nabungDelta > 0 && dailyBudget > 0 ? Math.ceil(nabungDelta / dailyBudget) : 0

  return {
    dailyBefore: dailyBudget,
    dailyAfter: afterDailyBudget,
    sisaBefore,
    sisaAfter,
    nabungBefore: totalNabung,
    nabungAfter: afterNabung,
    daysEquivalent,
    portionPct,
    recoveryDays,
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
  return {
    totalSaldo,
    unpaidTagihanTotal,
    dailyBudget,
    daysUntilPayday,
    totalNabung,
  }
}
