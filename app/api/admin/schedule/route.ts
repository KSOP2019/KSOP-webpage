import { NextResponse } from 'next/server'
import { getScheduleContent, saveScheduleContent } from '@/lib/schedule-content'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getScheduleContent())
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const saved = await saveScheduleContent(body)
  const { revalidateSchedulePages, revalidateSeriesPages } = await import('@/lib/revalidate')
  revalidateSchedulePages()
  revalidateSeriesPages()
  return NextResponse.json(saved)
}
