import { NextResponse } from 'next/server'
import { getEvent } from '@/lib/data'
import { deleteAdminEvent, getAdminEvents, updateAdminEvent } from '@/lib/admin-data'
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
  const events = await getAdminEvents()
  const current = events.find((event) => event.id === id)
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await updateAdminEvent(id, { ...current, ...body, id })
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const events = await getAdminEvents()
  if (!events.some((event) => event.id === id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await deleteAdminEvent(id)
  return NextResponse.json({ ok: true })
}
