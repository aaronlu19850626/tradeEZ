import { sql } from 'drizzle-orm'
import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users.js'

/**
 * 交易数据表。对应需求 F-2、F-10。
 *
 * 金额一律用 numeric 而非 double：浮点误差在数千笔累加后会让净盈亏对不上账。
 * 价格 numeric(20,8) 留足加密货币精度，金额 numeric(18,4)。
 */

const money = (name: string) => numeric(name, { precision: 18, scale: 4 })
const price = (name: string) => numeric(name, { precision: 20, scale: 8 })
const qty = (name: string) => numeric(name, { precision: 18, scale: 8 })

/** 交易账户。F-1-02 */
export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    broker: text('broker'),
    accountType: text('account_type').notNull().default('live'), // live | demo | prop
    baseCurrency: text('base_currency').notNull().default('USD'),
    initialBalance: money('initial_balance').notNull().default('0'),
    /** 分批平仓的盈亏归集口径，附录 A #1：fifo | weighted */
    costBasisMethod: text('cost_basis_method').notNull().default('fifo'),
    syncSource: text('sync_source').notNull().default('csv'), // csv | api | propfirm
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    isActive: text('is_active').notNull().default('true'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('accounts_user_idx').on(t.userId)],
)

/** 品种参数。F-10-06，内置常见品种，用户可覆盖（userId 为 null 表示系统内置） */
export const instruments = pgTable(
  'instruments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    displayName: text('display_name'),
    instrumentType: text('instrument_type').notNull(), // forex | metal | index | futures | stock | crypto
    contractMultiplier: qty('contract_multiplier').notNull().default('1'),
    pipSize: price('pip_size').notNull().default('0.0001'),
    /** 归一到的主品种，用于 XAUUSD/GOLD/XAU 视为同一品种（F-2-06） */
    canonicalSymbol: text('canonical_symbol'),
  },
  (t) => [uniqueIndex('instruments_user_symbol_idx').on(t.userId, t.symbol)],
)

/**
 * 成交（fill）。唯一事实来源，trades 由此派生（F-2-05）。
 * externalId 用于导入幂等：同一条成交重复导入不产生重复数据（F-2-03）。
 */
export const executions = pgTable(
  'executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    tradeId: uuid('trade_id'),
    symbol: text('symbol').notNull(),
    side: text('side').notNull(), // buy | sell
    quantity: qty('quantity').notNull(),
    price: price('price').notNull(),
    executedAt: timestamp('executed_at', { withTimezone: true }).notNull(),
    commission: money('commission').notNull().default('0'),
    fee: money('fee').notNull().default('0'),
    swap: money('swap').notNull().default('0'),
    orderId: text('order_id'),
    externalId: text('external_id'),
    importBatchId: uuid('import_batch_id'),
  },
  (t) => [
    uniqueIndex('executions_account_external_idx').on(t.accountId, t.externalId),
    index('executions_account_symbol_time_idx').on(t.accountId, t.symbol, t.executedAt),
    index('executions_trade_idx').on(t.tradeId),
  ],
)

/** 交易（由成交聚合而来）。F-2-05、F-10 */
export const trades = pgTable(
  'trades',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    direction: text('direction').notNull(), // long | short
    status: text('status').notNull().default('open'), // open | closed
    /** win | loss | breakeven，平仓后由净盈亏判定 */
    result: text('result'),

    openedAt: timestamp('opened_at', { withTimezone: true }).notNull(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    durationSec: integer('duration_sec'),
    /** 交易日归属，按账户所属用户时区切分（附录 A #8） */
    tradeDate: date('trade_date').notNull(),

    quantity: qty('quantity').notNull(),
    avgEntryPrice: price('avg_entry_price').notNull(),
    avgExitPrice: price('avg_exit_price'),

    grossPnl: money('gross_pnl').notNull().default('0'),
    commissions: money('commissions').notNull().default('0'),
    swap: money('swap').notNull().default('0'),
    netPnl: money('net_pnl').notNull().default('0'),
    adjustedCost: money('adjusted_cost'),
    netRoi: numeric('net_roi', { precision: 12, scale: 6 }),
    pips: numeric('pips', { precision: 14, scale: 2 }),

    stopLossPrice: price('stop_loss_price'),
    targetPrice: price('target_price'),
    tradeRisk: money('trade_risk'),
    initialTarget: money('initial_target'),
    plannedR: numeric('planned_r', { precision: 10, scale: 2 }),
    realizedR: numeric('realized_r', { precision: 10, scale: 2 }),
    maePrice: price('mae_price'),
    mfePrice: price('mfe_price'),

    strategyId: uuid('strategy_id'),
    rating: integer('rating'),
    aiScale: numeric('ai_scale', { precision: 6, scale: 2 }),
    aiInsight: text('ai_insight'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // 交易列表默认按开仓时间倒序，且几乎总带账户过滤
    index('trades_account_opened_idx').on(t.accountId, t.openedAt),
    index('trades_account_date_idx').on(t.accountId, t.tradeDate),
    index('trades_symbol_idx').on(t.accountId, t.symbol),
    // 持仓中交易数量少，用部分索引避免全表扫
    index('trades_open_idx')
      .on(t.accountId)
      .where(sql`status = 'open'`),
  ],
)

/**
 * 日聚合。物化汇总表，导入后在队列中按受影响日期区间增量重算。
 * 不用 materialized view —— 后者只能全量刷新，多用户下代价过大。
 */
export const dailyStats = pgTable(
  'daily_stats',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    tradeDate: date('trade_date').notNull(),
    totalTrades: integer('total_trades').notNull().default(0),
    winners: integer('winners').notNull().default(0),
    losers: integer('losers').notNull().default(0),
    breakeven: integer('breakeven').notNull().default(0),
    grossPnl: money('gross_pnl').notNull().default('0'),
    commissions: money('commissions').notNull().default('0'),
    netPnl: money('net_pnl').notNull().default('0'),
    volume: qty('volume').notNull().default('0'),
    winRate: numeric('win_rate', { precision: 6, scale: 2 }),
    profitFactor: numeric('profit_factor', { precision: 12, scale: 2 }),
    dailyScore: integer('daily_score'),
    checklistTotal: integer('checklist_total'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('daily_stats_pk').on(t.accountId, t.tradeDate)],
)

/** 导入批次。F-2-03、F-2-08（按批次撤销导入） */
export const importBatches = pgTable('import_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  source: text('source').notNull(),
  fileName: text('file_name'),
  rowCount: integer('row_count').notNull().default(0),
  inserted: integer('inserted').notNull().default(0),
  skippedDuplicate: integer('skipped_duplicate').notNull().default(0),
  failed: integer('failed').notNull().default(0),
  status: text('status').notNull().default('pending'),
  errorLog: jsonb('error_log'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
