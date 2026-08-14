import { describe, expect, it } from 'vitest'
import { DAILY_STATS, TRADES } from './generate'
import { instrumentBySymbol } from './instruments'

/** 骨架冒烟测试：确认模拟数据规模、自洽性与日聚合正确 */
describe('模拟数据工厂', () => {
  it('生成约 2300 笔交易，含持仓中交易', () => {
    expect(TRADES.length).toBeGreaterThan(2200)
    expect(TRADES.length).toBeLessThan(2400)
    expect(TRADES.filter((t) => t.status === 'open')).toHaveLength(3)
  })

  it('覆盖多个品种', () => {
    const symbols = new Set(TRADES.map((t) => t.symbol))
    expect(symbols.size).toBeGreaterThanOrEqual(7)
  })

  it('净盈亏与毛盈亏、费用自洽', () => {
    for (const t of TRADES.filter((x) => x.status === 'closed').slice(0, 200)) {
      expect(t.netPnl).toBeCloseTo(t.grossPnl - t.commissions + t.swap, 2)
    }
  })

  it('点数与开平仓价方向一致', () => {
    for (const t of TRADES.filter((x) => x.status === 'closed').slice(0, 200)) {
      const inst = instrumentBySymbol.get(t.symbol)!
      const dir = t.direction === 'long' ? 1 : -1
      const pips = ((t.avgExitPrice! - t.avgEntryPrice) / inst.pipSize) * dir
      expect(pips).toBeCloseTo(t.pips, 0)
    }
  })

  it('胜率约 64%，但整体净亏损（复现截图形态）', () => {
    const closed = TRADES.filter((t) => t.status === 'closed')
    const winRate = closed.filter((t) => t.result === 'win').length / closed.length
    expect(winRate).toBeGreaterThan(0.6)
    expect(winRate).toBeLessThan(0.68)
    expect(closed.reduce((s, t) => s + t.netPnl, 0)).toBeLessThan(0)
  })

  it('日聚合的累计值等于逐日净盈亏累加', () => {
    let cum = 0
    for (const d of DAILY_STATS) {
      cum = +(cum + d.netPnl).toFixed(2)
      expect(d.cumNetPnl).toBeCloseTo(cum, 1)
      expect(d.winners + d.losers).toBeLessThanOrEqual(d.totalTrades)
    }
    expect(DAILY_STATS.length).toBeGreaterThan(100)
  })
})
