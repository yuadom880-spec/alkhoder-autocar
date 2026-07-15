import { Link } from 'react-router'
import { Edit, Power, Trash2 } from 'lucide-react'
import type { Car } from '../../lib/types'
import { copy } from '../../lib/copy'
import {
  getAdminCarDeleteLabel,
  getAdminCarToggleLabel,
} from '../../lib/carStatus'
import { Button } from '../ui/Button'

interface AdminCarActionButtonsProps {
  car: Car
  branchScopeId: string | null
  isBranchAdmin: boolean
  toggling: boolean
  deleting: boolean
  fleetEditPath: string
  monthlyOfferEditPath?: string
  onToggleAvailable: () => void
  onDelete: () => void
  /** عمودي — أوضح على الشاشات الكبيرة */
  layout?: 'stack' | 'row'
}

export function AdminCarActionButtons({
  car,
  branchScopeId,
  isBranchAdmin,
  toggling,
  deleting,
  fleetEditPath,
  monthlyOfferEditPath,
  onToggleAvailable,
  onDelete,
  layout = 'stack',
}: AdminCarActionButtonsProps) {
  const toggleLabel = getAdminCarToggleLabel(car, branchScopeId)
  const deleteLabel = getAdminCarDeleteLabel(car, branchScopeId, isBranchAdmin)

  const btnClass =
    layout === 'stack'
      ? 'w-full justify-start gap-2 min-h-[40px] text-xs font-semibold'
      : 'gap-1.5 min-h-[36px] text-xs font-semibold'

  const wrapClass =
    layout === 'stack'
      ? 'flex flex-col gap-1.5 min-w-[168px]'
      : 'flex flex-wrap gap-1.5'

  return (
    <div className={wrapClass}>
      <Button
        size="sm"
        variant="outline"
        className={btnClass}
        isLoading={toggling}
        onClick={onToggleAvailable}
      >
        <Power className="h-3.5 w-3.5 shrink-0" />
        <span>{toggleLabel}</span>
      </Button>

      {monthlyOfferEditPath && (
        <Link to={monthlyOfferEditPath} className={layout === 'stack' ? 'w-full' : undefined}>
          <Button size="sm" variant="outline" className={btnClass}>
            <Edit className="h-3.5 w-3.5 shrink-0" />
            <span>{copy.admin.editMonthlyOffer}</span>
          </Button>
        </Link>
      )}

      <Link to={fleetEditPath} className={layout === 'stack' ? 'w-full' : undefined}>
        <Button size="sm" variant="outline" className={btnClass}>
          <Edit className="h-3.5 w-3.5 shrink-0" />
          <span>{copy.admin.editCar}</span>
        </Button>
      </Link>

      <Button
        size="sm"
        variant="outline"
        className={`${btnClass} text-red-600 border-red-200 hover:bg-red-50`}
        isLoading={deleting}
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5 shrink-0" />
        <span>{deleteLabel}</span>
      </Button>
    </div>
  )
}