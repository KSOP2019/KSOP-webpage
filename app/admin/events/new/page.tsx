import { redirect } from 'next/navigation'
import { EventEditor } from '@/components/admin/event-editor'
import { getAdminSeriesOptions } from '@/lib/series-db'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminNewEventPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const seriesOptions = await getAdminSeriesOptions()
  return (
    <section className="admin-card">
      <h2>New Event</h2>
      <EventEditor seriesOptions={seriesOptions} />
    </section>
  )
}
