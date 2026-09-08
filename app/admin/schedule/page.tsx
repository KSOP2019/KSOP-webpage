import { redirect } from 'next/navigation'
import { ScheduleEditor } from '@/components/admin/schedule-editor'
import { getScheduleContent } from '@/lib/schedule-content'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminSchedulePage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const content = await getScheduleContent()

  return (
    <section className="admin-card">
      <h2>Schedule</h2>
      <p>Edit schedule page text and rectangular schedule-card images.</p>
      <ScheduleEditor initialContent={content} />
    </section>
  )
}
