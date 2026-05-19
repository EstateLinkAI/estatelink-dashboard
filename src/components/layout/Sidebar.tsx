import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Leads', to: '/app/leads' },
]

export function Sidebar() {
  return (
    <aside className="w-full border-b border-white/10 bg-slate-950/80 p-4 backdrop-blur md:w-72 md:border-b-0 md:border-r md:p-6">
      <div className="flex items-center justify-between md:block">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            EstateLink
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Property Intelligence</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Analyst workspace for ranking acquisition and investment opportunities.
          </p>
        </div>
      </div>

      <nav className="mt-6 flex gap-2 overflow-x-auto md:mt-10 md:flex-col">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'group rounded-xl border px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                  : 'border-white/5 bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-white',
              ].join(' ')
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span>{item.label}</span>
              <span className="h-2 w-2 rounded-full bg-current opacity-40 group-hover:opacity-70" />
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
