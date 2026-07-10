import type { CarAvailability } from '../../lib/types'
import { getCustomerUnavailableLabel } from '../../lib/carStatus'
import { copy } from '../../lib/copy'
import { Badge } from '../ui/Badge'

interface CarAvailabilityBadgeProps {
  availability: CarAvailability
  showDatesHint?: boolean
}

export function CarAvailabilityBadge({
  availability,
  showDatesHint = false,
}: CarAvailabilityBadgeProps) {
  if (availability.reason === 'admin_disabled') {
    return <Badge variant="danger">{getCustomerUnavailableLabel('admin_disabled')}</Badge>
  }

  if (!availability.available && availability.reason === 'booked') {
    return <Badge variant="danger">{copy.cars.booked}</Badge>
  }

  if (availability.available && availability.hasPending) {
    return <Badge variant="warning">{copy.cars.pendingHold}</Badge>
  }

  if (showDatesHint && availability.available) {
    return <Badge variant="success">{copy.cars.availableForDates}</Badge>
  }

  return null
}