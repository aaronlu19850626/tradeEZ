import { PlaceholderPage } from '@/components/common/PlaceholderPage'

/** 日志模块页面占位。逐页替换为真实实现时从此文件移出 */

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="仪表盘"
      reqId="F-4"
      showFilterBar
      notes={[
        'F-4-02 核心指标卡：净盈亏 / 交易胜率 / 盈亏比 / 交易日胜率 / 平均盈亏比',
        'F-4-03 综合评分六维雷达 + 0–100 刻度条',
        'F-4-04 进度追踪热力图 + 今日得分 + 每日清单',
        'F-4-05 每日累计净盈亏（面积图）',
        'F-4-06 每日净盈亏（柱状图）',
        'F-4-07 近期交易 / 持仓中双 Tab',
        'F-4-08 账户净值双折线',
        'F-4-09 月度日历 + 周汇总列',
        'F-4-10 回撤面积图',
        'F-4-11 交易时段散点 / F-4-12 持仓时长散点',
        'F-4-13 图表下钻 / F-4-14 布局自定义 / F-4-15 查看我的一天',
      ]}
    />
  )
}

export function DayViewPage() {
  return (
    <PlaceholderPage
      title="日视图"
      reqId="F-5"
      showFilterBar
      notes={[
        'F-5-01 日 / 周切换器',
        'F-5-02 侧边月历（盈亏日着色，点击定位）',
        'F-5-03 日卡片头部：日期、净盈亏、AI 复盘 / 回放 / 笔记 / 附件',
        'F-5-04 日卡片迷你曲线 + 8 项指标网格',
        'F-5-05 展开显示当日逐笔交易',
        'F-5-06 周视图聚合',
      ]}
    />
  )
}

export function TradesPage() {
  return (
    <PlaceholderPage
      title="交易列表"
      reqId="F-6"
      showFilterBar
      notes={[
        'F-6-01 顶部四张汇总卡',
        'F-6-02 默认 11 列 / F-6-03 可选列与列设置',
        'F-6-04 排序 + 虚拟滚动（2300 行）',
        'F-6-05 点击行滑出交易详情抽屉（F-7）',
        'F-6-06 批量操作 / F-6-07 导出',
      ]}
    />
  )
}

export function NotebookPage() {
  return (
    <PlaceholderPage
      title="笔记本"
      reqId="F-9-05"
      notes={['集中浏览所有笔记，按日期 / 类型 / 标签 / 关键词检索', '页面细节待补充需求']}
    />
  )
}

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="报表"
      reqId="F-15"
      showFilterBar
      notes={['报表清单与分析维度待补充需求（按品种/时段/星期/持仓时长/策略/标签）']}
    />
  )
}

export function StrategiesPage() {
  return (
    <PlaceholderPage
      title="策略"
      reqId="F-8-04"
      notes={['F-8-04 策略定义（名称、描述、规则清单）', 'F-8-06 策略绩效与规则遵守率对比']}
    />
  )
}

export function ReplayPage() {
  return <PlaceholderPage title="交易回放" reqId="F-14" notes={['行情数据源与回放控制待补充需求']} />
}

export function ProgressPage() {
  return (
    <PlaceholderPage
      title="进度追踪"
      reqId="F-12"
      notes={['F-12-01 活跃度热力图', 'F-12-02 每日检查清单', 'F-12-03 目标设定（待补充）']}
    />
  )
}

export function ResourcesPage() {
  return <PlaceholderPage title="资源" reqId="F-18" notes={['学院课程与社区入口待补充需求']} />
}

/** 产品级其他模块 */

export function BacktestingPage() {
  return <PlaceholderPage title="回测" reqId="F-13" notes={['行情源、策略定义方式、结果报表待补充需求']} />
}

export function AgentsPage() {
  return <PlaceholderPage title="智能体" reqId="F-16" notes={['智能体类型、触发时机、运行记录待补充需求']} />
}

export function MentorPage() {
  return <PlaceholderPage title="导师模式" reqId="F-16" notes={['具体形态待补充需求']} />
}

export function PropSyncPage() {
  return (
    <PlaceholderPage
      title="自营账户同步"
      reqId="F-17"
      notes={['支持平台清单、连接方式、自营规则监控（日亏限额/总回撤/盈利目标）待补充需求']}
    />
  )
}

export function NotFoundPage() {
  return <PlaceholderPage title="页面不存在" reqId="404" notes={['检查地址或从左侧导航进入']} />
}
