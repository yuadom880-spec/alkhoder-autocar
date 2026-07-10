import { Outlet } from 'react-router'
import { AdminMobileNav } from '../../components/admin/AdminMobileNav'
import { AdminSidebar } from '../../components/admin/AdminSidebar'
import { AdminProtected } from '../../components/admin/AdminProtected'
import { AdminSupabaseBanner } from '../../components/admin/AdminSupabaseBanner'
import { AdminBranchProvider } from '../../context/AdminBranchContext'

export function AdminLayout() {
  return (
    <AdminProtected>
      <AdminBranchProvider>
        <div className="flex min-h-screen bg-slate-50">
          <AdminSidebar />
          <div className="flex-1 overflow-auto pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
            <AdminSupabaseBanner />
            <Outlet />
          </div>
          <AdminMobileNav />
        </div>
      </AdminBranchProvider>
    </AdminProtected>
  )
}