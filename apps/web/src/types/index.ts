/**
 * 领域类型。对应需求文档 F-2-05（交易生成）与 F-10（指标口径）。
 * 骨架阶段只声明核心实体，字段随各页面接入逐步补全。
 */

export type TradeDirection = 'long' | 'short'
export type TradeStatus = 'open' | 'closed'
export type TradeResult = 'win' | 'loss' | 'breakeven'

export interface Account {
  id: string
  name: string
  broker: string
  accountType: 'live' | 'demo' | 'prop'
  baseCurrency: string
  initialBalance: number
  currentBalance: number
}

export interface Trade {
  id: string
  accountId: string
  symbol: string
  direction: TradeDirection
  status: TradeStatus
  result: TradeResult
  openedAt: string
  closedAt: string | null
  durationSec: number
  quantity: number
  avgEntryPrice: number
  avgExitPrice: number | null
  grossPnl: number
  commissions: number
  swap: number
  netPnl: number
  netRoi: number
  pips: number
  plannedR: number | null
  realizedR: number | null
  strategyId: string | null
  tagIds: string[]
  rating: number | null
  hasNote: boolean
}

/** 日聚合。日历、日视图、每日盈亏图共用 */
export interface DailyStat {
  date: string
  totalTrades: number
  winners: number
  losers: number
  grossPnl: number
  commissions: number
  netPnl: number
  volume: number
  winRate: number
  profitFactor: number
  cumNetPnl: number
  hasNote: boolean
}

/** 汇总指标。F-10-02 */
export interface SummaryMetrics {
  netPnl: number
  totalTrades: number
  tradeWinRate: number
  dayWinRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  avgWinLossRatio: number
  winners: number
  losers: number
  breakeven: number
}

/** 列表接口的统一分页包装 */
export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
