import { Navigate } from 'react-router'

/** مسارات العروض القديمة — توجيه لقسم العروض الشهرية */
export function AdminOfferFormPage() {
  return <Navigate to="/admin/offers/cars/new" replace />
}