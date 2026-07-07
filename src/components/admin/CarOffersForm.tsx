import { CalendarDays, CalendarRange } from 'lucide-react'
import type { CarOffers } from '../../lib/types'
import { DEFAULT_OFFERS, normalizeCarOffers } from '../../lib/offers'
import { CarOfferForm } from './CarOfferForm'

interface CarOffersFormProps {
  dailyBasePrice: number
  monthlyBasePrice: number
  offers: CarOffers | null
  onChange: (offers: CarOffers | null) => void
}

export function CarOffersForm({
  dailyBasePrice,
  monthlyBasePrice,
  offers,
  onChange,
}: CarOffersFormProps) {
  const current = normalizeCarOffers(offers ?? DEFAULT_OFFERS)

  const updateDaily = (daily: CarOffers['daily']) => {
    onChange({ ...current, daily })
  }

  const updateMonthly = (monthly: CarOffers['monthly']) => {
    onChange({ ...current, monthly })
  }

  return (
    <div className="space-y-4">
      <CarOfferForm
        rentalType="daily"
        basePrice={dailyBasePrice}
        offer={current.daily}
        onChange={updateDaily}
        icon={CalendarDays}
        heading="عرض يومي"
      />
      <CarOfferForm
        rentalType="monthly"
        basePrice={monthlyBasePrice}
        offer={current.monthly}
        onChange={updateMonthly}
        icon={CalendarRange}
        heading="عرض شهري"
      />
    </div>
  )
}