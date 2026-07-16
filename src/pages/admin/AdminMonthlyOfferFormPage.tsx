import { Link, useNavigate } from 'react-router'
import { AdminTopBar } from '../../components/admin/AdminTopBar'
import { CarForm } from '../../components/admin/CarForm'
import { Button } from '../../components/ui/Button'
import { useAdminBranch } from '../../context/AdminBranchContext'
import { buildCarBranchProfilePatch } from '../../lib/carBranchProfile'
import { copy } from '../../lib/copy'
import { normalizeCarOffers } from '../../lib/offers'
import { createCar } from '../../lib/supabase'
import type { Car, CarFormData } from '../../lib/types'

const BLANK_BRANCH_CAR = {
  branch_profiles: {},
  branch_names: {},
  branch_prices: {},
  branch_offers: {},
} as Car

const OFFERS_LIST = '/admin/offers'

export function AdminMonthlyOfferFormPage() {
  const navigate = useNavigate()
  const { isBranchAdmin, filterBranchId } = useAdminBranch()
  const branchScopeId = isBranchAdmin ? filterBranchId : null

  const saveAndReturn = async (data: CarFormData) => {
    const monthly = normalizeCarOffers(data.offer).monthly
    if (!monthly?.active) {
      throw new Error(copy.admin.monthlyOfferMustBeActive)
    }

    const payload: CarFormData = {
      ...data,
      is_featured: true,
      offer: { daily: null, monthly },
      price_per_day:
        data.price_per_day > 0
          ? data.price_per_day
          : Math.max(100, Math.round(data.price_per_month / 25)),
    }

    if (branchScopeId) {
      const profilePatch = buildCarBranchProfilePatch(BLANK_BRANCH_CAR, branchScopeId, payload)
      await createCar({
        ...payload,
        branch_ids: [branchScopeId],
        ...profilePatch,
      })
    } else {
      await createCar(payload)
    }
    navigate(OFFERS_LIST)
  }

  return (
    <>
      <AdminTopBar title={copy.admin.addMonthlyOffer} />
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-brand-dark">
              {copy.admin.addMonthlyOffer}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{copy.admin.addMonthlyOfferSub}</p>
            {isBranchAdmin && (
              <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-2xl">
                {copy.admin.monthlyOfferBranchCreateHint}
              </p>
            )}
          </div>
          <Link to={OFFERS_LIST}>
            <Button variant="ghost" size="sm">
              {copy.admin.backToMonthlyOffers}
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <CarForm
            monthlyFocus
            monthlyOfferCreate
            onSubmit={saveAndReturn}
            onCancel={() => navigate(OFFERS_LIST)}
          />
        </div>
      </div>
    </>
  )
}