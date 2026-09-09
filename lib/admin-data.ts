import type { EventItem } from './types'
import { createAdminClient } from './supabase-server'

const EVENT_SELECT = 'id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by,poster_url,banner_url,thumbnail_url'
const EVENT_SELECT_LEGACY = 'id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by'

const IMAGE_COLUMNS = ['poster_url', 'banner_url', 'thumbnail_url'] as const

function isMissingImageColumnError(message: string): boolean {
  return /poster_url|banner_url|thumbnail_url/.test(message || '')
}

/** Drop image keys when the migration has not been applied yet (deploy-safe). */
function withoutImageColumns<T extends Record<string, any>>(payload: T): T {
  const next: Record<string, any> = { ...payload }
  for (const key of IMAGE_COLUMNS) delete next[key]
  return next as T
}

function mapAdminEvent(row: any): EventItem {
  const date = row.starts_at
    ? new Date(row.starts_at).toISOString().split('T')[0]
    : ''

  return {
    // Admin mutations must use the immutable database UUID, never slug.
    id: String(row.id),
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
    posterUrl: row.poster_url || '',
    bannerUrl: row.banner_url || '',
    thumbnailUrl: row.thumbnail_url || '',
  } as EventItem
}

function toAdminEventPayload(event: EventItem) {
  const yearRegex = /\b(19|20)\d{2}\b/
  if (!yearRegex.test(event.date || '')) {
    throw new Error(`PRODUCTION_WRITE_BLOCKED_INVALID_DATE: Event "${event.name}" date "${event.date}" must contain an explicit 4-digit year.`)
  }

  const parsed = new Date(event.date)
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() <= 1970) {
    throw new Error(`PRODUCTION_WRITE_BLOCKED_INVALID_DATE: Event "${event.name}" date "${event.date}" cannot be converted to a valid timestamptz.`)
  }

  return {
    title: event.name,
    category: event.type,
    entry_type: event.buyInType,
    starts_at: event.date,
    buy_in: parseInt(String(event.buyIn || '').replace(/[₩,]/g, '')) || 0,
    fee: 0,
    guarantee: parseInt(String(event.gtd || '').replace(/[₩,]/g, '')) || 0,
    starting_stack: event.startingChips || 0,
    level_minutes: parseInt(String(event.levelTime || '')) || 15,
    late_registration: event.lateReg || '',
    event_status: 'SCHEDULED',
    status: event.published ? 'published' : 'draft',
    poster_url: event.posterUrl || '',
    banner_url: event.bannerUrl || '',
    thumbnail_url: event.thumbnailUrl || '',
  }
}

export async function getAdminEvents(): Promise<EventItem[]> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_READ_BLOCKED: Supabase admin service role not configured.')
  }

  const baseQuery = (columns: string) => client
    .from('events')
    .select(columns)
    .order('starts_at', { ascending: true })

  let result: any = await baseQuery(EVENT_SELECT)
  // Safe rollout: fall back to the legacy column list until the migration is applied.
  if (result.error && isMissingImageColumnError(result.error.message)) {
    console.warn('Admin events image columns missing; using legacy select until migration is applied.')
    result = await baseQuery(EVENT_SELECT_LEGACY)
  }
  const { data, error } = result

  if (error) {
    throw new Error(`Supabase admin events read failed: ${error.message}`)
  }

  return (data || []).map(mapAdminEvent)
}

export async function getAdminEvent(id: string): Promise<EventItem | undefined> {
  const events = await getAdminEvents()
  return events.find((event) => event.id === id)
}

export async function createAdminEvent(event: EventItem): Promise<EventItem> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_CREATE_BLOCKED: Supabase admin service role not configured.')
  }

  const payload = {
    ...toAdminEventPayload(event),
    slug: `event-${Date.now()}`,
    event_number: 1,
    sort_order: 0,
  }

  const attempt = (body: Record<string, any>) => client
    .from('events')
    .insert(body)
    .select(EVENT_SELECT)
    .single()

  let result: any = await attempt(payload)
  // Safe rollout: retry without image columns when the migration is pending.
  if (result.error && isMissingImageColumnError(result.error.message)) {
    console.warn('Admin event create retried without image columns (migration pending).')
    result = await client
      .from('events')
      .insert(withoutImageColumns(payload))
      .select(EVENT_SELECT_LEGACY)
      .single()
  }
  const { data, error } = result

  if (error) {
    throw new Error(`Supabase admin event create failed: ${error.message}`)
  }

  return mapAdminEvent(data)
}

export async function updateAdminEvent(id: string, event: EventItem): Promise<EventItem> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_UPDATE_BLOCKED: Supabase admin service role not configured.')
  }

  const payload = toAdminEventPayload(event)
  const attempt = (body: Record<string, any>) => client
    .from('events')
    .update(body)
    .eq('id', id)
    .select(EVENT_SELECT)
    .single()

  let result: any = await attempt(payload)
  // Safe rollout: retry without image columns when the migration is pending.
  if (result.error && isMissingImageColumnError(result.error.message)) {
    console.warn('Admin event update retried without image columns (migration pending).')
    result = await client
      .from('events')
      .update(withoutImageColumns(payload))
      .eq('id', id)
      .select(EVENT_SELECT_LEGACY)
      .single()
  }
  const { data, error } = result

  if (error) {
    throw new Error(`Supabase admin event update failed: ${error.message}`)
  }

  return mapAdminEvent(data)
}

export async function deleteAdminEvent(id: string): Promise<void> {
  const client = createAdminClient()
  if (!client) {
    throw new Error('ADMIN_DELETE_BLOCKED: Supabase admin service role not configured.')
  }

  const { error } = await client.from('events').delete().eq('id', id)
  if (error) {
    throw new Error(`Supabase admin event delete failed: ${error.message}`)
  }
}
