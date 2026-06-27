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
      <header className="border-b border-slate-200 bg-white px-3 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation sidebar"
            className="inline-flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white transition hover:bg-slate-50"
          >
            <span className="h-0.5 w-5 rounded-full bg-slate-700" />
            <span className="h-0.5 w-5 rounded-full bg-slate-700" />
            <span className="h-0.5 w-5 rounded-full bg-slate-700" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">EstateLink</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">Property Intelligence</p>
          </div>

          <AccountMenu />
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation sidebar"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside className="relative flex h-full w-[min(84vw,320px)] flex-col border-r border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">EstateLink</p>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">Property Intelligence</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Analyst workspace for ranking acquisition and investment opportunities.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close navigation sidebar"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                x
              </button>
            </div>

            <nav className="mt-8 grid gap-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      'rounded-md border px-4 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-100 text-slate-900">
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
