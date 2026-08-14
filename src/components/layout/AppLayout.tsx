import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

/** 应用外壳：顶栏 + 侧栏 + 内容区 */
export function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
