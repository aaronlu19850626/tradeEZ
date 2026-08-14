# @tradeez/api

TradeEZ 后端。NestJS（Fastify 适配器）+ Drizzle + PostgreSQL。

## 本地运行

```bash
cp .env.example .env.local     # 填入真实 DATABASE_URL 与 JWT_SECRET
pnpm db:migrate                # 执行迁移
pnpm dev                       # http://localhost:3000/api
```

启动时会校验环境变量，缺失或格式错误直接退出并指出字段，不会带着错误配置运行。

## 已完成

- 环境变量校验（zod，启动即校验）
- 数据库连接（Drizzle + postgres-js，连接池 10，进程退出时优雅关闭）
- 完整表结构与首个迁移文件
- 健康检查 `GET /api/health`，含数据库连通性与延迟
- zod 校验管道，直接复用 `@tradeez/shared` 的 schema

## 尚未实现

认证模块、业务接口、Redis/BullMQ 队列、Row Level Security 策略。

## 数据库设计要点

**金额一律 numeric，不用浮点。** 价格 `numeric(20,8)`、金额 `numeric(18,4)`、
数量 `numeric(18,8)`。浮点误差在数千笔累加后会让净盈亏对不上账。
postgres-js 配置为保留 numeric 的字符串形态，避免在 JS 侧转 number 时丢精度 ——
取出来的金额是 string，运算需用 decimal 库或在 SQL 内完成。

**executions 是唯一事实来源，trades 由其派生**（F-2-05）。
`(account_id, external_id)` 唯一索引保证导入幂等。

**daily_stats 是物化汇总表**，导入后在队列中按受影响日期区间增量重算。
不用 materialized view —— 后者只能全量刷新，多用户下代价过大。

**索引取舍**：`trades_open_idx` 是部分索引（`WHERE status = 'open'`），
因为持仓中交易占比极低，全量索引浪费空间；
`users_email_lower_idx` 是函数索引，保证邮箱大小写不敏感唯一。

## 迁移

```bash
pnpm db:generate    # 改完 schema 生成迁移 SQL
pnpm db:migrate     # 执行
pnpm db:studio      # 可视化查看数据
```

迁移文件入库，不用 `db:push` 直改生产库。

## 目录

```
src/
├── config/env.ts           # 环境变量 schema 与校验
├── db/
│   ├── db.module.ts        # 全局数据库模块
│   └── schema/             # users.ts（认证）、trading.ts（交易）
├── common/                 # zod 校验管道等横切关注点
├── health/                 # 健康检查
├── app.module.ts
└── main.ts                 # 全局前缀 /api，可选 CORS，优雅关闭
```
