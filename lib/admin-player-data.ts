import type { PlayerItem } from './types'
import { createAdminClient } from './supabase-server'

const PLAYER_SELECT = 'id,slug,name,display_name,country,portrait_url,rank,points,earnings,titles,final_tables,bio,status,sort_order,created_at,updated_at,updated_by'

export type AdminPlayerItem = PlayerItem & { adminId: string }

function mapAdminPlayer(row: any): AdminPlayerItem {
  return {
    adminId: String(row.id),
    id: row.slug || '',
    rank: row.rank || 0,
    name: row.name || row.display_name || '',
    country: row.country || '',
    earnings: row.earnings != null ? `₩ ${row.earnings}` : '₩ 0',
    portrait: row.portrait_url || '',
    bio: row.bio || '',
    published: row.status === 'published',
  }
}

function toPlayerPayload(player: PlayerItem) {
  return {
    name: player.name,
    display_name: player.name,
    country: player.country || '',
    portrait_url: player.portrait || '',
    rank: Number(player.rank) || 0,
    points: 0,
    earnings: parseInt(String(player.earnings || '').replace(/[₩,\s]/g, '')) || 0,
    titles: 0,
    final_tables: 0,
    bio: player.bio || '',
    status: player.published ? 'published' : 'draft',
    sort_order: Number(player.rank) || 0,
  }
}

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export async function getAdminPlayers(): Promise<AdminPlayerItem[]> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_PLAYER_READ_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('players')
    .select(PLAYER_SELECT)
    .order('rank', { ascending: true })

  if (error) throw new Error(`Supabase admin players read failed: ${error.message}`)
  return (data || []).map(mapAdminPlayer)
}

export async function getAdminPlayer(adminId: string): Promise<AdminPlayerItem | undefined> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_PLAYER_READ_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('players')
    .select(PLAYER_SELECT)
    .eq('id', adminId)
    .maybeSingle()

  if (error) throw new Error(`Supabase admin player read failed: ${error.message}`)
  return data ? mapAdminPlayer(data) : undefined
}

export async function createAdminPlayer(player: PlayerItem): Promise<AdminPlayerItem> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_PLAYER_CREATE_BLOCKED: Supabase admin service role not configured.')

  const slug = String(player.id || '').trim()
  if (!slug || !validSlug(slug)) throw new Error('ADMIN_PLAYER_CREATE_BLOCKED: invalid slug')

  const payload = { slug, ...toPlayerPayload(player) }
  const { data, error } = await client
    .from('players')
    .insert(payload)
    .select(PLAYER_SELECT)
    .single()

  if (error) throw new Error(`Supabase admin player create failed: ${error.message}`)
  return mapAdminPlayer(data)
}

export async function updateAdminPlayer(adminId: string, player: PlayerItem): Promise<AdminPlayerItem> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_PLAYER_UPDATE_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('players')
    .update(toPlayerPayload(player))
    .eq('id', adminId)
    .select(PLAYER_SELECT)
    .single()

  if (error) throw new Error(`Supabase admin player update failed: ${error.message}`)
  return mapAdminPlayer(data)
}

export async function deleteAdminPlayer(adminId: string): Promise<void> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_PLAYER_DELETE_BLOCKED: Supabase admin service role not configured.')

  const { error } = await client.from('players').delete().eq('id', adminId)
  if (error) throw new Error(`Supabase admin player delete failed: ${error.message}`)
}
