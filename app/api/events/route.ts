import { NextResponse } from 'next/server'
import { getEvents } from '@/lib/data'

export async function GET() {
  const events = await getEvents()
  return NextResponse.json(events.filter((event) => event.published))
}

export async function POST(request: Request) {
  const { isAdminAuthenticated } = await import('@/lib/auth')
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { getEvents: readEvents, saveEvents } = await import('@/lib/data')
  const events = await readEvents()
  const nextEvent = {
    ...body,
    id: body.id ?? `event-${Date.now()}`,
    published: body.published ?? true,
  }
  events.push(nextEvent)
  await saveEvents(events)
  return NextResponse.json(nextEvent, { status: 201 })
}
