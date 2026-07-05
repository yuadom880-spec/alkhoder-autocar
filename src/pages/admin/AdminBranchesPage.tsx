import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { BranchImage } from '../../components/branches/BranchImage'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { deleteBranch, fetchBranches } from '../../lib/supabase'
import type { BranchRecord } from '../../lib/types'

export function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetchBranches({ activeOnly: false })
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف فرع "${name}"؟`)) return
    setDeleting(id)
    try {
      await deleteBranch(id)
      setBranches((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <AdminTopBar title="إدارة الفروع" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-dark sm:text-2xl">الفروع</h1>
            <p className="text-sm text-slate-500">{branches.length} فرع</p>
          </div>
          <Link to="/admin/branches/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة فرع
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : branches.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500">لا توجد فروع — أضف أول فرع</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100"
              >
                <div className="relative bg-slate-100 min-h-[9rem] flex items-center justify-center">
                  <BranchImage
                    src={branch.image_url}
                    alt={branch.name}
                    imgClassName="max-h-48 w-full"
                    placeholderClassName="h-36"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {branch.is_main && <Badge variant="warning">رئيسي</Badge>}
                    {!branch.is_active && <Badge variant="default">مخفي</Badge>}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-brand-dark">{branch.name}</h3>
                  <p className="text-sm text-slate-500">
                    {branch.address} — {branch.city}
                  </p>
                  {branch.phone && (
                    <p className="text-sm text-slate-600" dir="ltr">
                      {branch.phone}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link to={`/admin/branches/${branch.id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      isLoading={deleting === branch.id}
                      onClick={() => handleDelete(branch.id, branch.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}