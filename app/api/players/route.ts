import { NextResponse } from 'next/server'
import { getPlayers } from '@/lib/data'

export async function GET() {
  const players = await getPlayers()
  return NextResponse.json(players.filter((player) => player.published))
}

export async function POST(request: Request) {
  const { isAdminAuthenticated } = await import('@/lib/auth')
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { createAdminPlayer } = await import('@/lib/admin-player-data')
  const slug = String(body.id || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '').trim()
  const player = await createAdminPlayer({
    ...body,
    id: slug,
    published: body.published ?? false,
  })
  return NextResponse.json(player, { status: 201 })
}
