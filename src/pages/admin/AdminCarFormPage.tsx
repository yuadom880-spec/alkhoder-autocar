import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { CarAvailabilityPanel } from '../../components/admin/CarAvailabilityPanel'
import { CarForm } from '../../components/admin/CarForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { createCar, fetchCarById, updateCar } from '../../lib/supabase'
import type { Car } from '../../lib/types'

export function AdminCarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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

  return (
    <>
      <AdminTopBar title={isEdit ? 'تعديل السيارة' : 'إضافة سيارة'} />
      <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-brand-dark mb-6">
        {isEdit ? 'تعديل السيارة' : 'إضافة سيارة جديدة'}
      </h1>
      <div className="max-w-2xl space-y-6">
        {isEdit && car && (
          <CarAvailabilityPanel
            car={car}
            onToggleAvailable={async (available) => {
              const updated = await updateCar(car.id, { is_available: available })
              setCar(updated)
            }}
          />
        )}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <CarForm
            initial={car ?? undefined}
            onSubmit={async (data) => {
              if (isEdit && id) {
                await updateCar(id, data)
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