import { delay } from 'msw'

/**
 * mock 接口的模拟延迟。
 * 开发时保留真实网络的手感（便于验证 loading 态），测试环境下归零以免拖慢用例。
 */
const enabled = !import.meta.env?.TEST

export function lag(ms: number) {
  return enabled ? delay(ms) : Promise.resolve()
}
