import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { isAdminAuthenticated } = await import('@/lib/auth')
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const client = createAdminClient()
  if (!client) {
    return NextResponse.json({ error: 'Admin DB not configured' }, { status: 500 })
  }
  const { data, error } = await client.from('player_results').insert({
    player_id: body.playerId,
    event_id: body.eventId || null,
    event_name: body.eventName || '',
    event_date: body.eventDate || '',
    position: Number(body.position) || 1,
    field_size: Number(body.fieldSize) || 1,
    buy_in: Number(body.buyIn) || 0,
    earnings: body.earnings != null ? Number(body.earnings) : 0,
  }).select('id').single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const { isAdminAuthenticated } = await import('@/lib/auth')
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await request.json()
  const client = createAdminClient()
  if (!client) {
    return NextResponse.json({ error: 'Admin DB not configured' }, { status: 500 })
  }
  const { error } = await client.from('player_results').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
