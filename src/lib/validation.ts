import { z } from 'zod'

/**
 * 表单校验规则。F-19-02
 * 与截图一致：邮箱格式错误时输入框描红并在下方给出中文提示。
 * 同一份 schema 供前端表单与 MSW handler 使用，保证前后端校验口径一致。
 */

export const emailSchema = z
  .string()
  .min(1, '请输入电子邮件地址')
  .email('电子邮件地址无效')

/** 密码强度：8 位以上且含字母与数字。过弱的密码在注册时拦住 */
export const passwordSchema = z
  .string()
  .min(8, '密码至少 8 位')
  .max(64, '密码最长 64 位')
  .regex(/[a-zA-Z]/, '密码需包含字母')
  .regex(/\d/, '密码需包含数字')

export const loginSchema = z.object({
  email: emailSchema,
  // 登录不校验强度，只校验非空，避免老账号密码不满足新规则时无法登录
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z
  .object({
    nickname: z.string().min(1, '请输入昵称').max(20, '昵称最长 20 字'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, '请再次输入密码'),
    agreed: z.literal(true, { message: '请先阅读并同意服务条款' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致',
  })

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, '请再次输入密码'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致',
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/** 把 ZodError 摊平成 { 字段: 首条错误 }，供表单渲染 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
