import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { CarsPage } from './pages/CarsPage'
import { CarDetailPage } from './pages/CarDetailPage'
import { BookingPage } from './pages/BookingPage'
import { OfferBookingPage } from './pages/OfferBookingPage'
import { AboutPage } from './pages/AboutPage'
import { BranchesPage } from './pages/BranchesPage'
import { OffersPage } from './pages/OffersPage'
import { LocationsIndexPage } from './pages/LocationsIndexPage'
import { LocationPage } from './pages/LocationPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminCarsPage } from './pages/admin/AdminCarsPage'
import { AdminCarFormPage } from './pages/admin/AdminCarFormPage'
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage'
import { AdminOffersPage } from './pages/admin/AdminOffersPage'
import { AdminOfferFormPage } from './pages/admin/AdminOfferFormPage'
import { AdminBranchesPage } from './pages/admin/AdminBranchesPage'
import { AdminBranchFormPage } from './pages/admin/AdminBranchFormPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="book/offer/:offerId" element={<OfferBookingPage />} />
          <Route path="book/:id" element={<BookingPage />} />
          <Route path="about" element={<AboutPage />} />
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
    </BrowserRouter>
  )
}