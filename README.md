# tradeEZ

交易复盘平台。对标 TradeZella，面向零售交易者的交易日志与绩效分析工具。

生产站点 **https://tradeez.cn**

## 快速开始

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

演示账号 `demo@tradeEZ.cn` / `abcd1234`（登录页已预填）。
默认走 MSW 模拟数据（约 2300 笔交易、9 个品种、3 个账户），无需后端即可开发。

## 命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 前端开发服务器（自动先构建 shared） |
| `pnpm dev:api` | 后端开发服务器 |
| `pnpm -r typecheck` | 全量类型检查 |
| `pnpm -r lint` | 全量 lint |
| `pnpm -r test` | 全量测试 |
| `pnpm -r build` | 全量构建 |
| `./scripts/deploy.sh` | 发版到生产 |

提交前四项须全绿：typecheck / lint / test / build。

## 结构

```
apps/web/          前端 React 19 + Vite + Tailwind v4
apps/api/          后端 NestJS + Drizzle + PostgreSQL
packages/shared/   前后端共享的 zod schema 与领域类型
deploy/            Docker Compose + Caddyfile + Dockerfile
scripts/deploy.sh  一键发版
```

## 关键约定

完整规范见项目文档（仓库外单独维护），以下是最容易踩的几条：

**金额一律用 `numeric`，禁止浮点。** 价格 `numeric(20,8)`、金额 `numeric(18,4)`。
浮点误差在数千笔累加后会让净盈亏对不上账。postgres-js 保留 numeric 的字符串形态，
后端取出来是 `string`，运算需用 decimal 库或在 SQL 内完成。

**颜色只用语义令牌。** 写 `bg-card` / `text-fg` / `border-line`，不写 `bg-white` / `text-slate-500`。
明暗主题各给一组变量值，切换主题只换 `apps/web/src/index.css` 里的变量。

**界面文案走 i18n 字典。** 字典在 `apps/web/src/i18n/locales.ts`，组件用 `useT()` 取。
导航配置存 `labelKey` 而非 `label`。品牌字标 `tradeEZ` 是固定资产，不进字典。

**前后端共用一份 zod schema。** 校验规则写在 `packages/shared`，两端都 import 它。

**业务代码走真实 `fetch`，mock 在网络层拦截。** 不写假的 service 函数。
后端就绪后置 `VITE_USE_MOCK=false` 即可切换，调用点不改。

## 技术栈

React 19 · Vite 8 · TypeScript 6 · Tailwind v4 · TanStack Query · Zustand · MSW · ECharts
NestJS · Fastify · Drizzle ORM · PostgreSQL 17 · Redis · Docker Compose · Caddy

## 部署

```bash
./scripts/deploy.sh
```

架构：Caddy 托管前端静态文件并反代 `/api` 到 NestJS，Postgres 与 Redis 仅绑回环。
详见 `deploy/README.md`。
