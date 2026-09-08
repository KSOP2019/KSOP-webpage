import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminNews } from '@/lib/admin-news-data'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminNewsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const news = await getAdminNews()
  return (
    <section className="admin-card">
      <h2>News</h2>
      <div className="admin-actions" style={{ marginBottom: '16px' }}>
        <Link className="admin-button" href="/admin/news/new">New Article</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Published</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.adminId}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.published ? 'Yes' : 'No'}</td>
              <td>
                <Link href={`/admin/news/${item.adminId}`} className="admin-button secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
