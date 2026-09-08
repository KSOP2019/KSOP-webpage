import { redirect } from 'next/navigation'
import { getNewsItem } from '@/lib/data'
import { NewsEditor } from '@/components/admin/news-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminEditNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const { slug } = await params
  const item = await getNewsItem(slug)
  if (!item) redirect('/admin/news')
  return (
    <section className="admin-card">
      <h2>Edit News</h2>
      <NewsEditor initialItem={item} />
    </section>
  )
}
