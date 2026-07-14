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

  if (isBranchAdmin && branchId && !activeBranch) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-slate-600">تعذّر العثور على فرعك في النظام.</p>
        <p className="text-sm text-slate-400">تواصل مع الإدارة العامة لربط الحساب بالفرع الصحيح.</p>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          تسجيل الخروج
        </button>
      </div>
    )
  }

  return <>{children}</>
}