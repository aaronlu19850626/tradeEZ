import { describe, expect, it } from 'vitest'
import { findNavTitle } from './nav'
import { DICT } from '@/i18n/locales'

const zh = DICT.zh
const en = DICT.en

describe('浏览器标签标题取名', () => {
  it('首页精确匹配，不被其他路径误伤', () => {
    expect(findNavTitle('/', zh)).toBe('首页')
  })

  it('二级路由取最长匹配，而非父级菜单名', () => {
    // /journal/dashboard 同时是「交易分析」的入口路径与「仪表盘」自身路径，
    // 必须命中更具体的二级菜单名，与页面上高亮的菜单项一致
    expect(findNavTitle('/journal/dashboard', zh)).toBe('仪表盘')
    expect(findNavTitle('/journal/day-view', zh)).toBe('日视图')
    expect(findNavTitle('/journal/trades', zh)).toBe('交易列表')
  })

  it('产品级菜单项', () => {
    expect(findNavTitle('/agents', zh)).toBe('交易智能体')
    expect(findNavTitle('/news', zh)).toBe('财经新闻')
    expect(findNavTitle('/university', zh)).toBe('EZ 学院')
  })

  it('未列入菜单但需要标题的路由', () => {
    expect(findNavTitle('/login', zh)).toBe('登录')
    expect(findNavTitle('/backtesting', zh)).toBe('回测')
  })

  it('随语言返回对应译文', () => {
    expect(findNavTitle('/', en)).toBe('Home')
    expect(findNavTitle('/journal/trades', en)).toBe('Trade View')
    expect(findNavTitle('/login', en)).toBe('Sign in')
  })

  it('未登记路径返回 undefined，由调用方回退到品牌名', () => {
    expect(findNavTitle('/nope', zh)).toBeUndefined()
  })
})
