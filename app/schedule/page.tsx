import type { Metadata } from 'next'
import DetailPage from '../detail-page'
import { getScheduleContent } from '@/lib/schedule-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '일정',
  description: 'KSOP 일정 — 다가오는 시리즈와 이벤트. Upcoming KSOP series and events.',
  alternates: { canonical: '/schedule' },
}

export default async function SchedulePage() {
  const scheduleContent = await getScheduleContent()
  return <DetailPage section="schedule" scheduleContent={scheduleContent} />
}
