import { faker } from '@faker-js/faker'
import type { Account, DailyStat, Trade, TradeResult } from '@/types'
import { instrumentBySymbol, pickInstrument } from './instruments'

/**
 * 固定 seed 的数据工厂：跨刷新数据稳定，指标可对账。
 * 交易由「先定方向与结果、再倒推价格」生成，保证 netPnl 与价格、点数自洽。
 */

const SEED = 20260814
const TOTAL_TRADES = 2300
const END_DATE = new Date('2026-08-14T16:00:00Z')
const TRADING_DAYS = 180

export const ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'FundedNext', broker: 'FundedNext', accountType: 'prop', baseCurrency: 'USD', initialBalance: 200_000, currentBalance: 178_444.73 },
  { id: 'acc-2', name: 'IC Markets 实盘', broker: 'IC Markets', accountType: 'live', baseCurrency: 'USD', initialBalance: 25_000, currentBalance: 27_310.5 },
  { id: 'acc-3', name: '练习账户', broker: 'MT5 Demo', accountType: 'demo', baseCurrency: 'USD', initialBalance: 10_000, currentBalance: 9_120.4 },
]

const STRATEGY_IDS = ['st-1', 'st-2', 'st-3', 'st-4', null]
const TAG_POOL = ['tg-1', 'tg-2', 'tg-3', 'tg-4', 'tg-5', 'tg-6', 'tg-7', 'tg-8']

function round(v: number, digits: number) {
  const f = 10 ** digits
  return Math.round(v * f) / f
}

function priceDigits(pipSize: number) {
  return pipSize >= 1 ? 2 : pipSize === 0.1 ? 2 : pipSize === 0.01 ? 3 : 5
}

