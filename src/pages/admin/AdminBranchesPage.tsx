import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Car, Calendar, Edit, MapPin, Plus, Trash2 } from 'lucide-react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { computeBranchPerformance } from '../../lib/adminAnalytics'
import { BranchImage } from '../../components/branches/BranchImage'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { deleteBranch, fetchBookings, fetchBranches, fetchCars } from '../../lib/supabase'
import type { Booking, BranchRecord, Car as CarType } from '../../lib/types'
import { formatPrice } from '../../lib/utils'

export function AdminBranchesPage() {
  const { isGeneralAdmin } = useAdminBranch()
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [cars, setCars] = useState<CarType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const tasks = [fetchBranches({ activeOnly: false }).then(setBranches)]
    if (isGeneralAdmin) {
      tasks.push(fetchCars().then(setCars), fetchBookings().then(setBookings))
    }
    Promise.all(tasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [isGeneralAdmin])

  const performanceById = useMemo(() => {
    if (!isGeneralAdmin) return new Map<string, ReturnType<typeof computeBranchPerformance>[number]>()
    const rows = computeBranchPerformance(branches, cars, bookings)
    return new Map(rows.map((r) => [r.branchId, r]))
  }, [isGeneralAdmin, branches, cars, bookings])

  const activeCount = branches.filter((b) => b.is_active).length

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
        <AdminPageHeader
          title="الفروع"
          subtitle={
            isGeneralAdmin
              ? `${branches.length} فرع · ${activeCount} نشط — إدارة شاملة لكل مواقع الشركة`
              : `${branches.length} فرع`
          }
          action={
            <Link to="/admin/branches/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                إضافة فرع
              </Button>
            </Link>
          }
        />

        {isGeneralAdmin && !loading && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 text-violet-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-bold">إجمالي الفروع</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{branches.length}</p>
            </div>
            <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
              <div className="flex items-center gap-2 text-brand-green">
                <Car className="h-4 w-4" />
                <span className="text-sm font-bold">متوسط السيارات</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">
                {branches.length
                  ? Math.round(cars.length / branches.length)
                  : 0}
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-bold">حجوزات معلّقة</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">
                {bookings.filter((b) => b.status === 'pending').length}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : branches.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500">لا توجد فروع — أضف أول فرع</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => {
              const perf = performanceById.get(branch.id)
              return (
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
                    {branch.email && (
                      <p className="text-xs text-slate-500" dir="ltr">
                        {branch.email}
                      </p>
                    )}

                    {isGeneralAdmin && perf && (
                      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                        <div className="rounded-lg bg-slate-50 py-2">
                          <p className="font-bold text-brand-dark">{perf.carsCount}</p>
                          <p className="text-slate-400">سيارة</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 py-2">
                          <p className="font-bold text-amber-700">{perf.bookingsPending}</p>
                          <p className="text-slate-400">معلّق</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 py-2">
                          <p className="font-bold text-emerald-700 text-[10px] leading-tight">
                            {formatPrice(perf.revenue)}
                          </p>
                          <p className="text-slate-400">إيراد</p>
                        </div>
                      </div>
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
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}