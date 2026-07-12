import type { ReactNode } from 'react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { CustomerAuthPanel } from './CustomerAuthPanel'

export function BookingAuthGate({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useCustomerAuth()

  if (!isSupabaseConfigured) return <>{children}</>
  if (isLoading) return <LoadingSpinner className="py-16" />
  if (!isLoggedIn) return <CustomerAuthPanel />

  return <>{children}</>
}