import { createAdminClient, createPublicClient } from './supabase-server'

export type SeriesOption = {
  id: string
  slug: string
  title: string
  venue: string
  startsAt: string
  endsAt: string
  status: string
}

function mapSeries(row: any): SeriesOption {
  return {
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    venue: String(row.venue_name || ''),
    startsAt: String(row.starts_at || ''),
    endsAt: String(row.ends_at || ''),
    status: String(row.status || 'draft'),
  }
}

export async function getPublicSeriesOptions(): Promise<SeriesOption[]> {
  const client = createPublicClient()
  if (!client) return []
  const { data, error } = await client
    .from('series')
    .select('id,slug,title,venue_name,starts_at,ends_at,status')
    .eq('status', 'published')
    .order('starts_at', { ascending: true })
  if (error) {
    console.error('Public series read failed:', error.message)
    return []
  }
  return (data || []).map(mapSeries)
}

export async function getAdminSeriesOptions(): Promise<SeriesOption[]> {
  const client = createAdminClient()
  if (!client) return []
  const { data, error } = await client
    .from('series')
    .select('id,slug,title,venue_name,starts_at,ends_at,status')
    .order('starts_at', { ascending: true })
  if (error) {
    console.error('Admin series read failed:', error.message)
    return []
  }
  return (data || []).map(mapSeries)
}

/** Public route slug -> canonical public.series.id. */
export async function getEventSeriesLinkMap(): Promise<Record<string, string>> {
  const client = createPublicClient()
  if (!client) return {}
  const { data, error } = await client
    .from('events')
    .select('slug,series_id')
    .eq('status', 'published')
  if (error) {
    console.error('Event series link read failed:', error.message)
    return {}
  }
  return Object.fromEntries(
    (data || [])
      .filter((row: any) => row.slug && row.series_id)
      .map((row: any) => [String(row.slug), String(row.series_id)]),
  )
}
