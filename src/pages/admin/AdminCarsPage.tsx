import { useEffect, useMemo, useState } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterCarsByBranch } from '../../lib/adminBranchFilters'
import { Link } from 'react-router'
import { Calendar, Edit, Plus, Power, Trash2 } from 'lucide-react'
import { AdminCarMobileCard } from '../../components/admin/AdminCarMobileCard'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import { getCategoryLabel, getClassLabel } from '../../lib/constants'
import { filterBlocksByBranch, getCarBlocks } from '../../lib/availability'
import { formatCarBranchLabels } from '../../lib/branchFilter'
import { deleteCar, fetchBookingBlocks, fetchBranches, fetchCars, updateCar } from '../../lib/supabase'
import type { BookingBlock, BranchRecord, Car } from '../../lib/types'
import { getEffectivePrice, getOfferBadge, isOfferActive } from '../../lib/offers'
import { formatPrice } from '../../lib/utils'

export function AdminCarsPage() {
  const { filterBranchId, isBranchMode } = useAdminBranch()
  const [cars, setCars] = useState<Car[]>([])
  const [blocks, setBlocks] = useState<BookingBlock[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([fetchCars(), fetchBookingBlocks(), fetchBranches({ activeOnly: false })])
      .then(([carsData, blocksData, branchesData]) => {
        setCars(carsData)
        setBlocks(blocksData)
        setBranches(branchesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const scopedBlocks = useMemo(
    () => filterBlocksByBranch(blocks, filterBranchId),
    [blocks, filterBranchId],
  )

  const visibleCars = useMemo(
    () => filterCarsByBranch(cars, filterBranchId),
    [cars, filterBranchId],
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return
    setDeleting(id)
    try {
      await deleteCar(id)
      setCars((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleAvailable = async (car: Car) => {
    setToggling(car.id)
    try {
      const updated = await updateCar(car.id, { is_available: !car.is_available })
      setCars((prev) => prev.map((c) => (c.id === car.id ? updated : c)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setToggling(null)
    }
  }

  const getActiveBlocks = (carId: string) =>
    getCarBlocks(carId, scopedBlocks, undefined, filterBranchId).filter((b) => b.end_date >= today)

  return (
    <>
      <AdminTopBar title="إدارة السيارات" />
      <div className="p-3 sm:p-6 lg:p-8">
        <AdminPageHeader
          title="إدارة السيارات"
          action={
            <Link to="/admin/cars/new">
              <Button size="md" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                إضافة سيارة
              </Button>
            </Link>
          }
        />

        {loading ? (
          <LoadingSpinner />
        ) : visibleCars.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-slate-500 mb-4">
              {isBranchMode ? 'لا توجد سيارات في فرعك' : 'لا توجد سيارات'}
            </p>
            <Link to="/admin/cars/new">
              <Button>إضافة أول سيارة</Button>
            </Link>
          </div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {visibleCars.map((car) => {
              const activeBlocks = getActiveBlocks(car.id)
              return (
                <AdminCarMobileCard
                  key={car.id}
                  car={car}
                  branches={branches}
                  filterBranchId={filterBranchId}
                  activeBlocks={activeBlocks}
                  toggling={toggling === car.id}
                  deleting={deleting === car.id}
                  onToggleAvailable={() => handleToggleAvailable(car)}
                  onDelete={() => handleDelete(car.id, car.name)}
                />
              )
            })}
          </div>

          <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">السيارة</th>
                    <th className="px-4 py-3 text-right font-medium">الفروع</th>
                    <th className="px-4 py-3 text-right font-medium">التصنيف</th>
                    <th className="px-4 py-3 text-right font-medium">الفئة</th>
                    <th className="px-4 py-3 text-right font-medium">السعر اليومي</th>
                    <th className="px-4 py-3 text-right font-medium">السعر الشهري</th>
                    <th className="px-4 py-3 text-right font-medium">التوفر</th>
                    <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleCars.map((car) => {
                    const activeBlocks = getActiveBlocks(car.id)
                    const hasConfirmed = activeBlocks.some((b) => b.status === 'confirmed')
                    const hasPending = activeBlocks.some((b) => b.status === 'pending')

                    return (
                      <tr key={car.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={car.image_url}
                              alt=""
                              className="h-10 w-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{car.name}</p>
                              <p className="text-xs text-slate-400">
                                {car.brand} · {car.year}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {formatCarBranchLabels(car, branches)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge>{getCategoryLabel(car.category)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{getClassLabel(car.car_class)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className={isOfferActive(car, 'daily', filterBranchId) ? 'font-medium text-red-600' : 'font-medium'}>
                              {formatPrice(getEffectivePrice(car, 'daily', filterBranchId))}
                              <span className="text-[10px] text-slate-400 mr-1">/ يوم</span>
                            </p>
                            {isOfferActive(car, 'daily', filterBranchId) && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatPrice(car.price_per_day)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className={isOfferActive(car, 'monthly', filterBranchId) ? 'font-medium text-red-600' : 'font-medium'}>
                              {formatPrice(getEffectivePrice(car, 'monthly', filterBranchId))}
                              <span className="text-[10px] text-slate-400 mr-1">/ شهر</span>
                            </p>
                            {isOfferActive(car, 'monthly', filterBranchId) && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatPrice(car.price_per_month)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={car.is_available ? 'success' : 'danger'}>
                              {car.is_available ? 'متاحة' : 'موقوفة'}
                            </Badge>
                            {hasConfirmed && <Badge variant="danger">محجوزة</Badge>}
                            {hasPending && <Badge variant="warning">طلبات معلقة</Badge>}

                            {isOfferActive(car, 'daily', filterBranchId) && (
                              <Badge variant="danger">{getOfferBadge(car, 'daily', filterBranchId)}</Badge>
                            )}
                            {isOfferActive(car, 'monthly', filterBranchId) && (
                              <Badge variant="danger">{getOfferBadge(car, 'monthly', filterBranchId)}</Badge>
                            )}
                            {activeBlocks.length > 0 && (
                              <Badge variant="info">
                                <Calendar className="h-3 w-3 inline ml-1" />
                                {activeBlocks.length}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="تبديل التوفر"
                              isLoading={toggling === car.id}
                              onClick={() => handleToggleAvailable(car)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Link to={`/admin/cars/${car.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              isLoading={deleting === car.id}
                              onClick={() => handleDelete(car.id, car.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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