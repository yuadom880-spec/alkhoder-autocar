import { useEffect, useMemo, useState } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterCarsByBranch } from '../../lib/adminBranchFilters'
import { Link } from 'react-router'
import { Calendar, Plus, Sparkles } from 'lucide-react'
import { AdminCarActionButtons } from '../../components/admin/AdminCarActionButtons'
import { AdminCarMobileCard } from '../../components/admin/AdminCarMobileCard'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import { getCategoryLabel, getClassLabel } from '../../lib/constants'
import { filterBlocksByBranch, getCarBlocks } from '../../lib/availability'
import { resolveCarForBranch } from '../../lib/carBranchProfile'
import { carMatchesBranch, formatCarBranchLabels } from '../../lib/branchFilter'
import { copy } from '../../lib/copy'
import { isCarEnabledForAdminScope } from '../../lib/carStatus'
import {
  deleteCar,
  fetchBookingBlocks,
  fetchBranches,
  fetchCars,
  removeCarFromBranchScope,
  setCarBranchAvailability,
  updateCar,
} from '../../lib/supabase'
import type { BookingBlock, BranchRecord, Car } from '../../lib/types'
import {
  canBranchAdminPermanentlyDeleteCar,
  confirmAdminCarAvailabilityToggle,
  confirmAdminCarDelete,
  getAdminCarStatusLabel,
} from '../../lib/carStatus'
import { getCarBasePrice } from '../../lib/pricing'
import {
  getEffectivePrice,
  getOfferBadge,
  getOfferSavings,
  hasMonthlyFeaturedOffer,
  isOfferActive,
  MONTHLY_FEATURED_MIN_SAVINGS,
} from '../../lib/offers'
import { formatPrice } from '../../lib/utils'

const offerEditPath = (carId: string) => `/admin/offers/cars/${carId}/edit`

