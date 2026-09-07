import { NextResponse } from 'next/server'
import { getPlayer, getPlayers, savePlayers } from '@/lib/data'
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
  const players = await getPlayers()
  const index = players.findIndex((player) => player.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  players[index] = { ...players[index], ...body, id }
  await savePlayers(players)
  return NextResponse.json(players[index])
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const players = await getPlayers()
  const nextPlayers = players.filter((player) => player.id !== id)
  if (nextPlayers.length === players.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await savePlayers(nextPlayers)
  return NextResponse.json({ ok: true })
}
