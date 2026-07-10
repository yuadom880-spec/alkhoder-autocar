import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'

const BRANCH_MODE_KEY = 'alkhoder_admin_branch_mode'
const BRANCH_ID_KEY = 'alkhoder_admin_branch_id'

interface AdminBranchContextValue {
  branches: BranchRecord[]
  isBranchMode: boolean
  activeBranchId: string | null
  activeBranch: BranchRecord | null
  loading: boolean
  enterBranchMode: (branchId: string) => void
  exitBranchMode: () => void
  setActiveBranch: (branchId: string) => void
  /** معرّف الفرع للفلترة — null يعني عرض الكل */
  filterBranchId: string | null
}

const AdminBranchContext = createContext<AdminBranchContextValue | null>(null)

function readStoredBranchMode(): { mode: boolean; branchId: string | null } {
  const mode = sessionStorage.getItem(BRANCH_MODE_KEY) === 'true'
  const branchId = sessionStorage.getItem(BRANCH_ID_KEY)
  return { mode, branchId: branchId || null }
}

export function AdminBranchProvider({ children }: { children: ReactNode }) {
  const stored = readStoredBranchMode()
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isBranchMode, setIsBranchMode] = useState(stored.mode)
  const [activeBranchId, setActiveBranchId] = useState<string | null>(stored.branchId)

  useEffect(() => {
    fetchBranches({ activeOnly: false })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const persist = useCallback((mode: boolean, branchId: string | null) => {
    if (mode && branchId) {
      sessionStorage.setItem(BRANCH_MODE_KEY, 'true')
      sessionStorage.setItem(BRANCH_ID_KEY, branchId)
    } else {
      sessionStorage.removeItem(BRANCH_MODE_KEY)
      sessionStorage.removeItem(BRANCH_ID_KEY)
    }
  }, [])

  const enterBranchMode = useCallback(
    (branchId: string) => {
      setIsBranchMode(true)
      setActiveBranchId(branchId)
      persist(true, branchId)
    },
    [persist],
  )

  const exitBranchMode = useCallback(() => {
    setIsBranchMode(false)
    setActiveBranchId(null)
    persist(false, null)
  }, [persist])

  const setActiveBranch = useCallback(
    (branchId: string) => {
      setActiveBranchId(branchId)
      if (isBranchMode) persist(true, branchId)
    },
    [isBranchMode, persist],
  )

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) ?? null,
    [branches, activeBranchId],
  )

  const filterBranchId = isBranchMode ? activeBranchId : null

  const value = useMemo(
    () => ({
      branches,
      isBranchMode,
      activeBranchId,
      activeBranch,
      loading,
      enterBranchMode,
      exitBranchMode,
      setActiveBranch,
      filterBranchId,
    }),
    [
      branches,
      isBranchMode,
      activeBranchId,
      activeBranch,
      loading,
      enterBranchMode,
      exitBranchMode,
      setActiveBranch,
      filterBranchId,
    ],
  )

  return <AdminBranchContext.Provider value={value}>{children}</AdminBranchContext.Provider>
}

export function useAdminBranch() {
  const ctx = useContext(AdminBranchContext)
  if (!ctx) throw new Error('useAdminBranch must be used within AdminBranchProvider')
  return ctx
}