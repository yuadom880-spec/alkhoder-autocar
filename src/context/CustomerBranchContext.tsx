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
import { fetchBranches } from '../lib/supabase'
import type { BranchRecord } from '../lib/types'

const CUSTOMER_BRANCH_KEY = 'alkhoder_customer_branch'

interface CustomerBranchContextValue {
  branches: BranchRecord[]
  branchId: string
  selectedBranch: BranchRecord | null
  hasBranch: boolean
  loading: boolean
  setBranchId: (id: string) => void
  clearBranch: () => void
}

const CustomerBranchContext = createContext<CustomerBranchContextValue | null>(null)

export function CustomerBranchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  const branchFromUrl = searchParams.get('branch') ?? ''
  const [branchId, setBranchIdState] = useState(() => {
    if (branchFromUrl) return branchFromUrl
    return sessionStorage.getItem(CUSTOMER_BRANCH_KEY) ?? ''
  })

  useEffect(() => {
    fetchBranches({ activeOnly: true })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (branchFromUrl && branchFromUrl !== branchId) {
      setBranchIdState(branchFromUrl)
      sessionStorage.setItem(CUSTOMER_BRANCH_KEY, branchFromUrl)
    }
  }, [branchFromUrl, branchId])

  useEffect(() => {
    if (!branchId && branches.length === 1) {
      const only = branches[0].id
      setBranchIdState(only)
      sessionStorage.setItem(CUSTOMER_BRANCH_KEY, only)
      const params = new URLSearchParams(searchParams)
      params.set('branch', only)
      setSearchParams(params, { replace: true })
    }
  }, [branches, branchId, searchParams, setSearchParams])

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
      setBranchId,
      clearBranch,
    }),
    [branches, branchId, selectedBranch, hasBranch, loading, setBranchId, clearBranch],
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