import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { CarAvailabilityPanel } from '../../components/admin/CarAvailabilityPanel'
import { CarForm } from '../../components/admin/CarForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { useAdminBranch } from '../../context/AdminBranchContext'
import {
  fetchCarById,
  setCarBranchAvailability,
  setCarBranchProfile,
  updateCar,
} from '../../lib/supabase'
import { carMatchesBranch, isCarExclusiveToBranch } from '../../lib/branchFilter'
import type { Car, CarFormData } from '../../lib/types'

const OFFERS_LIST = '/admin/offers'
const MONTHLY_OFFER_NEW = '/admin/offers/monthly/new'

/** تعديل عرض شهري لسيارة موجودة — يعود للعروض بعد الحفظ */
export function AdminOfferCarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isBranchAdmin, filterBranchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? filterBranchId : null
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchCarById(id)
      .then(setCar)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (!id) {
    return <Navigate to={MONTHLY_OFFER_NEW} replace />
  }

  if (loading) return <><AdminTopBar /><LoadingSpinner /></>

  if (!car) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">السيارة غير موجودة</p>
        <Link to={OFFERS_LIST} className="text-brand-green text-sm mt-2 inline-block">
          العودة للعروض الشهرية
        </Link>
      </div>
    )
  }

  if (car && isBranchAdmin && branchScopeId && !carMatchesBranch(car, branchScopeId)) {
    return <Navigate to={OFFERS_LIST} replace />
  }

  const saveAndReturn = async (data: CarFormData) => {
    if (id && car) {
      if (branchScopeId) {
        if (isCarExclusiveToBranch(car, branchScopeId)) {
          await updateCar(id, {
            ...data,
            branch_ids: [branchScopeId],
            unavailable_branch_ids: car.unavailable_branch_ids ?? [],
          })
        } else {
          await setCarBranchProfile(id, branchScopeId, data)
        }
      } else {
        await updateCar(id, {
          ...data,
          unavailable_branch_ids: car.unavailable_branch_ids ?? [],
        })
      }
    }
    navigate(OFFERS_LIST)
  }

  return (
    <>
      <AdminTopBar title="تعديل العرض الشهري" />
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg sm:text-2xl font-bold text-brand-dark">
            تعديل العرض الشهري والسعر
          </h1>
          <Link to={OFFERS_LIST}>
            <Button variant="ghost" size="sm">
              العودة للعروض الشهرية
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          التعديلات هنا تخص العرض الشهري والسعر الشهري.{' '}
          <Link to={`/admin/cars/${id}/edit`} className="text-brand-green hover:underline">
            تعديل كامل للسيارة (أسطول)
          </Link>
        </p>

        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {car && (
            <CarAvailabilityPanel
              car={car}
              onToggleAvailable={async (available) => {
                const updated = branchScopeId
                  ? await setCarBranchAvailability(car.id, branchScopeId, available)
                  : await updateCar(car.id, {
                      is_available: available,
                      ...(available ? { unavailable_branch_ids: [] } : {}),
                    })
                setCar(updated)
              }}
            />
          )}
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
            <CarForm
              initial={car ?? undefined}
              monthlyFocus
              onSubmit={saveAndReturn}
              onCancel={() => navigate(OFFERS_LIST)}
            />
          </div>
        </div>
      </div>
    </>
  )
}