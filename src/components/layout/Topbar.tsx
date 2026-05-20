import { AccountMenu } from './AccountMenu'

export function Topbar() {
  return (
    <header className="hidden max-w-full border-b border-white/10 bg-slate-950/55 px-3 py-3 backdrop-blur md:block sm:px-5 sm:py-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1500px] min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            EstateLink Analyst Workspace
          </p>
          <p className="mt-2 break-words text-lg font-semibold text-white">
            Review lead quality, investment signals, and source intelligence.
          </p>
        </div>

        <AccountMenu />
      </div>
    </header>
  )
}
