import { Outlet } from 'react-router'
import { AdminMobileNav } from '../../components/admin/AdminMobileNav'
import { AdminSidebar } from '../../components/admin/AdminSidebar'
import { AdminProtected } from '../../components/admin/AdminProtected'

export function AdminLayout() {
  return (
    <AdminProtected>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </div>
        <AdminMobileNav />
      </div>
    </AdminProtected>
  )
}