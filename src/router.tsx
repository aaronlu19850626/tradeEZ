import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import {
  AgentsPage,
  BacktestingPage,
  DashboardPage,
  DayViewPage,
  MentorPage,
  NotFoundPage,
  NotebookPage,
  ProgressPage,
  PropSyncPage,
  ReplayPage,
  ReportsPage,
  ResourcesPage,
  StrategiesPage,
  TradesPage,
} from '@/pages/placeholders'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // 日志模块（F-4 ~ F-9）
      { path: 'journal', element: <Navigate to="/journal/dashboard" replace /> },
      { path: 'journal/dashboard', element: <DashboardPage /> },
      { path: 'journal/day-view', element: <DayViewPage /> },
      { path: 'journal/trades', element: <TradesPage /> },
      { path: 'journal/notebook', element: <NotebookPage /> },
      { path: 'journal/reports', element: <ReportsPage /> },
      { path: 'journal/strategies', element: <StrategiesPage /> },
      { path: 'journal/replay', element: <ReplayPage /> },
      { path: 'journal/progress', element: <ProgressPage /> },
      { path: 'journal/resources', element: <ResourcesPage /> },

      // 其他产品模块（F-13 ~ F-18）
      { path: 'backtesting', element: <BacktestingPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'mentor', element: <MentorPage /> },
      { path: 'prop-sync', element: <PropSyncPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
