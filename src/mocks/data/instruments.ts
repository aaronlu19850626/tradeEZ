/**
 * 品种参数表。F-10-06：合约乘数与点值用于点数、盈亏换算。
 * 多品种混合：黄金 + 主要外汇对 + 指数。
 */

export interface Instrument {
  symbol: string
  name: string
  kind: 'metal' | 'forex' | 'index'
  basePrice: number
  /** 日内波动幅度（价格绝对值） */
  dailyRange: number
  /** 1 pip 对应的价格增量 */
  pipSize: number
  /** 每手每点的货币价值 */
  valuePerPipPerLot: number
  contractMultiplier: number
  /** 生成数据时的抽样权重 */
  weight: number
}

export const INSTRUMENTS: Instrument[] = [
  { symbol: 'XAUUSD', name: '黄金', kind: 'metal', basePrice: 4330, dailyRange: 45, pipSize: 0.1, valuePerPipPerLot: 10, contractMultiplier: 100, weight: 40 },
  { symbol: 'GOLD', name: '黄金(别名)', kind: 'metal', basePrice: 4330, dailyRange: 45, pipSize: 0.1, valuePerPipPerLot: 10, contractMultiplier: 100, weight: 8 },
  { symbol: 'XAU', name: '黄金(别名)', kind: 'metal', basePrice: 4330, dailyRange: 45, pipSize: 0.1, valuePerPipPerLot: 10, contractMultiplier: 100, weight: 6 },
  { symbol: 'EURUSD', name: '欧元美元', kind: 'forex', basePrice: 1.0850, dailyRange: 0.0075, pipSize: 0.0001, valuePerPipPerLot: 10, contractMultiplier: 100_000, weight: 14 },
  { symbol: 'GBPUSD', name: '英镑美元', kind: 'forex', basePrice: 1.2720, dailyRange: 0.0090, pipSize: 0.0001, valuePerPipPerLot: 10, contractMultiplier: 100_000, weight: 10 },
  { symbol: 'USDJPY', name: '美元日元', kind: 'forex', basePrice: 152.40, dailyRange: 0.95, pipSize: 0.01, valuePerPipPerLot: 9.2, contractMultiplier: 100_000, weight: 8 },
  { symbol: 'AUDUSD', name: '澳元美元', kind: 'forex', basePrice: 0.6580, dailyRange: 0.0060, pipSize: 0.0001, valuePerPipPerLot: 10, contractMultiplier: 100_000, weight: 5 },
  { symbol: 'NAS100', name: '纳斯达克100', kind: 'index', basePrice: 20450, dailyRange: 260, pipSize: 1, valuePerPipPerLot: 1, contractMultiplier: 1, weight: 6 },
  { symbol: 'US30', name: '道琼斯30', kind: 'index', basePrice: 43800, dailyRange: 420, pipSize: 1, valuePerPipPerLot: 1, contractMultiplier: 1, weight: 3 },
]

export const instrumentBySymbol = new Map(INSTRUMENTS.map((i) => [i.symbol, i]))

/** 按权重抽取品种 */
export function pickInstrument(rnd: () => number): Instrument {
  const total = INSTRUMENTS.reduce((s, i) => s + i.weight, 0)
  let r = rnd() * total
  for (const i of INSTRUMENTS) {
    r -= i.weight
    if (r <= 0) return i
  }
  return INSTRUMENTS[0]
}
