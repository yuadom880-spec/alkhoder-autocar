import { useSearchParams } from 'react-router'
import { parseRentalType } from '../lib/pricing'
import type { RentalPeriodType } from '../lib/types'

export function useRentalPeriod() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rentalType = parseRentalType(searchParams.get('rental'))

  const setRentalType = (type: RentalPeriodType) => {
    const params = new URLSearchParams(searchParams)
    if (type === 'daily') params.delete('rental')
    else params.set('rental', type)
    setSearchParams(params, { replace: true })
  }

  return { rentalType, setRentalType }
}