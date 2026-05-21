import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getMe } from '../api/auth'
import { getToken } from '../api/client'
import type { User } from '../types/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()))
  const hasBootstrapped = useRef(false)

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const nextUser = await getMe()
      setUser(nextUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }

    hasBootstrapped.current = true

    refreshUser().catch(() => {
      setUser(null)
      setIsLoading(false)
    })
  }, [refreshUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(getToken()),
      isLoading,
      user,
      refreshUser,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
