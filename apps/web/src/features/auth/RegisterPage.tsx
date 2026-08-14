import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { fieldErrors, registerSchema } from '@/lib/validation'
import { AuthCard } from './AuthLayout'
import { WechatButton } from './WechatButton'

/** 注册页。F-19-03：邮箱密码直接注册，不做邮箱验证环节 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreed, setAgreed] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = registerSchema.safeParse({
      nickname: String(fd.get('nickname') ?? ''),
      email: String(fd.get('email') ?? ''),
      password: String(fd.get('password') ?? ''),
      confirmPassword: String(fd.get('confirmPassword') ?? ''),
      agreed,
    })

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})

    try {
      const { nickname, email, password } = parsed.data
      await register.mutateAsync({ nickname, email, password })
      // 注册即登录，直接进仪表盘
      navigate('/journal/dashboard', { replace: true })
    } catch {
      // 错误由 register.error 渲染
    }
  }

  return (
    <AuthCard
      title="注册"
      subtitle="开始记录并复盘你的每一笔交易"
      footer={
        <>
          已有账号？{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            立即登录
          </Link>
        </>
      }
    >
      <WechatButton onSuccess={() => navigate('/journal/dashboard', { replace: true })} />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">或者</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField name="nickname" placeholder="昵称" autoComplete="nickname" error={errors.nickname} />
        <TextField
          name="email"
          type="email"
          placeholder="电子邮件地址"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          name="password"
          type="password"
          placeholder="密码（至少 8 位，含字母与数字）"
          autoComplete="new-password"
          error={errors.password}
        />
        <TextField
          name="confirmPassword"
          type="password"
          placeholder="确认密码"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-3.5 rounded border-slate-300 accent-brand-500"
          />
          <span>
            我已阅读并同意
            <a href="/terms" className="text-brand-600 hover:underline">
              服务条款
            </a>
            与
            <a href="/privacy" className="text-brand-600 hover:underline">
              隐私政策
            </a>
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-loss">{errors.agreed}</p>}

        {register.error && (
          <p role="alert" className="rounded-lg bg-loss-soft px-3 py-2 text-sm text-loss">
            {register.error.message}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={register.isPending}>
          注册
        </Button>
      </form>
    </AuthCard>
  )
}
