import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 金额格式化。F-1-07：2 位小数 + 千分位，正负号保留 */
export function formatMoney(value: number, currency = '$') {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${currency}${abs}`
}

/** 图表标签用的缩写金额：$10.1K / $1.24M */
export function formatMoneyShort(value: number, currency = '$') {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}${currency}${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}${currency}${(abs / 1_000).toFixed(1)}K`
  return `${sign}${currency}${abs.toFixed(2)}`
}

export function formatPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`
}

export function formatR(value: number) {
  return `${value.toFixed(2)}R`
}

/** 盈亏着色。F-1-07：正绿负红零灰 */
export function pnlColor(value: number) {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-flat'
}

/** 持仓时长：17m 20s / 2h 5m / 3d 4h */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  if (h < 24) return rm ? `${h}h ${rm}m` : `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h`
}
