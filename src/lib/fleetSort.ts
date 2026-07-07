import type { Car, CarAvailability, RentalPeriodType } from './types'
import { getSortPrice } from './pricing'

export type FleetSortOption = 'default' | 'price-asc' | 'price-desc'

export function sortFleet(
  items: { car: Car; availability: CarAvailability }[],
  rentalType: RentalPeriodType,
  sort: FleetSortOption,
): { car: Car; availability: CarAvailability }[] {
  let visible = [...items]

  if (sort === 'price-asc') {
    visible.sort((a, b) => getSortPrice(a.car, rentalType) - getSortPrice(b.car, rentalType))
  }
  if (sort === 'price-desc') {
    visible.sort((a, b) => getSortPrice(b.car, rentalType) - getSortPrice(a.car, rentalType))
  }
  if (sort === 'default') {
    visible.sort((a, b) => {
      if (a.availability.available !== b.availability.available) {
        return a.availability.available ? -1 : 1
      }
      return 0
    })
  }

  return visible
}