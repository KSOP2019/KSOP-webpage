import { redirect } from 'next/navigation'
import { NewsEditor } from '@/components/admin/news-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminNewNewsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>New News Article</h2>
      <NewsEditor />
    </section>
  )
}
