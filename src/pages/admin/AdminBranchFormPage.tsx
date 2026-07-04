import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { BranchForm } from '../../components/admin/BranchForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { createBranch, fetchBranchById, fetchBranches, updateBranch } from '../../lib/supabase'
import type { BranchRecord } from '../../lib/types'

export function AdminBranchFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [branch, setBranch] = useState<BranchRecord | null>(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    fetchBranchById(id)
      .then(setBranch)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <AdminTopBar />
        <LoadingSpinner />
      </>
    )
  }

  if (isEdit && !branch) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">الفرع غير موجود</p>
      </div>
    )
  }

  return (
    <>
      <AdminTopBar title={isEdit ? 'تعديل الفرع' : 'إضافة فرع'} />
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-bold text-brand-dark sm:text-2xl">
          {isEdit ? 'تعديل الفرع' : 'إضافة فرع جديد'}
        </h1>
        <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <BranchForm
            initial={branch ?? undefined}
            onCancel={() => navigate('/admin/branches')}
            onSubmit={async (data) => {
              if (isEdit && id) {
                await updateBranch(id, data)
              } else {
                const branches = await fetchBranches({ activeOnly: false })
                await createBranch({ ...data, sort_order: branches.length + 1 })
              }
              navigate('/admin/branches')
            }}
          />
        </div>
      </div>
    </>
  )
}