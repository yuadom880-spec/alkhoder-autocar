import { Navigate } from 'react-router'

/** مسارات العروض القديمة — توجيه لإضافة عرض شهري */
export function AdminOfferFormPage() {
  return <Navigate to="/admin/offers/monthly/new" replace />
}