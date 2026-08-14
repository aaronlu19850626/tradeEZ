interface Props {
  title: string
  /** 需求编号，便于页面与需求文档对照 */
  reqId?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, reqId, actions }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {reqId && (
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
            {reqId}
          </span>
        )}
      </div>
      {actions}
    </div>
  )
}
