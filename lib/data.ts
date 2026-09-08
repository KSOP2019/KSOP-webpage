import { promises as fs } from 'fs'
import path from 'path'
import type { EventItem, NewsItem, PlayerItem, SiteContent, SiteData, EventType, NewsCategory } from './types'
import { filterEvents } from './event-filters'
import { createSeedEvents, seedContent, seedNews, seedPlayers } from './seed'
import { createPublicClient, createAdminClient } from './supabase-server'

export { filterEvents }

const dataDir = path.join(process.cwd(), 'data')

const VALID_EVENT_TYPES: EventType[] = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER']
const VALID_NEWS_CATEGORIES: NewsCategory[] = ['FIELD NOTES', 'PLAYER PORTRAIT', 'KSOP JOURNAL']

function safeEventType(value: string | null | undefined): EventType {
  if (!value) return 'NLH'
  return VALID_EVENT_TYPES.includes(value as EventType) ? (value as EventType) : 'NLH'
}

function safeNewsCategory(value: string | null | undefined): NewsCategory {
  if (!value) return 'FIELD NOTES'
  return VALID_NEWS_CATEGORIES.includes(value as NewsCategory) ? (value as NewsCategory) : 'FIELD NOTES'
}

// --- Site Settings Conversion ---
// Schema site_settings uses snake_case JSON; SiteContent uses camelCase.
// These helpers ensure a true round-trip: DB -> interface -> DB.

export function siteContentToSiteSettings(content: SiteContent): any {
  return {
    site_title: content.introTitle || seedContent.introTitle,
    hero_eyebrow: content.copy?.EN?.eyebrow || seedContent.copy.EN.eyebrow,
    hero_title: content.introTitle || seedContent.introTitle,
    hero_description: content.introBody || seedContent.introBody,
    hero_image: content.heroImage || seedContent.heroImage,
    logo_black: content.logoBlack || seedContent.logoBlack,
    logo_white: content.logoWhite || seedContent.logoWhite,
    series_date: content.seriesDate || seedContent.seriesDate,
    series_venue: content.seriesVenue || seedContent.seriesVenue,
    series_gtd: content.seriesGtd || seedContent.seriesGtd,
    countdown_days: content.countdownDays || seedContent.countdownDays,
    intro_title: content.introTitle || seedContent.introTitle,
    intro_body: content.introBody || seedContent.introBody,
    image_break_label: content.imageBreakLabel || seedContent.imageBreakLabel,
    image_break_title: content.imageBreakTitle || seedContent.imageBreakTitle,
    image_break_emphasis: content.imageBreakEmphasis || seedContent.imageBreakEmphasis,
    footer_text: content.introBody || seedContent.introBody,
    primary_color: '#c5202d',
    instagram_url: '#',
    youtube_url: '#',
    facebook_url: '#',
    x_url: '#',
    copy: content.copy || seedContent.copy,
  }
}

