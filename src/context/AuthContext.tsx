import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearAdminSession, isAdminSession } from '../lib/admin'

interface AuthContextValue {
  isAdmin: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const loggedIn = isAdminSession()
    setIsAdmin(loggedIn)
    if (loggedIn) {
      const { ensureSupabaseAdminAuth, isSupabaseConfigured } = await import('../lib/supabase')
      if (isSupabaseConfigured) {
        await ensureSupabaseAdminAuth()
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    clearAdminSession()
    const { isSupabaseConfigured, signOutAdmin } = await import('../lib/supabase')
    if (isSupabaseConfigured) {
      await signOutAdmin()
    }
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({ isAdmin, isLoading, logout, refresh }),
    [isAdmin, isLoading, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}