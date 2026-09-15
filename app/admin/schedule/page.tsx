import { redirect } from 'next/navigation'
import { ScheduleEditor } from '@/components/admin/schedule-editor'
import { getScheduleContent } from '@/lib/schedule-content'
import { getAdminSeriesOptions } from '@/lib/series-db'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminSchedulePage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const [content, seriesOptions] = await Promise.all([
    getScheduleContent(),
    getAdminSeriesOptions(),
  ])

  return (
    <section className="admin-card">
      <h2>Schedule</h2>
      <p>Edit schedule page text, series images, and the exact series → event connection.</p>
      <ScheduleEditor initialContent={content} seriesOptions={seriesOptions} />
    </section>
  )
}
