import { calcDaysUntilPayday } from '@/features/home/home.utils'
import type { Settings } from '@/db/database'

export type AndaiKind = 'beli' | 'income' | 'tagihan' | 'target-nabung'

export interface AndaiItem {
  id: string
  kind: AndaiKind
  desc: string
  amount: number
}

export interface AndaiBaseline {
  sisaPeriode: number
  dailyBudget: number
  daysUntilPayday: number
  totalNabung: number
  uangMengendap: number
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
  const { sisaPeriode, dailyBudget, daysUntilPayday, totalNabung } = baseline

  let sisaDelta = 0
  let nabungDelta = 0

  for (const item of items) {
    switch (item.kind) {
      case 'beli':
        sisaDelta -= item.amount
        break
      case 'income':
        sisaDelta += item.amount
        break
      case 'tagihan':
        sisaDelta -= item.amount
        break
      case 'target-nabung':
        sisaDelta -= item.amount
        nabungDelta += item.amount
        break
    }
  }

  const sisaBefore = Math.max(0, sisaPeriode)
  const sisaAfter = sisaPeriode + sisaDelta
  const afterNabung = totalNabung + nabungDelta

  const afterDaily = daysUntilPayday > 0 ? Math.max(0, sisaAfter / daysUntilPayday) : 0

  const netLoss = sisaBefore - Math.max(0, sisaAfter)
  const nabungDropped = totalNabung - Math.max(0, afterNabung)

  const daysEquivalent = netLoss > 0 && dailyBudget > 0 ? Math.ceil(netLoss / dailyBudget) : 0
  const portionPct = netLoss > 0 && sisaBefore > 0 ? Math.round((netLoss / sisaBefore) * 100) : 0
  const recoveryDays =
    nabungDropped > 0 && dailyBudget > 0 ? Math.ceil(nabungDropped / dailyBudget) : 0

  return {
    dailyBefore: dailyBudget,
    dailyAfter: afterDaily,
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
  sisaPeriode: number,
  totalNabung: number,
  uangMengendap: number,
  settings: Settings,
  nowMs: number,
): AndaiBaseline {
  const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
  const dailyBudget = daysUntilPayday > 0 ? Math.max(0, sisaPeriode / daysUntilPayday) : 0
  return {
    sisaPeriode,
    dailyBudget,
    daysUntilPayday,
    totalNabung,
    uangMengendap,
  }
}
