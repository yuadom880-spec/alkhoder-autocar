import { Navigate } from 'react-router'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

/** مسارات الإدارة العامة فقط — موظف الفرع يُعاد توجيهه للوحة الرئيسية */
export function AdminGeneralOnly({ children }: { children: React.ReactNode }) {
  const { isGeneralAdmin, loading } = useAdminBranch()

  if (loading) return <LoadingSpinner label="جاري التحميل..." />

  if (!isGeneralAdmin) return <Navigate to="/admin" replace />

  return <>{children}</>
}