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
        'hidden max-w-full shrink-0 border-slate-200 bg-white p-4 transition-all duration-150 md:block md:border-r',
        isOpen ? 'md:w-64 md:min-w-64 md:max-w-64' : 'md:w-[72px] md:min-w-[72px] md:max-w-[72px]',
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
            isOpen
              ? ''
              : 'hidden md:flex md:h-10 md:w-10 md:items-center md:justify-center md:rounded-md md:border md:border-blue-200 md:bg-blue-50',
          ].join(' ')}
        >
          <p
            className={[
              'font-semibold uppercase text-blue-700',
              isOpen ? 'text-[11px] tracking-[0.22em]' : 'text-sm tracking-normal',
            ].join(' ')}
          >
            {isOpen ? 'EstateLink' : 'EL'}
          </p>
          {isOpen && (
            <>
              <h1 className="mt-3 text-lg font-semibold text-slate-900">Property Intelligence</h1>
              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                Ranked acquisition opportunities and due diligence workspace.
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
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
            isOpen ? 'ml-auto' : 'ml-auto md:ml-0',
          ].join(' ')}
        >
          <span className="text-base leading-none">{isOpen ? '<' : '>'}</span>
        </button>
      </div>

      <nav
        className={[
          'mt-6 gap-1 md:mt-8 md:flex-col',
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
                'group rounded-md border text-sm font-medium transition',
                isOpen ? 'px-3 py-2.5' : 'flex h-10 w-10 items-center justify-center px-0 py-0',
                isActive
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')
            }
          >
            <div className={['flex items-center gap-3', isOpen ? 'justify-start' : 'justify-center'].join(' ')}>
              <span
                className={
                  isOpen
                    ? ''
                    : 'flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold uppercase'
                }
              >
                {isOpen ? item.label : item.label.charAt(0)}
              </span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
