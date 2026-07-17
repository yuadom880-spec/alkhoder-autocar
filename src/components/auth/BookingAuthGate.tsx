import type { ReactNode } from 'react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { CustomerAuthPanel } from './CustomerAuthPanel'

export function BookingAuthGate({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading, user } = useCustomerAuth()

  if (!isSupabaseConfigured) return <>{children}</>
  if (isLoading) return <LoadingSpinner className="py-16" />
  // user موجود = جلسة نشطة (حتى لو الملف لسه بيتحمّل) — لا نظهر شاشة الدخول بالغلط
  if (!isLoggedIn && !user) return <CustomerAuthPanel />
  if (!isLoggedIn && user) return <LoadingSpinner className="py-16" />

  return <>{children}</>
}