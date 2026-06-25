import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { isNavItemVisible, navItems } from './navItems'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const { user } = useAuth()
  const visibleNavItems = navItems.filter((item) => isNavItemVisible(item, user?.role))

  return (
    <aside
      className={[
        'hidden max-w-full shrink-0 border-white/10 bg-slate-950/80 p-4 backdrop-blur transition-all duration-200 md:block md:border-r',
        isOpen ? 'md:w-72 md:min-w-72 md:max-w-72' : 'md:w-20 md:min-w-20 md:max-w-20',
      ].join(' ')}
    >
      <div
        className={[
          'flex gap-3',
          isOpen ? 'items-start justify-between' : 'items-center justify-between md:flex-col',
        ].join(' ')}
      >
        <div
          className={[
            'min-w-0',
            isOpen ? '' : 'hidden md:flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-xl md:border md:border-cyan-400/20 md:bg-cyan-400/10',
          ].join(' ')}
        >
          <p
            className={[
              'font-semibold uppercase text-cyan-300/80',
              isOpen ? 'text-[11px] tracking-[0.3em]' : 'text-sm tracking-normal',
            ].join(' ')}
          >
            {isOpen ? 'EstateLink' : 'EL'}
          </p>
          {isOpen && (
            <>
              <h1 className="mt-3 text-2xl font-semibold text-white">
                Property Intelligence
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Analyst workspace for ranking acquisition and investment opportunities.
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          className={[
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100',
            isOpen ? 'ml-auto' : 'ml-auto md:ml-0',
          ].join(' ')}
        >
          <span className="text-base leading-none">{isOpen ? '<' : '>'}</span>
        </button>
      </div>

      <nav
        className={[
          'mt-6 gap-2 md:mt-10 md:flex-col',
          isOpen ? 'grid grid-cols-1 sm:grid-cols-3 md:flex' : 'hidden md:flex',
        ].join(' ')}
      >
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isOpen ? undefined : item.label}
            className={({ isActive }) =>
              [
                'group rounded-xl border text-sm font-medium transition',
                isOpen ? 'px-4 py-3' : 'flex h-11 w-11 items-center justify-center px-0 py-0',
                isActive
                  ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                  : 'border-white/5 bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-white',
              ].join(' ')
            }
          >
            <div
              className={[
                'flex items-center gap-3',
                isOpen ? 'justify-between' : 'justify-center',
              ].join(' ')}
            >
              <span
                className={
                  isOpen
                    ? ''
                    : 'flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] text-xs font-semibold uppercase'
                }
              >
                {isOpen ? item.label : item.label.charAt(0)}
              </span>
              {isOpen && (
                <span className="h-2 w-2 rounded-full bg-current opacity-40 group-hover:opacity-70" />
              )}
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
