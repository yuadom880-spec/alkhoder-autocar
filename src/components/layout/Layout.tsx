import { Outlet } from 'react-router'
import { CustomerBranchProvider } from '../../context/CustomerBranchContext'
import { PageSeo } from '../seo/PageSeo'
import { PricesIncludeVatNote } from '../ui/PricesIncludeVatNote'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileBookingBar } from './MobileBookingBar'
import { WhatsAppButton } from './WhatsAppButton'

export function Layout() {
  return (
    <CustomerBranchProvider>
    <div className="flex min-h-screen flex-col">
      <PageSeo />
      <Header />
      <div className="border-b border-brand-green/10 bg-brand-green/[0.04] py-2 text-center">
        <PricesIncludeVatNote className="mt-0" />
      </div>
      <main className="flex-1 pb-[4.25rem] lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBookingBar />
      <WhatsAppButton />
    </div>
    </CustomerBranchProvider>
  )
}