import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../api/auth'
import { clearToken } from '../../api/client'
import type { User } from '../../types/auth'

export function Topbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    getMe()
      .then((data) => {
        if (active) {
          setUser(data)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <header className="border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            EstateLink Analyst Workspace
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {user?.fullName ?? user?.name ?? user?.email ?? 'Authenticated session'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Review lead quality, investment signals, and source intelligence.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
