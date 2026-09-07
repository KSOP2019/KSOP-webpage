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
  const { getPlayers: readPlayers, savePlayers } = await import('@/lib/data')
  const players = await readPlayers()
  const nextPlayer = {
    ...body,
    id: body.id ?? body.name.toLowerCase().replaceAll(' ', '-'),
    published: body.published ?? true,
  }
  players.push(nextPlayer)
  await savePlayers(players)
  return NextResponse.json(nextPlayer, { status: 201 })
}
