# TradeEZ Web

对标 TradeZella 的交易复盘平台前端。
代码中的 `F-x-xx` 注释对应需求文档编号（需求文档与开发进度在仓库外单独维护）。

## 运行

```bash
npm install
npm run dev        # http://localhost:5173，默认走 MSW 模拟数据
npm run build      # 类型检查 + 生产构建
npm run test       # 数据工厂与聚合逻辑的冒烟测试
npm run typecheck
npm run lint
```

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | React 19 + Vite 8 + TS 6 | 纯 SPA，产物为静态文件 |
| 样式 | Tailwind CSS v4 | 设计令牌集中在 `src/index.css` 的 `@theme` |
| 图标 | lucide-react | |
| 图表 | ECharts | 已安装待接入；覆盖面积/柱状/雷达/散点/日历热力/K 线 |
| 数据 | TanStack Query | 缓存与请求状态 |
| 表格 | TanStack Table（待接入） | 2300 行需虚拟滚动 |
| 路由 | React Router v7 | |
| 状态 | Zustand + persist | 全局筛选器、UI 偏好 |
| Mock | MSW + faker（固定 seed） | 网络层拦截 |
| 测试 | Vitest | |

## 前后端分离的关键约定

业务代码只通过 `src/api/client.ts` 发真实 `fetch('/api/...')`，
mock 由 MSW 在 **Service Worker 网络层** 拦截。后端就绪后：

1. `.env.development` 里 `VITE_USE_MOCK=false`
2. 请求经 `vite.config.ts` 的 proxy 转发到 `http://localhost:8080`

业务代码无需改动。`src/mocks/handlers.ts` 里的筛选与聚合逻辑即接口契约，
可直接作为后端实现依据。

## 目录结构

```
src/
├── api/
│   ├── client.ts          # fetch 封装、ApiError、query string 拼装
│   └── queries.ts         # TanStack Query hooks + 查询键
├── components/
│   ├── common/            # PageHeader、PlaceholderPage
│   └── layout/            # AppLayout、TopBar、SideNav、FilterBar
├── config/nav.ts          # 两层导航配置（F-1-04）
├── features/dev/          # 骨架自检面板（页面填充后删除）
├── lib/utils.ts           # cn、金额/百分比/R/时长格式化、盈亏着色（F-1-07）
├── mocks/
│   ├── browser.ts         # MSW worker 启动
│   ├── handlers.ts        # 接口实现：筛选、排序、分页、指标聚合
│   └── data/
│       ├── instruments.ts # 品种参数：点值、合约乘数、抽样权重（F-10-06）
│       ├── generate.ts    # seeded 数据工厂 + 日聚合
│       └── generate.test.ts
├── pages/                 # 路由页面（当前多为占位）
├── stores/                # filter-store（F-1-05）、ui-store
├── types/index.ts         # 领域类型
├── router.tsx
├── App.tsx                # QueryClientProvider + RouterProvider
└── main.tsx               # MSW 先启动，再渲染
```

## 已实现（骨架）

- 顶栏、两层侧边栏（含日志模块内的图标细条）、折叠状态持久化
- 全局筛选器：货币 / 日期范围 / 账户，跨页保持 + 刷新恢复
- 全部路由与页面占位，占位页列出该页待实现的需求条目
- 模拟数据：约 2300 笔交易，9 个品种（黄金 + 外汇 + 指数），3 个账户，
  180 个交易日；胜率约 64% 但整体净亏损，复现截图中的数据形态
- 接口：`/accounts`、`/metrics/summary`、`/daily-stats`、`/trades`、`/trades/:id`
- 首页底部「骨架自检」面板：验证 Query → fetch → MSW → 聚合全链路

## 待接入

- Filters 弹层的完整条件项（F-1-06）与筛选预设
- shadcn/ui 原语（Drawer / Tabs / Dropdown / Popover / Dialog / Tooltip）
- ECharts 图表组件与统一主题
- `lib/metrics` 指标计算模块（当前聚合逻辑临时放在 MSW handler 内）
- 各业务页面内容
