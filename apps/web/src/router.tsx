import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { RedirectIfAuthed, RequireAuth } from '@/features/auth/RequireAuth'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import HomePage from '@/pages/HomePage'
import {
  AgentsPage,
  BacktestingPage,
  ContactPage,
  DashboardPage,
  DayViewPage,
  MentorPage,
  NewsPage,
  NotFoundPage,
  NotebookPage,
  ProgressPage,
  PropSyncPage,
  ReferralPage,
  ReplayPage,
  ReportsPage,
  ResourcesPage,
  SettingsPage,
  StrategiesPage,
  TradesPage,
  UniversityPage,
} from '@/pages/placeholders'

export const router = createBrowserRouter([
  // 认证页（F-19）。已登录时访问登录/注册直接进应用
  {
    element: <AuthLayout />,
    children: [
      {
        element: <RedirectIfAuthed />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      // 找回密码不拦已登录用户，便于登录状态下改密码
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // 业务页，需登录（F-19-06）
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },

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

          { path: 'agents', element: <AgentsPage /> },
          { path: 'mentor', element: <MentorPage /> },
          { path: 'news', element: <NewsPage /> },

          { path: 'contact', element: <ContactPage /> },
          { path: 'university', element: <UniversityPage /> },
          { path: 'referral', element: <ReferralPage /> },
          { path: 'settings', element: <SettingsPage /> },

          // 已从菜单移出但保留可直达，避免旧链接失效
          { path: 'backtesting', element: <BacktestingPage /> },
          { path: 'prop-sync', element: <PropSyncPage /> },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
