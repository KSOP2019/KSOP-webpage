import { redirect } from 'next/navigation'
import { EventEditor } from '@/components/admin/event-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminNewEventPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>New Event</h2>
      <EventEditor />
    </section>
  )
}
