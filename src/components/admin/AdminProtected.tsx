import { Navigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner label="جاري التحقق..." />

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return <>{children}</>
}