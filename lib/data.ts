import { promises as fs } from 'fs'
import path from 'path'
import type { EventItem, NewsItem, PlayerItem, SiteContent, SiteData } from './types'
import { filterEvents } from './event-filters'
import { createSeedEvents, seedContent, seedNews, seedPlayers } from './seed'
import { createPublicClient, createAdminClient } from './supabase-server'

export { filterEvents }

const dataDir = path.join(process.cwd(), 'data')

function supabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function supabaseAdminConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir()
  const filePath = path.join(dataDir, filename)

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8')
    return fallback
  }
}

async function writeJsonFile<T>(filename: string, value: T) {
  await ensureDataDir()
  const filePath = path.join(dataDir, filename)
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

// --- Events ---

export async function getEvents(): Promise<EventItem[]> {
  const client = createPublicClient()
  if (client) {
    const { data, error } = await client
      .from('events')
      .select('id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by')
      .eq('status', 'published')
      .order('starts_at', { ascending: true })

    if (error) {
      console.error('Supabase events read error:', error.message)
      // Controlled fallback for reads when configured but query fails
      return readJsonFile('events.json', createSeedEvents())
    }

    if (!data || data.length === 0) {
      return readJsonFile('events.json', createSeedEvents())
    }

    return data.map((row: any) => ({
      id: String(row.id),
      date: row.starts_at ? `NOV ${new Date(row.starts_at).getDate()}` : 'NOV 17',
      dayLabel: `DAY ${row.event_number || 1}`,
      name: row.title || 'Event',
      type: (row.category || 'NLH') as EventItem['type'],
      buyInType: row.entry_type || 'INVITATION',
      buyIn: row.buy_in ? `₩${row.buy_in}` : '₩10,000',
      gtd: row.guarantee ? `₩${row.guarantee}` : '₩10,000',
      startingChips: row.starting_stack || 15000,
      lateReg: row.late_registration || 'LEVEL 8',
      levelTime: row.level_minutes ? `${row.level_minutes} MIN` : '15 MIN',
      blindStructure: [{ level: 1, small: 100, big: 200, ante: 200 }],
      published: row.status === 'published',
    }))
  }

  return readJsonFile('events.json', createSeedEvents())
}

export async function getEvent(id: string): Promise<EventItem | undefined> {
  const events = await getEvents()
  return events.find((event) => event.id === id)
}

export async function saveEvents(events: EventItem[]) {
  const adminClient = createAdminClient()
  if (isProduction() && !adminClient) {
    throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role not configured. Configure SUPABASE_SERVICE_ROLE_KEY to enable persistent writes.')
  }

  if (adminClient) {
    // Production/admin persistence path
    for (const event of events) {
      const payload = {
        slug: event.id,
        title: event.name,
        category: event.type,
        entry_type: event.buyInType,
        starts_at: event.date,
        buy_in: parseInt(event.buyIn.replace(/[₩,]/g, '')) || 0,
        fee: 0,
        guarantee: parseInt(event.gtd.replace(/[₩,]/g, '')) || 0,
        starting_stack: event.startingChips,
        level_minutes: parseInt(event.levelTime) || 15,
        late_registration: event.lateReg,
        event_status: 'SCHEDULED',
        status: event.published ? 'published' : 'draft',
        event_number: 1,
        sort_order: 0,
      }
      const { error } = await adminClient.from('events').upsert(payload, { onConflict: 'slug' })
      if (error) {
        console.error('Supabase event save error:', error.message)
        throw new Error(`Supabase event save failed: ${error.message}`)
      }
    }
    return
  }

  // Controlled local development fallback (only when not production)
  await writeJsonFile('events.json', events)
}

// --- Players ---

export async function getPlayers(): Promise<PlayerItem[]> {
  const client = createPublicClient()
  if (client) {
    const { data, error } = await client
      .from('players')
      .select('id,slug,name,display_name,country,portrait_url,rank,points,earnings,titles,final_tables,bio,status,sort_order,created_at,updated_at,updated_by')
      .eq('status', 'published')
      .order('rank', { ascending: true })

    if (error) {
      console.error('Supabase players read error:', error.message)
      return readJsonFile('players.json', seedPlayers)
    }

    if (!data || data.length === 0) {
      return readJsonFile('players.json', seedPlayers)
    }

    return data.map((row: any) => ({
      id: String(row.id || row.slug || row.name.toLowerCase().replace(/\s/g, '-')),
      rank: row.rank || 0,
      name: row.name || row.display_name || '',
      country: row.country || 'KR',
      earnings: row.earnings ? `₩ ${row.earnings}` : '₩ 0',
      portrait: row.portrait_url ? row.portrait_url : undefined,
      bio: row.bio || undefined,
      published: row.status === 'published',
    }))
  }

  return readJsonFile('players.json', seedPlayers)
}

export async function getPlayer(id: string): Promise<PlayerItem | undefined> {
  const players = await getPlayers()
  return players.find((player) => player.id === id)
}

export async function savePlayers(players: PlayerItem[]) {
  const adminClient = createAdminClient()
  if (isProduction() && !adminClient) {
    throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role not configured. Configure SUPABASE_SERVICE_ROLE_KEY to enable persistent writes.')
  }

  if (adminClient) {
    for (const player of players) {
      const payload = {
        slug: player.id,
        name: player.name,
        display_name: player.name,
        country: player.country,
        portrait_url: player.portrait || '',
        rank: player.rank,
        points: 0,
        earnings: parseInt((player.earnings || '').replace(/[₩,\s]/g, '')) || 0,
        titles: 0,
        final_tables: 0,
        bio: player.bio || '',
        status: player.published ? 'published' : 'draft',
        sort_order: player.rank,
      }
      const { error } = await adminClient.from('players').upsert(payload, { onConflict: 'slug' })
      if (error) {
        console.error('Supabase player save error:', error.message)
        throw new Error(`Supabase player save failed: ${error.message}`)
      }
    }
    return
  }

  await writeJsonFile('players.json', players)
}

// --- News ---

export async function getNews(): Promise<NewsItem[]> {
  const client = createPublicClient()
  if (client) {
    const { data, error } = await client
      .from('articles')
      .select('id,slug,category,title,excerpt,body,cover_url,author,status,sort_order,published_at,created_at,updated_at,updated_by')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Supabase news read error:', error.message)
      return readJsonFile('news.json', seedNews)
    }

    if (!data || data.length === 0) {
      return readJsonFile('news.json', seedNews)
    }

    return data.map((row: any) => ({
      slug: row.slug || String(row.id),
      category: (row.category || 'ANNOUNCEMENT') as NewsItem['category'],
      date: row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : '01.01.25',
      title: row.title || '',
      excerpt: row.excerpt || '',
      body: row.body || '',
      published: row.status === 'published',
    }))
  }

  return readJsonFile('news.json', seedNews)
}

