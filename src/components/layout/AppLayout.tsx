import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AccountMenu } from './AccountMenu'
import { isNavItemVisible, navItems } from './navItems'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

function MobileNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const visibleNavItems = navItems.filter((item) => isNavItemVisible(item, user?.role))

  return (
    <>
      <header className="border-b border-white/10 bg-slate-950/90 px-3 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation sidebar"
            className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <span className="h-0.5 w-5 rounded-full bg-slate-100" />
            <span className="h-0.5 w-5 rounded-full bg-slate-100" />
            <span className="h-0.5 w-5 rounded-full bg-slate-100" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              EstateLink
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              Property Intelligence
            </p>
          </div>

          <AccountMenu />
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation sidebar"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside className="relative flex h-full w-[min(84vw,320px)] flex-col border-r border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                  EstateLink
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  Property Intelligence
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Analyst workspace for ranking acquisition and investment opportunities.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close navigation sidebar"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
              >
                x
              </button>
            </div>

            <nav className="mt-8 grid gap-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      'rounded-xl border px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-transparent text-slate-100">
      <div className="min-h-screen max-w-full md:flex">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <MobileNavbar />
          <Topbar />
          <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="mx-auto w-full max-w-[1500px] min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
