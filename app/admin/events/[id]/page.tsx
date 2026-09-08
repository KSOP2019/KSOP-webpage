import { redirect } from 'next/navigation'
import { getAdminEvent } from '@/lib/admin-data'
import { EventEditor } from '@/components/admin/event-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const { id } = await params
  const event = await getAdminEvent(id)
  if (!event) redirect('/admin/events')
  return (
    <section className="admin-card">
      <h2>Edit Event</h2>
      <EventEditor initialEvent={event} />
    </section>
  )
}
