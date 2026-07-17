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
import type { Session, User } from '@supabase/supabase-js'
import {
  fetchCustomerProfile,
  getSession,
  isSupabaseConfigured,
  resendSignupEmailOtp,
  signInCustomer,
  deleteCustomerAccount,
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
  deleteAccount: () => Promise<void>
  refresh: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

function profileFromUser(user: User, partial?: CustomerProfile | null): CustomerProfile {
  return {
    id: user.id,
    email: partial?.email ?? user.email ?? null,
    full_name: partial?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
    phone: partial?.phone ?? null,
    id_number: partial?.id_number ?? null,
    role: partial?.role === 'admin' ? 'admin' : 'customer',
    created_at: partial?.created_at ?? new Date().toISOString(),
    updated_at: partial?.updated_at ?? new Date().toISOString(),
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<User | null>(null)
  const profileRef = useRef<CustomerProfile | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const applySession = useCallback(async (session: Session | null, opts?: { hardLogout?: boolean }) => {
    const nextUser = session?.user ?? null

    if (!nextUser) {
      if (opts?.hardLogout || !userRef.current) {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
      return
    }

    try {
      const nextProfile = await fetchCustomerProfile()

      if (nextProfile?.role === 'admin') {
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        return
      }

      if (nextProfile?.role === 'customer') {
        setUser(nextUser)
        setProfile(nextProfile)
        setIsLoading(false)
        return
      }

      // جلسة موجودة لكن الملف ناقص/فشل القراءة — لا نسجّل خروجاً وهمياً
      setUser(nextUser)
      setProfile((prev) => {
        if (prev && prev.id === nextUser.id && prev.role === 'customer') return prev
        return profileFromUser(nextUser, prev)
      })
    } catch {
      // خطأ مؤقت (شبكة / RLS) — نُبقي الجلسة بدل تسجيل خروج
      setUser(nextUser)
      setProfile((prev) => {
        if (prev && prev.id === nextUser.id) return prev
        return profileFromUser(nextUser, prev)
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    const session = await getSession()
    await applySession(session)
  }, [applySession])

  useEffect(() => {
    void refresh()
    if (!supabase) return

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // تأجيل لتجنّب deadlock معروف في supabase-js داخل callback
      setTimeout(() => {
        if (event === 'SIGNED_OUT') {
          void applySession(null, { hardLogout: true })
          return
        }
        // لا تمسح الجلسة عند أحداث التحديث المؤقتة
        if (!session && (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          return
        }
        void applySession(session)
      }, 0)
    })

    return () => data.subscription.unsubscribe()
  }, [refresh, applySession])

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
    setUser(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  const deleteAccount = useCallback(async () => {
    await deleteCustomerAccount()
    setUser(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoggedIn: Boolean(user && profile?.role !== 'admin'),
      isLoading,
      signIn,
      signUp,
      verifyEmailOtp,
      resendEmailOtp,
      signOut,
      deleteAccount,
      refresh,
    }),
    [
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      verifyEmailOtp,
      resendEmailOtp,
      signOut,
      deleteAccount,
      refresh,
    ],
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
