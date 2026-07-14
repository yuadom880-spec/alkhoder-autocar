import { Link } from 'react-router'
import { Calendar, Edit, Power, Trash2 } from 'lucide-react'
import type { BookingBlock, BranchRecord, Car } from '../../lib/types'
import { getCarDisplayName } from '../../lib/carBranchLabels'
import { formatCarBranchLabels } from '../../lib/branchFilter'
import { getCategoryLabel, getClassLabel } from '../../lib/constants'
import {
  getAdminCarDeleteLabel,
  getAdminCarStatusLabel,
  getAdminCarToggleLabel,
  isCarEnabledForAdminScope,
} from '../../lib/carStatus'
import { getEffectivePrice, getOfferBadge, isOfferActive } from '../../lib/offers'
import { formatPrice } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface AdminCarMobileCardProps {
  car: Car
  branches: BranchRecord[]
  filterBranchId: string | null
  branchScopeId: string | null
  isBranchAdmin?: boolean
  activeBlocks: BookingBlock[]
  toggling: boolean
  deleting: boolean
  onToggleAvailable: () => void
  onDelete: () => void
}

export function AdminCarMobileCard({
  car,
  branches,
  filterBranchId,
  branchScopeId,
  isBranchAdmin = false,
  activeBlocks,
  toggling,
  deleting,
  onToggleAvailable,
  onDelete,
}: AdminCarMobileCardProps) {
  const hasConfirmed = activeBlocks.some((b) => b.status === 'confirmed')
  const hasPending = activeBlocks.some((b) => b.status === 'pending')

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <img src={car.image_url} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-brand-dark leading-snug">
            {getCarDisplayName(car, branchScopeId)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {car.brand} · {car.year}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
            {formatCarBranchLabels(car, branches)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge>{getCategoryLabel(car.category)}</Badge>
            <Badge variant="info">{getClassLabel(car.car_class)}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-400">يومي</p>
          <p className={isOfferActive(car, 'daily', filterBranchId) ? 'font-bold text-red-600' : 'font-bold'}>
            {formatPrice(getEffectivePrice(car, 'daily', filterBranchId))}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-400">شهري</p>
          <p className={isOfferActive(car, 'monthly', filterBranchId) ? 'font-bold text-red-600' : 'font-bold'}>
            {formatPrice(getEffectivePrice(car, 'monthly', filterBranchId))}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant={isCarEnabledForAdminScope(car, branchScopeId) ? 'success' : 'danger'}>
          {getAdminCarStatusLabel(car, branchScopeId)}
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px]"
          isLoading={toggling}
          onClick={onToggleAvailable}
        >
          <Power className="h-4 w-4" />
          {getAdminCarToggleLabel(car, branchScopeId)}
        </Button>
        <Link to={`/admin/cars/${car.id}/edit`} className="col-span-1">
          <Button size="sm" variant="outline" className="w-full min-h-[44px]">
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] text-red-600 hover:bg-red-50"
          isLoading={deleting}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          {getAdminCarDeleteLabel(car, branchScopeId, isBranchAdmin)}
        </Button>
      </div>
    </article>
  )
}