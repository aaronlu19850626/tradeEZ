import { useMemo } from 'react'

/**
 * 二维码占位图形。
 *
 * 注意：这是根据 payload 哈希生成的伪二维码，扫不出内容，仅用于 mock 阶段的视觉占位。
 * 接入真实微信开放平台后，应改为渲染后端返回的 qrPayload
 * （用 qrcode 库生成，或直接展示微信返回的二维码图片 URL）。
 */
export function QrPlaceholder({ payload }: { payload: string }) {
  const cells = useMemo(() => buildPattern(payload), [payload])

  return (
    <div className="relative size-40">
      <div
        className="grid size-full"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {cells.map((on, i) => (
          <span key={i} className={on ? 'bg-slate-900' : 'bg-transparent'} />
        ))}
      </div>
      {/* 中心微信绿标，遮住中间区域使其更像真实二维码 */}
      <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded bg-card">
        <span className="grid size-7 place-items-center rounded bg-[#07C160] text-[10px] font-bold text-white">
          微信
        </span>
      </span>
    </div>
  )
}

const SIZE = 21

/** 由 payload 派生的确定性图案：三个定位角 + 伪随机数据区 */
function buildPattern(payload: string): boolean[] {
  let h = 2166136261
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rnd = () => {
        h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }

  const cells: boolean[] = []
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      cells.push(isFinder(x, y) ?? rnd() > 0.52)
    }
  }
  return cells
}

/** 三个 7×7 定位角：外框实心、中间留白、内芯实心 */
function isFinder(x: number, y: number): boolean | null {
  const corners = [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ]
  for (const [cx, cy] of corners) {
    const dx = x - cx
    const dy = y - cy
    if (dx < 0 || dx > 6 || dy < 0 || dy > 6) continue
    const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3))
    return ring !== 2
  }
  return null
}
