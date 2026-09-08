import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getNews, getPlayers } from '@/lib/data'
import { getAdminEvents } from '@/lib/admin-data'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')

  const [events, players, news] = await Promise.all([getAdminEvents(), getPlayers(), getNews()])

  return (
    <section className="admin-card">
      <h2>Dashboard</h2>
      <p>Manage the public site content, category pages, and detail pages from here.</p>

      <div className="admin-grid">
        <div className="admin-stat">
          <strong>{events.length}</strong>
          <span>Events</span>
        </div>
        <div className="admin-stat">
          <strong>{players.length}</strong>
          <span>Players</span>
        </div>
        <div className="admin-stat">
          <strong>{news.length}</strong>
          <span>News articles</span>
        </div>
      </div>

      <div className="admin-actions" style={{ marginTop: '24px' }}>
        <Link className="admin-button" href="/admin/content">
          Edit hero & posters
        </Link>
        <Link className="admin-button secondary" href="/admin/events/new">
          Add event
        </Link>
        <Link className="admin-button secondary" href="/events">
          Preview events page
        </Link>
      </div>
    </section>
  )
}
