import { calcDaysUntilPayday } from '@/features/home/home.utils'
import type { Settings } from '@/db/database'

export type AndaiKind = 'beli' | 'income' | 'tagihan'

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
  uangMengendap: number
}

export interface AndaiResult {
  dailyBefore: number
  dailyAfter: number
  sisaBefore: number
  sisaAfter: number
  daysEquivalent: number
  portionPct: number
  recoveryDays: number
}

export function calcAndai(items: AndaiItem[], baseline: AndaiBaseline): AndaiResult {
  const { sisaPeriode, dailyBudget, daysUntilPayday } = baseline

  let sisaDelta = 0

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
    }
  }

  const sisaBefore = Math.max(0, sisaPeriode)
  const sisaAfter = sisaPeriode + sisaDelta

  const afterDaily = daysUntilPayday > 0 ? Math.max(0, sisaAfter / daysUntilPayday) : 0

  const netLoss = sisaBefore - Math.max(0, sisaAfter)

  const daysEquivalent = netLoss > 0 && dailyBudget > 0 ? Math.ceil(netLoss / dailyBudget) : 0
  const portionPct = netLoss > 0 && sisaBefore > 0 ? Math.round((netLoss / sisaBefore) * 100) : 0
  const recoveryDays = 0

  return {
    dailyBefore: dailyBudget,
    dailyAfter: afterDaily,
    sisaBefore,
    sisaAfter,
    daysEquivalent,
    portionPct,
    recoveryDays,
  }
}

export function buildAndaiBaseline(
  sisaPeriode: number,
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
    uangMengendap,
  }
}
