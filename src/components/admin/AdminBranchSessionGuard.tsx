import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

/** يمنع جلسة موظف فرع بدون فرع مربوط */
export function AdminBranchSessionGuard({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const { isBranchAdmin, branchId, loading, activeBranch } = useAdminBranch()

  useEffect(() => {
    if (!loading && isBranchAdmin && !branchId) {
      void logout()
    }
  }, [loading, isBranchAdmin, branchId, logout])

  if (loading) return <LoadingSpinner label="جاري تحميل بيانات الفرع..." />

  if (isBranchAdmin && !branchId) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <>
      {isBranchAdmin && branchId && !activeBranch && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          جاري تحميل بيانات الفرع — إن استمرت المشكلة تواصل مع الإدارة العامة
        </div>
      )}
      {children}
    </>
  )
}