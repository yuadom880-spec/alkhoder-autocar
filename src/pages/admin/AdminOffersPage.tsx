import { useEffect, useMemo, useState } from 'react'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { filterCarsByBranch } from '../../lib/adminBranchFilters'
import { Link } from 'react-router'
import { Edit, Sparkles } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import { resolveCarForBranch } from '../../lib/carBranchProfile'
import {
  getEffectivePrice,
  getOfferBadge,
  getOfferSavings,
  hasMonthlyFeaturedOffer,
  isOfferActive,
  MONTHLY_FEATURED_MIN_SAVINGS,
} from '../../lib/offers'
import { getCarBasePrice } from '../../lib/pricing'
import { fetchBranches, fetchCars } from '../../lib/supabase'
import type { BranchRecord, Car } from '../../lib/types'
import { formatPrice } from '../../lib/utils'

export function AdminOffersPage() {
  const { filterBranchId, isBranchAdmin, isGeneralAdmin } = useAdminBranch()
  const [cars, setCars] = useState<Car[]>([])
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchCars(),
      isGeneralAdmin ? fetchBranches({ activeOnly: false }) : Promise.resolve([]),
    ])
      .then(([carsData, branchesData]) => {
        setCars(carsData)
        setBranches(branchesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [isGeneralAdmin])

  const listBranchId = isGeneralAdmin ? branchFilter || null : filterBranchId

  const visibleCars = useMemo(
    () => filterCarsByBranch(cars, listBranchId),
    [cars, listBranchId],
  )

  const featuredCars = useMemo(
    () =>
      visibleCars
        .filter((car) => hasMonthlyFeaturedOffer(car, listBranchId))
        .sort(
          (a, b) =>
            getOfferSavings(b, 'monthly', listBranchId) -
            getOfferSavings(a, 'monthly', listBranchId),
        ),
    [visibleCars, listBranchId],
  )

  const nearMissCars = useMemo(
    () =>
      visibleCars.filter((car) => {
        if (hasMonthlyFeaturedOffer(car, listBranchId)) return false
        return isOfferActive(car, 'monthly', listBranchId)
      }),
    [visibleCars, listBranchId],
  )

  const renderCarRow = (car: Car, featured: boolean) => {
    const display = resolveCarForBranch(car, listBranchId)
    const savings = getOfferSavings(car, 'monthly', listBranchId)
    const base = getCarBasePrice(car, 'monthly', listBranchId)
    const effective = getEffectivePrice(car, 'monthly', listBranchId)
    const badge = getOfferBadge(car, 'monthly', listBranchId)

    return (
      <tr key={car.id} className="hover:bg-slate-50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={display.image_url} alt="" className="h-12 w-20 rounded-lg object-cover" />
            <div>
              <p className="font-medium">{display.name}</p>
              <p className="text-xs text-slate-400">
                {car.brand} · {car.year}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-slate-400 line-through">{formatPrice(base)}</p>
          <p className="font-bold text-red-600">{formatPrice(effective)}</p>
        </td>
        <td className="px-4 py-3">
          <Badge variant={featured ? 'success' : 'warning'}>
            وفّر {formatPrice(savings)}
          </Badge>
          {!featured && (
            <p className="text-[11px] text-amber-700 mt-1">
              يحتاج {formatPrice(MONTHLY_FEATURED_MIN_SAVINGS - savings)} إضافية
            </p>
          )}
        </td>
        <td className="px-4 py-3">
          {badge ? <Badge variant="danger">{badge}</Badge> : '—'}
        </td>
        <td className="px-4 py-3">
          <Link to={`/admin/cars/${car.id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
              تعديل العرض والأسعار
            </Button>
          </Link>
        </td>
      </tr>
    )
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
                السيارات التي تظهر في قسم «العروض الشهرية المميزة» على الموقع — عرض شهري
                مفعّل بخصم {MONTHLY_FEATURED_MIN_SAVINGS} ر.س أو أكثر
              </p>
              {isBranchAdmin && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  عدّل الأسعار والعروض من صفحة تعديل السيارة — التغييرات تظهر لعملاء فرعك فقط
                </p>
              )}
            </>
          }
          action={
            <Link to="/admin/cars">
              <Button size="md" variant="outline" className="w-full sm:w-auto">
                أسطول السيارات
              </Button>
            </Link>
          }
        />

        {isGeneralAdmin && branches.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="offers-branch-filter" className="text-xs text-slate-500 shrink-0">
              معاينة فرع:
            </label>
            <select
              id="offers-branch-filter"
              className="input-field py-2 text-sm max-w-xs"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">كل الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-brand-gold/20 bg-gradient-to-b from-amber-50/80 to-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-brand-gold" />
                <h2 className="font-bold text-brand-dark">
                  ظاهرة في الموقع ({featuredCars.length})
                </h2>
              </div>

              {featuredCars.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <p className="text-slate-500 mb-2">لا توجد عروض شهرية مميزة حالياً</p>
                  <p className="text-xs text-slate-400 mb-4">
                    فعّل عرضاً شهرياً بخصم {MONTHLY_FEATURED_MIN_SAVINGS} ر.س أو أكثر من تعديل السيارة
                  </p>
                  <Link to="/admin/cars">
                    <Button>إدارة أسطول السيارات</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-right font-medium">السيارة</th>
                        <th className="px-4 py-3 text-right font-medium">السعر الشهري</th>
                        <th className="px-4 py-3 text-right font-medium">التوفير</th>
                        <th className="px-4 py-3 text-right font-medium">الشارة</th>
                        <th className="px-4 py-3 text-right font-medium">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {featuredCars.map((car) => renderCarRow(car, true))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {nearMissCars.length > 0 && (
              <section className="rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-sm">
                <h2 className="font-bold text-brand-dark mb-2">
                  عروض شهرية أخرى ({nearMissCars.length})
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  لها عرض شهري لكن الخصم أقل من {MONTHLY_FEATURED_MIN_SAVINGS} ر.س — لن تظهر في
                  قسم العروض الشهرية المميزة
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-right font-medium">السيارة</th>
                        <th className="px-4 py-3 text-right font-medium">السعر الشهري</th>
                        <th className="px-4 py-3 text-right font-medium">التوفير</th>
                        <th className="px-4 py-3 text-right font-medium">الشارة</th>
                        <th className="px-4 py-3 text-right font-medium">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {nearMissCars.map((car) => renderCarRow(car, false))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}