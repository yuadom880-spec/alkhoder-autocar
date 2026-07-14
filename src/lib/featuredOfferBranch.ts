import { normalizeBranchIdForStorage } from './carBranchAvailability'
import { fetchBranches } from './supabase'
import type { FeaturedOffer, FeaturedOfferFormData } from './types'

function branchListIncludes(ids: string[], branchId: string): boolean {
  const target = normalizeBranchIdForStorage(branchId)
  return ids.some((id) => normalizeBranchIdForStorage(id) === target)
}

/** هل العرض مخصص لفروع محددة (وليس كل الفروع) */
export function isOfferBranchScoped(offer: FeaturedOffer): boolean {
  if ((offer.branch_ids?.length ?? 0) > 0) return true
  if ((offer.disabled_branch_ids?.length ?? 0) > 0) return true
  const carBranches = offer.car?.branch_ids ?? []
  return carBranches.length > 0
}

/** هل العرض يظهر لفرع العميل المختار */
export function offerMatchesBranch(
  offer: FeaturedOffer,
  branchId: string | null | undefined,
): boolean {
  if (!branchId) return true

  const enabled = offer.branch_ids ?? []
  const disabled = offer.disabled_branch_ids ?? []

  if (enabled.length > 0) return branchListIncludes(enabled, branchId)
  if (disabled.length > 0) return !branchListIncludes(disabled, branchId)
  if (offer.car?.branch_ids?.length) {
    return branchListIncludes(offer.car.branch_ids, branchId)
  }
  return true
}

/** عند الإضافة من وضع فرعي — يظهر العرض لفرع واحد فقط */
export async function buildFeaturedOfferBranchScope(
  data: FeaturedOfferFormData,
  existing: FeaturedOffer | null,
  branchScopeId: string | null,
): Promise<FeaturedOfferFormData> {
  if (!branchScopeId) {
    return {
      ...data,
      branch_ids: data.branch_ids ?? existing?.branch_ids ?? [],
      disabled_branch_ids: data.disabled_branch_ids ?? existing?.disabled_branch_ids ?? [],
    }
  }

  const branches = await fetchBranches({ activeOnly: false })
  const target = branchScopeId.trim()
  const otherBranchIds = branches
    .filter((b) => normalizeBranchIdForStorage(b.id) !== normalizeBranchIdForStorage(target))
    .map((b) => b.id)

  return {
    ...data,
    branch_ids: [target],
    disabled_branch_ids: otherBranchIds,
  }
}