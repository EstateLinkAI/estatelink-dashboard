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
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
      >
        {initials || 'A'}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {user?.email && user.email !== displayName ? (
              <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
            ) : null}
          </div>

          <div className="p-2">
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Account
            </button>
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