export function siteSettingsToSiteContent(dbValue: any): SiteContent {
  const dbCopy = dbValue.copy && typeof dbValue.copy === 'object'
    ? (dbValue.copy as any)
    : null;
  return {
    heroImage: dbValue.hero_image || seedContent.heroImage,
    logoBlack: dbValue.logo_black || seedContent.logoBlack,
    logoWhite: dbValue.logo_white || seedContent.logoWhite,
    seriesDate: dbValue.series_date || seedContent.seriesDate,
    seriesVenue: dbValue.series_venue || seedContent.seriesVenue,
    seriesGtd: dbValue.series_gtd || seedContent.seriesGtd,
    countdownDays: dbValue.countdown_days || seedContent.countdownDays,
    introTitle: dbValue.intro_title || dbValue.hero_title || seedContent.introTitle,
    introBody: dbValue.intro_body || dbValue.hero_description || seedContent.introBody,
    imageBreakLabel: dbValue.image_break_label || seedContent.imageBreakLabel,
    imageBreakTitle: dbValue.image_break_title || seedContent.imageBreakTitle,
    imageBreakEmphasis: dbValue.image_break_emphasis || seedContent.imageBreakEmphasis,
    copy: dbCopy ? {
      EN: { ...seedContent.copy.EN, ...dbCopy.EN },
      KR: { ...seedContent.copy.KR, ...dbCopy.KR },
      JP: { ...seedContent.copy.JP, ...dbCopy.JP },
      CN: { ...seedContent.copy.CN, ...dbCopy.CN },
    } : seedContent.copy,
  }
}

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
      if (isProduction()) {
        // Production: never silently fall back to seed data when Supabase configured
        return []
      }
      // Development only: controlled fallback when query fails
      return readJsonFile('events.json', createSeedEvents())
    }

    if (!data || data.length === 0) {
      if (isProduction()) {
        // Production: empty published table returns empty array
        return []
      }
      return readJsonFile('events.json', createSeedEvents())
    }

    return data.map((row: any) => {
      // Stable public identifier uses slug, not DB UUID
      const eventSlug = row.slug || String(row.id)
      // Date: derive from real timestamptz; never fabricate year
      let eventDate = 'DATE PENDING'
      if (row.starts_at) {
        try {
          const d = new Date(row.starts_at)
          if (!isNaN(d.getTime())) {
            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
            const day = d.getDate()
            eventDate = `${month} ${day}`
          }
        } catch {
          // Leave default if parsing fails
        }
      }
      // No fabricated tournament operational values
      const dbBuyIn = row.buy_in
      const dbGtd = row.guarantee
      const dbStartingChips = row.starting_stack
      const dbLateReg = row.late_registration || ''
      const dbLevelMinutes = row.level_minutes || 0

      return {
        id: eventSlug,
        date: eventDate,
        dayLabel: `DAY ${row.event_number || 1}`,
        name: row.title || 'Event',
        type: safeEventType(row.category),
        buyInType: row.entry_type || 'INVITATION',
        buyIn: dbBuyIn ? `₩${dbBuyIn}` : 'PENDING',
        gtd: dbGtd ? `₩${dbGtd}` : 'PENDING',
        startingChips: dbStartingChips || 0,
        lateReg: dbLateReg || 'PENDING',
        levelTime: dbLevelMinutes ? `${dbLevelMinutes} MIN` : 'PENDING',
        blindStructure: [],
        published: row.status === 'published',
      }
    })
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
      // Before parsing event.date: require an explicit 4-digit year
      const yearRegex = /\b(19|20)\d{2}\b/;
      if (!yearRegex.test(event.date || '')) {
        throw new Error(`PRODUCTION_WRITE_BLOCKED_INVALID_DATE: Event "${event.name}" (slug: ${event.id}) date "${event.date}" must contain an explicit 4-digit year (e.g., NOV 17 2026).`)
      }
      // Block writes when event.date does not contain enough info for a valid timestamptz
      if (!event.date || event.date.length < 5) {
        throw new Error(`PRODUCTION_WRITE_BLOCKED_INVALID_DATE: Event "${event.name}" (slug: ${event.id}) has date "${event.date}" which is insufficient for a valid timestamptz. Provide a full date (e.g., include year) before saving.`)
      }
      // Safe conversion: attempt to derive a real date string; never fabricate year
      let safeStartsAt: string | null = null
      try {
        // Try to interpret as a real ISO or standard date
        const parsed = new Date(event.date)
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1970) {
          safeStartsAt = event.date
        } else {
          // If only month/day given (e.g. "NOV 17"), we cannot produce a valid timestamptz without a year
          throw new Error('INSUFFICIENT_DATE')
        }
      } catch {
        throw new Error(`PRODUCTION_WRITE_BLOCKED_INVALID_DATE: Event "${event.name}" (slug: ${event.id}) date "${event.date}" cannot be converted to a valid timestamptz. Add a year or full date.`)
      }

      const payload = {
        slug: event.id,
        title: event.name,
        category: event.type,
        entry_type: event.buyInType,
        starts_at: safeStartsAt,
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
      if (isProduction()) return []
      return readJsonFile('players.json', seedPlayers)
    }

    if (!data || data.length === 0) {
      if (isProduction()) return []
      return readJsonFile('players.json', seedPlayers)
    }

    return data.map((row: any) => ({
      // Stable public identifier uses slug, never DB UUID
      id: row.slug || String(row.id),
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
      if (isProduction()) return []
      return readJsonFile('news.json', seedNews)
    }

    if (!data || data.length === 0) {
      if (isProduction()) return []
      return readJsonFile('news.json', seedNews)
    }

    return data.map((row: any) => ({
      slug: row.slug || String(row.id),
      category: safeNewsCategory(row.category),
      date: row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : 'DATE PENDING',
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
      // Preserve existing published_at where practical; do not reset on every edit
      let preservePublishedAt: string | undefined
      try {
        const { data } = await adminClient.from('articles').select('published_at').eq('slug', item.slug).single()
        if (data && data.published_at) preservePublishedAt = data.published_at
      } catch {
        // No existing article; new publication
      }
      const payload = {
        slug: item.slug,
        category: item.category,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        cover_url: (item as any).coverUrl || '',
        author: 'KSOP EDITORIAL',
        status: item.published ? 'published' : 'draft',
        sort_order: 0,
        published_at: preservePublishedAt ? preservePublishedAt : new Date().toISOString(),
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
      if (isProduction()) {
        throw new Error('PRODUCTION_READ_ERROR: Site content read failed. Supabase is configured but query returned an error.')
      }
      return readJsonFile('content.json', seedContent)
    }

    if (data && data.value && typeof data.value === 'object') {
      return siteSettingsToSiteContent(data.value)
    }

    if (isProduction()) {
      throw new Error('PRODUCTION_READ_ERROR: Site settings missing or invalid value. Supabase configured but global row missing/non-object.')
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
      value: siteContentToSiteSettings(content),
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
