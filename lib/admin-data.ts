import type { EventItem } from './types'
import { createAdminClient } from './supabase-server'

const EVENT_SELECT = 'id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by'

function mapAdminEvent(row: any): EventItem {
  const date = row.starts_at
    ? new Date(row.starts_at).toISOString().split('T')[0]
    : ''

  return {
    id: row.slug || String(row.id),
    date,
    dayLabel: `DAY ${row.event_number || 1}`,
    name: row.title || '',
    type: row.category || 'NLH',
    buyInType: row.entry_type || '',
    buyIn: row.buy_in != null ? String(row.buy_in) : '',
    gtd: row.guarantee != null ? String(row.guarantee) : '',
    startingChips: row.starting_stack || 0,
    lateReg: row.late_registration || '',
    levelTime: row.level_minutes ? String(row.level_minutes) : '',
    blindStructure: [],
    published: row.status === 'published',
  } as EventItem
}

export async function getAdminEvents(): Promise<EventItem[]> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_READ_BLOCKED: Supabase admin service role not configured.')
  }

  const { data, error } = await client
    .from('events')
    .select(EVENT_SELECT)
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error(`Supabase admin events read failed: ${error.message}`)
  }

  return (data || []).map(mapAdminEvent)
}

export async function getAdminEvent(id: string): Promise<EventItem | undefined> {
  const events = await getAdminEvents()
  return events.find((event) => event.id === id)
}

export async function deleteAdminEvent(id: string): Promise<void> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_DELETE_BLOCKED: Supabase admin service role not configured.')
  }

  const { error } = await client.from('events').delete().eq('slug', id)
  if (error) {
    throw new Error(`Supabase admin event delete failed: ${error.message}`)
  }
}
