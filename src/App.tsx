import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const CarsPage = lazy(() => import('./pages/CarsPage').then((m) => ({ default: m.CarsPage })))
const CarDetailPage = lazy(() =>
  import('./pages/CarDetailPage').then((m) => ({ default: m.CarDetailPage })),
)
const BookingPage = lazy(() =>
  import('./pages/BookingPage').then((m) => ({ default: m.BookingPage })),
)
const OfferBookingPage = lazy(() =>
  import('./pages/OfferBookingPage').then((m) => ({ default: m.OfferBookingPage })),
)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const BranchesPage = lazy(() =>
  import('./pages/BranchesPage').then((m) => ({ default: m.BranchesPage })),
)
const OffersPage = lazy(() => import('./pages/OffersPage').then((m) => ({ default: m.OffersPage })))
const LocationsIndexPage = lazy(() =>
  import('./pages/LocationsIndexPage').then((m) => ({ default: m.LocationsIndexPage })),
)
const LocationPage = lazy(() =>
  import('./pages/LocationPage').then((m) => ({ default: m.LocationPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminCarsPage = lazy(() =>
  import('./pages/admin/AdminCarsPage').then((m) => ({ default: m.AdminCarsPage })),
)
const AdminCarFormPage = lazy(() =>
  import('./pages/admin/AdminCarFormPage').then((m) => ({ default: m.AdminCarFormPage })),
)
const AdminBookingsPage = lazy(() =>
  import('./pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })),
)
const AdminOffersPage = lazy(() =>
  import('./pages/admin/AdminOffersPage').then((m) => ({ default: m.AdminOffersPage })),
)
const AdminOfferFormPage = lazy(() =>
  import('./pages/admin/AdminOfferFormPage').then((m) => ({ default: m.AdminOfferFormPage })),
)
const AdminBranchesPage = lazy(() =>
  import('./pages/admin/AdminBranchesPage').then((m) => ({ default: m.AdminBranchesPage })),
)
const AdminBranchFormPage = lazy(() =>
  import('./pages/admin/AdminBranchFormPage').then((m) => ({ default: m.AdminBranchFormPage })),
)

function PageFallback() {
  return <LoadingSpinner className="min-h-[50vh]" />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<CarsPage />} />
            <Route path="cars/:id" element={<CarDetailPage />} />
            <Route path="book/offer/:offerId" element={<OfferBookingPage />} />
            <Route path="book/:id" element={<BookingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="locations" element={<LocationsIndexPage />} />
            <Route path="locations/:slug" element={<LocationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="cars" element={<AdminCarsPage />} />
            <Route path="cars/new" element={<AdminCarFormPage />} />
            <Route path="cars/:id/edit" element={<AdminCarFormPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="offers/new" element={<AdminOfferFormPage />} />
            <Route path="offers/:id/edit" element={<AdminOfferFormPage />} />
            <Route path="branches" element={<AdminBranchesPage />} />
            <Route path="branches/new" element={<AdminBranchFormPage />} />
            <Route path="branches/:id/edit" element={<AdminBranchFormPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}