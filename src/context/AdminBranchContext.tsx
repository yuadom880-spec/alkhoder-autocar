import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAdminBranchId, getAdminRole, type AdminRole } from '../lib/admin'
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'

interface AdminBranchContextValue {
  branches: BranchRecord[]
  loading: boolean
  role: AdminRole
  /** معرّف فرع الموظف — null للإدارة العامة (كل الفروع) */
  branchId: string | null
  /** للفلترة — null يعني كل الفروع */
  filterBranchId: string | null
  activeBranch: BranchRecord | null
  isGeneralAdmin: boolean
  isBranchAdmin: boolean
}

const AdminBranchContext = createContext<AdminBranchContextValue | null>(null)

export function AdminBranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  const role = getAdminRole()
  const branchId = role === 'branch' ? getAdminBranchId() : null
  const filterBranchId = branchId

  useEffect(() => {
    fetchBranches({ activeOnly: false })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId],
  )

  const value = useMemo(
    () => ({
      branches,
      loading,
      role,
      branchId,
      filterBranchId,
      activeBranch,
      isGeneralAdmin: role === 'general',
      isBranchAdmin: role === 'branch',
    }),
    [branches, loading, role, branchId, filterBranchId, activeBranch],
  )

  return <AdminBranchContext.Provider value={value}>{children}</AdminBranchContext.Provider>
}

export function useAdminBranch() {
  const ctx = useContext(AdminBranchContext)
  if (!ctx) throw new Error('useAdminBranch must be used within AdminBranchProvider')
  return ctx
}