import { SEED_ACCOUNT } from '@/mocks/data/users'

/**
 * mock 阶段的测试便利：登录页预填演示账号，免去每次手输。
 * 注册新账号后此处不变，始终指向种子账号。
 *
 * 接入真实后端时删除本文件及其引用（登录页的 defaultValue 与提示条）。
 */
export { SEED_ACCOUNT }

export const SEED_HINT = `演示账号已预填：${SEED_ACCOUNT.email} / ${SEED_ACCOUNT.password}（或点微信登录，约 6 秒自动完成扫码）`
