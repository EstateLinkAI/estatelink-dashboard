import { AccountMenu } from './AccountMenu'

export function Topbar() {
  return (
    <header className="hidden max-w-full border-b border-slate-200 bg-white px-3 py-3 md:block sm:px-5 sm:py-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1500px] min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            EstateLink Analyst Workspace
          </p>
          <p className="mt-1 break-words text-base font-semibold text-slate-900">
            Ranked property opportunities and due diligence priorities
          </p>
        </div>

        <AccountMenu />
      </div>
    </header>
  )
}
