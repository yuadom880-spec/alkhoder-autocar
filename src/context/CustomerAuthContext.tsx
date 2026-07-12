import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import {
  fetchCustomerProfile,
  getSession,
  isSupabaseConfigured,
  resendSignupEmailOtp,
  signInCustomer,
  signOutCustomer,
  signUpCustomer,
  supabase,
  verifySignupEmailOtp,
} from '../lib/supabase'
import type { CustomerProfile } from '../lib/types'

interface CustomerAuthContextValue {
  user: User | null
  profile: CustomerProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** يُرجع true إذا كان التحقق بالإيميل مطلوباً */
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>
  verifyEmailOtp: (email: string, code: string) => Promise<void>
  resendEmailOtp: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    const session = await getSession()
    const nextUser = session?.user ?? null
    if (!nextUser) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    try {
      const nextProfile = await fetchCustomerProfile()
      if (!nextProfile || nextProfile.role !== 'customer') {
        setUser(null)
        setProfile(null)
      } else {
        setUser(nextUser)
        setProfile(nextProfile)
      }
    } catch {
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    if (!supabase) return

    const { data } = supabase.auth.onAuthStateChange(() => {
      void refresh()
    })

    return () => data.subscription.unsubscribe()
  }, [refresh])

  const signIn = useCallback(
    async (email: string, password: string) => {
      await signInCustomer(email, password)
      await refresh()
    },
    [refresh],
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const needsVerification = await signUpCustomer(email, password, fullName)
      if (!needsVerification) await refresh()
      return needsVerification
    },
    [refresh],
  )

  const verifyEmailOtp = useCallback(
    async (email: string, code: string) => {
      await verifySignupEmailOtp(email, code)
      await refresh()
    },
    [refresh],
  )

  const resendEmailOtp = useCallback(async (email: string) => {
    await resendSignupEmailOtp(email)
  }, [])

  const signOut = useCallback(async () => {
    await signOutCustomer()
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoggedIn: Boolean(user && profile?.role === 'customer'),
      isLoading,
      signIn,
      signUp,
      verifyEmailOtp,
      resendEmailOtp,
      signOut,
      refresh,
    }),
    [user, profile, isLoading, signIn, signUp, verifyEmailOtp, resendEmailOtp, signOut, refresh],
  )

  return (
    <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  }
  return ctx
}