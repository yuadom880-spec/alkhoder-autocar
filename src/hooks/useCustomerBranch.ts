import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { BranchRecord } from '../lib/types'

const CUSTOMER_BRANCH_KEY = 'alkhoder_customer_branch'

export function useCustomerBranch(branches: BranchRecord[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const branchFromUrl = searchParams.get('branch') ?? ''
  const [branchId, setBranchIdState] = useState(() => {
    if (branchFromUrl) return branchFromUrl
    return sessionStorage.getItem(CUSTOMER_BRANCH_KEY) ?? ''
  })

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

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId],
  )

  const hasBranch = Boolean(branchId && selectedBranch)

  return {
    branchId,
    selectedBranch,
    hasBranch,
    setBranchId,
  }
}