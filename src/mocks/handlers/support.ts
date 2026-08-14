import { HttpResponse, http } from 'msw'
import { lag } from '../latency'
import type { ChatMessage, ChatSession } from '@/types/auth'

/** 在线询问 mock。F-19-07 */

const API = '/api'

const chats = new Map<string, ChatSession>()

const GREETING =
  '👋 你好！这里是 TradeEZ 智能助手。把你的问题说得具体一些，我会尽力当场解答；如果我处理不了，会给你「转接人工」的选项。'

/** 关键词命中式回复，替代真实模型 */
const REPLIES: { match: RegExp; reply: string }[] = [
  { match: /导入|上传|csv|券商/i, reply: '导入交易有三种方式：手动录入、上传券商 CSV、连接账户自动同步。侧边栏点「添加交易」即可选择。首次上传若列名不匹配，会进入字段映射向导，映射规则可保存下次自动套用。' },
  { match: /密码|登录不了|登不上/i, reply: '登录页点「忘记密码」，输入注册邮箱后会收到重置链接，链接 30 分钟内有效。若邮件没收到，请检查垃圾邮件夹。' },
  { match: /微信|扫码/i, reply: '登录页点「使用微信登录」会弹出二维码，用微信扫码并在手机上确认即可。二维码 2 分钟有效，过期点一下即可刷新。' },
  { match: /价格|收费|订阅|多少钱/i, reply: '关于套餐与计费，我这边拿不到最新报价，建议转接人工客服确认。' },
  { match: /指标|胜率|盈亏比|计算/i, reply: '指标口径统一在帮助文档的「指标字典」里。比如胜率 = 盈利笔数 ÷ 总笔数，保本交易计入分母不计入分子；盈亏比 = 总盈利 ÷ 总亏损绝对值。' },
]

const FALLBACK =
  '这个问题我不太确定，避免给你错误信息。要不要转接人工客服？工作时间内一般几分钟内会回复。'

function reply(text: string): { content: string; escalate: boolean } {
  const hit = REPLIES.find((r) => r.match.test(text))
  if (hit) return { content: hit.reply, escalate: /价格|收费|订阅|多少钱/i.test(text) }
  return { content: FALLBACK, escalate: true }
}

function msg(role: ChatMessage['role'], content: string, authorLabel?: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    authorLabel,
  }
}

export const supportHandlers = [
  /** 开启会话，返回欢迎语 */
  http.post(`${API}/support/chat`, async () => {
    await lag(300)
    const session: ChatSession = {
      id: crypto.randomUUID(),
      messages: [msg('assistant', GREETING, '支持助手 · AI')],
      escalated: false,
    }
    chats.set(session.id, session)
    return HttpResponse.json(session)
  }),

  http.get(`${API}/support/chat/:id`, async ({ params }) => {
    await lag(150)
    const session = chats.get(String(params.id))
    if (!session) return HttpResponse.json({ message: '会话不存在' }, { status: 404 })
    return HttpResponse.json(session)
  }),

  /** 发消息，返回助手回复 */
  http.post(`${API}/support/chat/:id/messages`, async ({ params, request }) => {
    const session = chats.get(String(params.id))
    if (!session) return HttpResponse.json({ message: '会话不存在' }, { status: 404 })

    const { content } = (await request.json()) as { content: string }
    session.messages.push(msg('user', content))

    // 模拟思考耗时
    await lag(900)
    const r = reply(content)
    session.messages.push(msg('assistant', r.content, '支持助手 · AI'))
    if (r.escalate) session.escalated = true

    return HttpResponse.json(session)
  }),

  /** 转人工 */
  http.post(`${API}/support/chat/:id/escalate`, async ({ params }) => {
    await lag(500)
    const session = chats.get(String(params.id))
    if (!session) return HttpResponse.json({ message: '会话不存在' }, { status: 404 })
    session.escalated = true
    session.messages.push(
      msg('agent', '已为你转接人工客服，请稍等，会有同事接入。你可以先把订单号或截图发过来。', '人工客服'),
    )
    return HttpResponse.json(session)
  }),
]