export async function getNewsItem(slug: string): Promise<NewsItem | undefined> {
  const news = await getNews()
  return news.find((item) => item.slug === slug)
}

export async function saveNews(news: NewsItem[]) {
  const adminClient = createAdminClient()
  if (isProduction() && !adminClient) {
    throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role not configured. Configure SUPABASE_SERVICE_ROLE_KEY to enable persistent writes.')
  }

  if (adminClient) {
    for (const item of news) {
      const payload = {
        slug: item.slug,
        category: item.category,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        cover_url: '',
        author: 'KSOP EDITORIAL',
        status: item.published ? 'published' : 'draft',
        sort_order: 0,
        published_at: new Date().toISOString(),
      }
      const { error } = await adminClient.from('articles').upsert(payload, { onConflict: 'slug' })
      if (error) {
        console.error('Supabase news save error:', error.message)
        throw new Error(`Supabase news save failed: ${error.message}`)
      }
    }
    return
  }

  await writeJsonFile('news.json', news)
}

// --- Site Content ---

export async function getSiteContent(): Promise<SiteContent> {
  const client = createPublicClient()
  if (client) {
    const { data, error } = await client
      .from('site_settings')
      .select('key,value')
      .eq('key', 'global')
      .single()

    if (error) {
      console.error('Supabase site content read error:', error.message)
      return readJsonFile('content.json', seedContent)
    }

    if (data && data.value && typeof data.value === 'object') {
      return { ...seedContent, ...data.value } as SiteContent
    }

    return readJsonFile('content.json', seedContent)
  }

  return readJsonFile('content.json', seedContent)
}

export async function saveSiteContent(content: SiteContent) {
  const adminClient = createAdminClient()
  if (isProduction() && !adminClient) {
    throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role not configured. Configure SUPABASE_SERVICE_ROLE_KEY to enable persistent writes.')
  }

  if (adminClient) {
    const payload = {
      key: 'global',
      value: content,
    }
    const { error } = await adminClient.from('site_settings').upsert(payload, { onConflict: 'key' })
    if (error) {
      console.error('Supabase site content save error:', error.message)
      throw new Error(`Supabase site content save failed: ${error.message}`)
    }
    return
  }

  await writeJsonFile('content.json', content)
}

export async function getSiteData(): Promise<SiteData> {
  const [events, players, news, content] = await Promise.all([
    getEvents(),
    getPlayers(),
    getNews(),
    getSiteContent(),
  ])

  return { events, players, news, content }
}
