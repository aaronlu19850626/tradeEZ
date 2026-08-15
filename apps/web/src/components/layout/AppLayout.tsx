import { Outlet, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'
import { ChatWidget } from '@/features/support/ChatWidget'
import { useUIStore } from '@/stores/ui-store'
import { JournalPanel, ProductRail } from './SideNav'
import { TopBar } from './TopBar'

/**
 * 应用外壳：顶栏 + 深色导航条 + 浅色内容区。
 *
 * 浅色区（含二级菜单面板）整体带左上圆角，嵌在深色壳内；
 * 侧栏收起时深色条消失，圆角一并去掉，浅色区直接贴边。
 */
export function AppLayout() {
  useDocumentTitle()
  const hidden = useUIStore((s) => s.sidebarHidden)
  const inJournal = useLocation().pathname.startsWith('/journal')

  return (
    <div className="flex h-full flex-col bg-shell-900">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <ProductRail />

        <div
          className={cn(
            'flex min-w-0 flex-1 overflow-hidden bg-page',
            // 深色条可见时才留圆角，收起后贴边显示
            !hidden && 'rounded-tl-2xl',
          )}
        >
          {inJournal && <JournalPanel />}
          <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
