import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSearchParams } from 'react-router'
import { DEMO_BRANCHES } from '../lib/branchesData'
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'

const CUSTOMER_BRANCH_KEY = 'alkhoder_customer_branch'

interface CustomerBranchContextValue {
  branches: BranchRecord[]
  branchId: string
  selectedBranch: BranchRecord | null
  hasBranch: boolean
  loading: boolean
  loadError: string
  setBranchId: (id: string) => void
  clearBranch: () => void
  reloadBranches: () => void
}

const CustomerBranchContext = createContext<CustomerBranchContextValue | null>(null)

export function CustomerBranchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const branchFromUrl = searchParams.get('branch') ?? ''
  const [branchId, setBranchIdState] = useState(() => {
    if (branchFromUrl) return branchFromUrl
    return sessionStorage.getItem(CUSTOMER_BRANCH_KEY) ?? ''
  })

  const loadBranches = useCallback(() => {
    setLoading(true)
    setLoadError('')
    return fetchBranches({ activeOnly: true })
      .then((data) => {
        setBranches(data.length > 0 ? data : DEMO_BRANCHES.filter((b) => b.is_active))
      })
      .catch((err) => {
        console.error(err)
        setLoadError('تعذر تحميل الفروع — نعرض الفروع الافتراضية')
        setBranches(DEMO_BRANCHES.filter((b) => b.is_active))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  useEffect(() => {
    if (branchFromUrl && branchFromUrl !== branchId) {
      setBranchIdState(branchFromUrl)
      sessionStorage.setItem(CUSTOMER_BRANCH_KEY, branchFromUrl)
    }
  }, [branchFromUrl, branchId])

  const setBranchId = useCallback(
    (id: string) => {
      setBranchIdState(id)
      if (id) sessionStorage.setItem(CUSTOMER_BRANCH_KEY, id)
      else sessionStorage.removeItem(CUSTOMER_BRANCH_KEY)

      const params = new URLSearchParams(searchParams)
      if (id) params.set('branch', id)
      else params.delete('branch')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    if (loading || branches.length === 0) return

    if (branchId && !branches.some((b) => b.id === branchId)) {
      setBranchId('')
      return
    }

    if (!branchId && branches.length === 1) {
      setBranchId(branches[0].id)
    }
  }, [loading, branches, branchId, setBranchId])

  const clearBranch = useCallback(() => setBranchId(''), [setBranchId])

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId],
  )

  const hasBranch = Boolean(branchId && selectedBranch)

  const value = useMemo(
    () => ({
      branches,
      branchId,
      selectedBranch,
      hasBranch,
      loading,
      loadError,
      setBranchId,
      clearBranch,
      reloadBranches: loadBranches,
    }),
    [
      branches,
      branchId,
      selectedBranch,
      hasBranch,
      loading,
      loadError,
      setBranchId,
      clearBranch,
      loadBranches,
    ],
  )

  return (
    <CustomerBranchContext.Provider value={value}>{children}</CustomerBranchContext.Provider>
  )
}

export function useCustomerBranch() {
  const ctx = useContext(CustomerBranchContext)
  if (!ctx) throw new Error('useCustomerBranch must be used within CustomerBranchProvider')
  return ctx
}