import { Outlet } from 'react-router'
import { AdminMobileNav } from '../../components/admin/AdminMobileNav'
import { AdminSidebar } from '../../components/admin/AdminSidebar'
import { AdminProtected } from '../../components/admin/AdminProtected'
import { AdminSupabaseBanner } from '../../components/admin/AdminSupabaseBanner'
import { CopyrightNotice } from '../../components/layout/CopyrightNotice'
import { PageSeo } from '../../components/seo/PageSeo'
import { AdminBranchProvider } from '../../context/AdminBranchContext'

export function AdminLayout() {
  return (
    <AdminProtected>
      <AdminBranchProvider>
        <PageSeo />
        <div className="flex min-h-screen bg-slate-50">
          <AdminSidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <div className="flex-1 overflow-auto pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
              <AdminSupabaseBanner />
              <Outlet />
            </div>
            <CopyrightNotice variant="admin" />
          </div>
          <AdminMobileNav />
        </div>
      </AdminBranchProvider>
    </AdminProtected>
  )
}