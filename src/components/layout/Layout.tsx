import { Outlet } from 'react-router'
import { PageSeo } from '../seo/PageSeo'
import { Footer } from './Footer'
import { Header } from './Header'
import { WhatsAppButton } from './WhatsAppButton'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageSeo />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}