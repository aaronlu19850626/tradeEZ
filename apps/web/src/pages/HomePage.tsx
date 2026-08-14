import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { MockHealthCheck } from '@/features/dev/MockHealthCheck'

export default function HomePage() {
  return (
    <>
      <PlaceholderPage
        title="首页"
        reqId="F-3"
        notes={[
          'F-3-01 问候标题（按本地时间）',
          'F-3-02 AI 助手卡 + 动态建议文案',
          'F-3-03 快捷提问标签',
          'F-3-04 探索产品 2×2 卡片',
          'F-3-05 推荐关注任务列表',
          'F-3-06 资源链接列表',
          'F-3-07 新用户引导清单',
        ]}
      />
      <MockHealthCheck />
    </>
  )
}
