import { NextResponse } from 'next/server'
import { getEvent, getEvents, saveEvents } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const event = await getEvent(id)
  if (!event || !event.published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(event)
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()
  const events = await getEvents()
  const index = events.findIndex((event) => event.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  events[index] = { ...events[index], ...body, id }
  await saveEvents(events)
  return NextResponse.json(events[index])
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const events = await getEvents()
  const nextEvents = events.filter((event) => event.id !== id)
  if (nextEvents.length === events.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await saveEvents(nextEvents)
  return NextResponse.json({ ok: true })
}
