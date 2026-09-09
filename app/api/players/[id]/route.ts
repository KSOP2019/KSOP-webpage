import { NextResponse } from 'next/server'
import { getPlayer } from '@/lib/data'
import { deleteAdminPlayer, getAdminPlayer, updateAdminPlayer } from '@/lib/admin-player-data'
import { revalidatePlayerPages } from '@/lib/revalidate'
import { isAdminAuthenticated } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const player = await getPlayer(id)
  if (!player || !player.published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(player)
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()
  const current = await getAdminPlayer(id)
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await updateAdminPlayer(id, { ...current, ...body, id: current.id })
  revalidatePlayerPages()
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const current = await getAdminPlayer(id)
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteAdminPlayer(id)
  revalidatePlayerPages()
  return NextResponse.json({ ok: true })
}
