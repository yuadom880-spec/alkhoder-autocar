import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { CarAvailabilityPanel } from '../../components/admin/CarAvailabilityPanel'
import { CarForm } from '../../components/admin/CarForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAdminBranch } from '../../context/AdminBranchContext'
import {
  createCar,
  fetchCarById,
  setCarBranchAvailability,
  setCarBranchPrices,
  updateCar,
} from '../../lib/supabase'
import { carMatchesBranch, isCarExclusiveToBranch } from '../../lib/branchFilter'
import type { Car } from '../../lib/types'

export function AdminCarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isBranchAdmin, filterBranchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? filterBranchId : null
  const isEdit = Boolean(id)
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    fetchCarById(id)
      .then(setCar)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <><AdminTopBar /><LoadingSpinner /></>

  if (isEdit && !car) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">السيارة غير موجودة</p>
      </div>
    )
  }

  if (isEdit && car && isBranchAdmin && branchScopeId && !carMatchesBranch(car, branchScopeId)) {
    return <Navigate to="/admin/cars" replace />
  }

  return (
    <>
      <AdminTopBar title={isEdit ? 'تعديل السيارة' : 'إضافة سيارة'} />
      <div className="p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-brand-dark mb-5">
        {isEdit ? 'تعديل السيارة' : 'إضافة سيارة جديدة'}
      </h1>
      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {isEdit && car && (
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
            onSubmit={async (data) => {
              if (isEdit && id && car) {
                if (branchScopeId) {
                  await setCarBranchPrices(id, branchScopeId, {
                    price_per_day: data.price_per_day,
                    price_per_month: data.price_per_month,
                  })
                  if (isCarExclusiveToBranch(car, branchScopeId)) {
                    const { price_per_day: _d, price_per_month: _m, ...globalPatch } = data
                    await updateCar(id, {
                      ...globalPatch,
                      branch_ids: [branchScopeId],
                      unavailable_branch_ids: car.unavailable_branch_ids ?? [],
                    })
                  }
                } else {
                  await updateCar(id, {
                    ...data,
                    unavailable_branch_ids: car.unavailable_branch_ids ?? [],
                  })
                }
              } else if (branchScopeId) {
                await createCar({ ...data, branch_ids: [branchScopeId] })
              } else {
                await createCar(data)
              }
              navigate('/admin/cars')
            }}
            onCancel={() => navigate('/admin/cars')}
          />
        </div>
      </div>
      </div>
    </>
  )
}