/** 生成交易日序列（跳过周末），倒数第 N 天到今天 */
function tradingDays(): Date[] {
  const days: Date[] = []
  const cursor = new Date(END_DATE)
  while (days.length < TRADING_DAYS) {
    const dow = cursor.getUTCDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return days.reverse()
}

function buildTrades(): Trade[] {
  faker.seed(SEED)
  const rnd = () => faker.number.float({ min: 0, max: 1 })
  const days = tradingDays()
  const trades: Trade[] = []

  // 把总笔数分配到各交易日，制造有些日子密集、有些日子只有 1-2 笔的分布
  const perDay = days.map(() => faker.number.int({ min: 0, max: 26 }))
  const sum = perDay.reduce((a, b) => a + b, 0)
  const scale = TOTAL_TRADES / sum

  days.forEach((day, di) => {
    const count = Math.round(perDay[di] * scale)
    for (let i = 0; i < count; i++) {
      const inst = pickInstrument(rnd)
      const digits = priceDigits(inst.pipSize)
      const direction = rnd() < 0.5 ? 'long' : 'short'

      // 胜率约 64%，但平均亏损大于平均盈利 —— 复现截图中「高胜率却整体亏损」的形态
      const roll = rnd()
      const result: TradeResult = roll < 0.638 ? 'win' : roll < 0.995 ? 'loss' : 'breakeven'

      const lots =
        inst.kind === 'index'
          ? faker.number.float({ min: 0.5, max: 4, fractionDigits: 1 })
          : faker.number.float({ min: 0.5, max: 6, fractionDigits: 1 })

      // 先定点数幅度，再倒推平仓价，保证点数与价格一致
      const winPips = faker.number.float({ min: 8, max: 120, fractionDigits: 1 })
      const lossPips = faker.number.float({ min: 15, max: 300, fractionDigits: 1 })
      const movePips = result === 'win' ? winPips : result === 'loss' ? -lossPips : 0

      const entryPrice = round(
        inst.basePrice + faker.number.float({ min: -inst.dailyRange, max: inst.dailyRange }),
        digits,
      )
      const dirSign = direction === 'long' ? 1 : -1
      const exitPrice = round(entryPrice + movePips * inst.pipSize * dirSign, digits)

      const grossPnl = round(movePips * inst.valuePerPipPerLot * lots, 2)
      const commissions = round(lots * faker.number.float({ min: 2, max: 8 }), 2)
      const durationSec = faker.number.int({ min: 45, max: 4 * 3600 })
      const swap = durationSec > 8 * 3600 ? round(-lots * 1.2, 2) : 0
      const netPnl = round(grossPnl - commissions + swap, 2)

      const openedAt = new Date(day)
      openedAt.setUTCHours(faker.number.int({ min: 1, max: 20 }), faker.number.int({ min: 0, max: 59 }), faker.number.int({ min: 0, max: 59 }), 0)
      const closedAt = new Date(openedAt.getTime() + durationSec * 1000)

      const adjustedCost = entryPrice * lots * inst.contractMultiplier
      const riskPips = result === 'loss' ? lossPips * 1.05 : lossPips
      const tradeRisk = round(riskPips * inst.valuePerPipPerLot * lots, 2)

      trades.push({
        id: `t-${trades.length + 1}`,
        accountId: faker.helpers.arrayElement(ACCOUNTS).id,
        symbol: inst.symbol,
        direction,
        status: 'closed',
        result,
        openedAt: openedAt.toISOString(),
        closedAt: closedAt.toISOString(),
        durationSec,
        quantity: lots,
        avgEntryPrice: entryPrice,
        avgExitPrice: exitPrice,
        grossPnl,
        commissions,
        swap,
        netPnl,
        netRoi: round((netPnl / adjustedCost) * 100, 4),
        pips: round(movePips, 1),
        plannedR: round(faker.number.float({ min: 1, max: 6 }), 2),
        realizedR: tradeRisk ? round(netPnl / tradeRisk, 2) : null,
        strategyId: faker.helpers.arrayElement(STRATEGY_IDS),
        tagIds: faker.helpers.arrayElements(TAG_POOL, faker.number.int({ min: 0, max: 3 })),
        rating: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.4 }) ?? null,
        hasNote: rnd() < 0.25,
      })
    }
  })

  // 追加几笔持仓中交易，供「持仓中」Tab 使用
  for (let i = 0; i < 3; i++) {
    const inst = pickInstrument(rnd)
    const digits = priceDigits(inst.pipSize)
    const openedAt = new Date(END_DATE.getTime() - faker.number.int({ min: 30, max: 300 }) * 60_000)
    trades.push({
      id: `t-open-${i + 1}`,
      accountId: ACCOUNTS[0].id,
      symbol: inst.symbol,
      direction: rnd() < 0.5 ? 'long' : 'short',
      status: 'open',
      result: 'breakeven',
      openedAt: openedAt.toISOString(),
      closedAt: null,
      durationSec: Math.floor((END_DATE.getTime() - openedAt.getTime()) / 1000),
      quantity: 1,
      avgEntryPrice: round(inst.basePrice, digits),
      avgExitPrice: null,
      grossPnl: 0,
      commissions: 0,
      swap: 0,
      netPnl: 0,
      netRoi: 0,
      pips: 0,
      plannedR: null,
      realizedR: null,
      strategyId: null,
      tagIds: [],
      rating: null,
      hasNote: false,
    })
  }

  return trades.sort((a, b) => a.openedAt.localeCompare(b.openedAt))
}

/** 由交易倒推日聚合。真实实现在后端物化，此处即时计算 */
function buildDailyStats(trades: Trade[]): DailyStat[] {
  const byDate = new Map<string, Trade[]>()
  for (const t of trades) {
    if (t.status !== 'closed' || !t.closedAt) continue
    const d = t.closedAt.slice(0, 10)
    const arr = byDate.get(d)
    if (arr) arr.push(t)
    else byDate.set(d, [t])
  }

  let cum = 0
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => {
      const winners = list.filter((t) => t.result === 'win')
      const losers = list.filter((t) => t.result === 'loss')
      const netPnl = round(list.reduce((s, t) => s + t.netPnl, 0), 2)
      const grossWin = winners.reduce((s, t) => s + t.netPnl, 0)
      const grossLoss = Math.abs(losers.reduce((s, t) => s + t.netPnl, 0))
      cum = round(cum + netPnl, 2)
      return {
        date,
        totalTrades: list.length,
        winners: winners.length,
        losers: losers.length,
        grossPnl: round(list.reduce((s, t) => s + t.grossPnl, 0), 2),
        commissions: round(list.reduce((s, t) => s + t.commissions, 0), 2),
        netPnl,
        volume: round(list.reduce((s, t) => s + t.quantity, 0), 2),
        winRate: round((winners.length / list.length) * 100, 2),
        profitFactor: grossLoss ? round(grossWin / grossLoss, 2) : 0,
        cumNetPnl: cum,
        hasNote: list.some((t) => t.hasNote),
      }
    })
}

export const TRADES = buildTrades()
export const DAILY_STATS = buildDailyStats(TRADES)
export { instrumentBySymbol }
