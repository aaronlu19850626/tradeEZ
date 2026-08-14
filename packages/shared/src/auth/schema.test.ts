import { describe, expect, it } from 'vitest'
import {
  fieldErrors,
  loginSchema,
  passwordSchema,
  registerSchema,
  resetPasswordSchema,
} from './schema'

describe('表单校验规则（F-19-02）', () => {
  it('邮箱格式错误给出中文提示', () => {
    const r = loginSchema.safeParse({ email: 'kkk', password: 'x' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).email).toBe('电子邮件地址无效')
  })

  it('登录不校验密码强度，只校验非空', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(true)
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).password).toBe('请输入密码')
  })

  it('注册密码需 8 位以上且含字母与数字', () => {
    expect(passwordSchema.safeParse('abc12').success).toBe(false) // 太短
    expect(passwordSchema.safeParse('abcdefgh').success).toBe(false) // 无数字
    expect(passwordSchema.safeParse('12345678').success).toBe(false) // 无字母
    expect(passwordSchema.safeParse('abcd1234').success).toBe(true)
  })

  it('两次密码不一致时错误挂在确认字段上', () => {
    const r = registerSchema.safeParse({
      nickname: 'Lu',
      email: 'a@b.com',
      password: 'abcd1234',
      confirmPassword: 'abcd9999',
      agreed: true,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).confirmPassword).toBe('两次输入的密码不一致')
  })

  it('未勾选条款时拦住注册', () => {
    const r = registerSchema.safeParse({
      nickname: 'Lu',
      email: 'a@b.com',
      password: 'abcd1234',
      confirmPassword: 'abcd1234',
      agreed: false,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).agreed).toBe('请先阅读并同意服务条款')
  })

  it('重置密码沿用同一套强度规则', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: 'abcd1234' }).success,
    ).toBe(true)
    expect(
      resetPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' }).success,
    ).toBe(false)
  })

  it('fieldErrors 每个字段只保留首条错误', () => {
    const r = registerSchema.safeParse({
      nickname: '',
      email: 'bad',
      password: 'x',
      confirmPassword: '',
      agreed: false,
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      const errs = fieldErrors(r.error)
      expect(Object.keys(errs).sort()).toEqual(
        ['agreed', 'confirmPassword', 'email', 'nickname', 'password'].sort(),
      )
    }
  })
})
