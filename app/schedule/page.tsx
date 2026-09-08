import DetailPage from '../detail-page'
import { getScheduleContent } from '@/lib/schedule-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SchedulePage() {
  const scheduleContent = await getScheduleContent()
  return <DetailPage section="schedule" scheduleContent={scheduleContent} />
}
