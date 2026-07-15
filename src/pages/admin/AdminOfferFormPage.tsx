import { Navigate } from 'react-router'

/** العروض تُدار الآن من تعديل السيارة — أسعار وعروض يومية/شهرية لكل فرع */
export function AdminOfferFormPage() {
  return <Navigate to="/admin/offers" replace />
}