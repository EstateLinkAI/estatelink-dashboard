import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { clearToken } from '../../api/client'

export function AccountMenu() {
  const navigate = useNavigate()
  const { refreshUser, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const displayName = user?.fullName ?? user?.name ?? user?.email ?? 'Account'
  const initials = displayName
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const handleLogout = () => {
    clearToken()
    refreshUser().catch(() => undefined)
    navigate('/login')
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-blue-700 transition hover:bg-slate-50"
      >
        {initials || 'A'}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            {user?.email && user.email !== displayName ? (
              <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
            ) : null}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Account
            </button>
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