export function AdminOffersPage() {
  const { filterBranchId, isBranchAdmin, isGeneralAdmin } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? filterBranchId : null
  const [branchFilter, setBranchFilter] = useState('')
  const [cars, setCars] = useState<Car[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchCars(),
      fetchBookingBlocks(),
      isGeneralAdmin ? fetchBranches({ activeOnly: false }) : Promise.resolve([]),
    ])
      .then(([carsData, blocksData, branchesData]) => {
        setCars(carsData)
        setBlocks(blocksData)
        setBranches(branchesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [isGeneralAdmin])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const listBranchId = isGeneralAdmin ? branchFilter || null : filterBranchId

  const scopedBlocks = useMemo(
    () => filterBlocksByBranch(blocks, listBranchId),
    [blocks, listBranchId],
  )

  const visibleCars = useMemo(
    () => filterCarsByBranch(cars, listBranchId),
    [cars, listBranchId],
  )

  const featuredCount = useMemo(
    () => visibleCars.filter((c) => hasMonthlyFeaturedOffer(c, listBranchId)).length,
    [visibleCars, listBranchId],
  )

  const handleDelete = async (car: Car) => {
    if (!confirmAdminCarDelete(car, branchScopeId, isBranchAdmin)) return
    setDeleting(car.id)
    try {
      const permanentDelete =
        !isBranchAdmin ||
        !branchScopeId ||
        canBranchAdminPermanentlyDeleteCar(car, branchScopeId)

      if (permanentDelete) {
        await deleteCar(car.id)
        setCars((prev) => prev.filter((c) => c.id !== car.id))
      } else {
        const updated = await removeCarFromBranchScope(car.id, branchScopeId)
        if (carMatchesBranch(updated, branchScopeId)) {
          setCars((prev) => prev.map((c) => (c.id === car.id ? updated : c)))
        } else {
          setCars((prev) => prev.filter((c) => c.id !== car.id))
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleAvailable = async (car: Car) => {
    if (isBranchAdmin && !branchScopeId) {
      alert('تعذّر تحديد الفرع')
      return
    }
    if (!confirmAdminCarAvailabilityToggle(car, branchScopeId)) return
    setToggling(car.id)
    try {
      const enable = !isCarEnabledForAdminScope(car, branchScopeId)
      const updated =
        branchScopeId
          ? await setCarBranchAvailability(car.id, branchScopeId, enable)
          : await updateCar(car.id, {
              is_available: enable,
              ...(enable ? { unavailable_branch_ids: [] } : {}),
            })
      setCars((prev) => prev.map((c) => (c.id === car.id ? updated : c)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setToggling(null)
    }
  }

  const getActiveBlocks = (carId: string) =>
    getCarBlocks(carId, scopedBlocks, undefined, listBranchId).filter((b) => b.end_date >= today)

  const monthlyStatusBadge = (car: Car) => {
    if (hasMonthlyFeaturedOffer(car, listBranchId)) {
      return (
        <Badge variant="success">
          <Sparkles className="h-3 w-3 inline ml-1" />
          مميز — {formatPrice(getOfferSavings(car, 'monthly', listBranchId))}
        </Badge>
      )
    }
    if (isOfferActive(car, 'monthly', listBranchId)) {
      const savings = getOfferSavings(car, 'monthly', listBranchId)
      return (
        <Badge variant="warning">
          عرض شهري — يحتاج +{formatPrice(MONTHLY_FEATURED_MIN_SAVINGS - savings)}
        </Badge>
      )
    }
    return <Badge variant="default">بدون عرض شهري</Badge>
  }

  return (
    <>
      <AdminTopBar title="العروض الشهرية المميزة" />
      <div className="p-3 sm:p-6 lg:p-8">
        <AdminPageHeader
          title="العروض الشهرية المميزة"
          subtitle={
            <>
              <p>
                إدارة العروض الشهرية لسيارات الفرع — أضف عرضاً شهرياً لسيارة موجودة، عدّل
                العرض، أو أوقف التوفر. لإضافة سيارة جديدة استخدم أسطول السيارات. العروض بخصم{' '}
                {MONTHLY_FEATURED_MIN_SAVINGS} ر.س+ تظهر في الموقع ({featuredCount} حالياً).
              </p>
              {isBranchAdmin && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {copy.admin.offerBranchHint}
                </p>
              )}
            </>
          }
          action={
            <Link to="/admin/offers/monthly/new">
              <Button size="md" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                {copy.admin.addMonthlyOffer}
              </Button>
            </Link>
          }
        />

        {isGeneralAdmin && branches.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="offers-branch-filter" className="text-xs text-slate-500 shrink-0">
              {copy.admin.filterByBranch}:
            </label>
            <select
              id="offers-branch-filter"
              className="input-field py-2 text-sm max-w-xs"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">{copy.admin.allBranchesFilter}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">{visibleCars.length} سيارة</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : visibleCars.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500 mb-4">لا توجد سيارات في هذا النطاق</p>
            <Link to="/admin/offers/monthly/new">
              <Button>{copy.admin.addMonthlyOffer}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {visibleCars.map((car) => (
                <AdminCarMobileCard
                  key={car.id}
                  car={car}
                  branches={branches}
                  filterBranchId={listBranchId}
                  branchScopeId={branchScopeId}
                  isBranchAdmin={isBranchAdmin}
                  activeBlocks={getActiveBlocks(car.id)}
                  toggling={toggling === car.id}
                  deleting={deleting === car.id}
                  monthlyOfferEditPath={offerEditPath(car.id)}
                  extraBadges={monthlyStatusBadge(car)}
                  onToggleAvailable={() => handleToggleAvailable(car)}
                  onDelete={() => handleDelete(car)}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium">السيارة</th>
                      <th className="px-4 py-3 text-right font-medium">الفروع</th>
                      <th className="px-4 py-3 text-right font-medium">السعر الشهري</th>
                      <th className="px-4 py-3 text-right font-medium">حالة العرض</th>
                      <th className="px-4 py-3 text-right font-medium">التوفر</th>
                      <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleCars.map((car) => {
                      const displayCar = resolveCarForBranch(car, listBranchId)
                      const activeBlocks = getActiveBlocks(car.id)
                      const hasConfirmed = activeBlocks.some((b) => b.status === 'confirmed')
                      const hasPending = activeBlocks.some((b) => b.status === 'pending')

                      return (
                        <tr key={car.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={displayCar.image_url}
                                alt=""
                                className="h-10 w-16 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium">{displayCar.name}</p>
                                <p className="text-xs text-slate-400">
                                  {car.brand} · {car.year}
                                </p>
                                <div className="mt-1 flex gap-1">
                                  <Badge>{getCategoryLabel(car.category)}</Badge>
                                  <Badge variant="info">{getClassLabel(car.car_class)}</Badge>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {formatCarBranchLabels(car, branches)}
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={
                                isOfferActive(car, 'monthly', listBranchId)
                                  ? 'font-medium text-red-600'
                                  : 'font-medium'
                              }
                            >
                              {formatPrice(getEffectivePrice(car, 'monthly', listBranchId))}
                            </p>
                            {isOfferActive(car, 'monthly', listBranchId) && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatPrice(getCarBasePrice(car, 'monthly', listBranchId))}
                              </p>
                            )}
                            {getOfferBadge(car, 'monthly', listBranchId) && (
                              <p className="text-[11px] text-red-600 mt-0.5">
                                {getOfferBadge(car, 'monthly', listBranchId)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">{monthlyStatusBadge(car)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant={
                                  isCarEnabledForAdminScope(car, branchScopeId)
                                    ? 'success'
                                    : 'danger'
                                }
                              >
                                {getAdminCarStatusLabel(car, branchScopeId)}
                              </Badge>
                              {hasConfirmed && <Badge variant="danger">محجوزة</Badge>}
                              {hasPending && <Badge variant="warning">طلبات معلقة</Badge>}
                              {activeBlocks.length > 0 && (
                                <Badge variant="info">
                                  <Calendar className="h-3 w-3 inline ml-1" />
                                  {activeBlocks.length}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <AdminCarActionButtons
                              car={car}
                              branchScopeId={branchScopeId}
                              isBranchAdmin={isBranchAdmin}
                              toggling={toggling === car.id}
                              deleting={deleting === car.id}
                              fleetEditPath={`/admin/cars/${car.id}/edit`}
                              monthlyOfferEditPath={offerEditPath(car.id)}
                              onToggleAvailable={() => handleToggleAvailable(car)}
                              onDelete={() => handleDelete(car)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}