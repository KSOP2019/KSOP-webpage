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
  const { createAdminEvent } = await import('@/lib/admin-data')
  const { revalidateEventPages } = await import('@/lib/revalidate')
  const created = await createAdminEvent(body)
  revalidateEventPages()
  return NextResponse.json(created, { status: 201 })
}
