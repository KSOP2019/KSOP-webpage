import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminEvents } from '@/lib/admin-data'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminEventsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const events = await getAdminEvents()

  return (
    <section className="admin-card">
      <h2>Events</h2>
      <div className="admin-actions" style={{ marginBottom: '16px' }}>
        <Link className="admin-button" href="/admin/events/new">New Event</Link>
        <Link className="admin-button secondary" href="/admin/events/import">Import Excel</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Date</th>
            <th>Published</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.name}</td>
              <td>{event.type}</td>
              <td>{event.date}</td>
              <td>{event.published ? 'Yes' : 'No'}</td>
              <td>
                <Link href={`/admin/events/${event.id}`} className="admin-button secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
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
