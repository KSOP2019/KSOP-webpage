import './admin.css'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated()

  return (
    <div className="admin-root">
      {authed ? (
        <div className="admin-shell">
          <AdminNav />
          <main className="admin-main">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }
}
