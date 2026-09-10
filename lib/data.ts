import { promises as fs } from 'fs'
import path from 'path'
import type { EventItem, NewsItem, PlayerItem, SiteContent, SiteData, EventType, NewsCategory } from './types'
import { filterEvents } from './event-filters'
import { createSeedEvents, seedContent, seedNews, seedPlayers } from './seed'
import { createPublicClient, createAdminClient } from './supabase-server'
import {
  calculateRankingScore,
  calculateEventScore,
  buildPlayerScoreBreakdown,
  type RankingResultInput,
  type ScoreBreakdownRow,
} from './ranking-score'
const RANKING_TEST_MODE = true

import type { RankedPlayer, PlayerResultItem, PlayerScoreRow } from './types'

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

const EVENT_PUBLIC_SELECT = 'id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by,poster_url,banner_url,thumbnail_url'
const EVENT_PUBLIC_SELECT_LEGACY = 'id,slug,series_id,event_number,title,category,game_type,entry_type,starts_at,buy_in,fee,guarantee,starting_stack,level_minutes,late_registration,reentry,description,structure_url,registration_url,event_status,status,sort_order,created_at,updated_at,updated_by'

function isMissingImageColumnError(message: string): boolean {
  return /poster_url|banner_url|thumbnail_url/.test(message || '')
}

export async function getEvents(): Promise<EventItem[]> {
  const client = createPublicClient()
  if (client) {
    const baseQuery = () => client
      .from('events')
      .select(EVENT_PUBLIC_SELECT)
      .eq('status', 'published')
      .order('starts_at', { ascending: true })

    let result: any = await baseQuery()
    // Safe rollout: if the image-column migration has not been applied yet,
    // fall back to the legacy column list instead of emptying the event list.
    if (result.error && isMissingImageColumnError(result.error.message)) {
      console.warn('Events image columns missing; using legacy select until migration is applied.')
      result = await client
        .from('events')
        .select(EVENT_PUBLIC_SELECT_LEGACY)
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
    }
    const { data, error } = result

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
        dbId: String(row.id || ''),
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
        posterUrl: row.poster_url || '',
        bannerUrl: row.banner_url || '',
        thumbnailUrl: row.thumbnail_url || '',
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
        poster_url: event.posterUrl || '',
        banner_url: event.bannerUrl || '',
        thumbnail_url: event.thumbnailUrl || '',
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
  if (RANKING_TEST_MODE) {
    return seedPlayers
  }
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
      // Stable public identifier uses slug, never DB UUID
      id: row.slug || String(row.id),
      dbId: String(row.id || ''),
      rank: row.rank || 0,
      name: row.name || row.display_name || '',
      country: row.country || 'KR',
      earnings: row.earnings ? `₩ ${row.earnings}` : '₩ 0',
      portrait: row.portrait_url ? row.portrait_url : undefined,
      bio: row.bio || undefined,
      published: row.status === 'published',
      titles: row.titles != null ? Number(row.titles) : undefined,
      finalTables: row.final_tables != null ? Number(row.final_tables) : undefined,
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
      coverUrl: (row.cover_url as string) || '',
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

// --- Bulk Event Import (P5-3 CMS MVP) ---
// Uses minimal DB operations; does not rewrite entire events table.

export async function bulkUpsertEvents(eventItems: EventItem[]): Promise<number> {
  const adminClient = createAdminClient()
  if (isProduction() && !adminClient) {
    throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role not configured.')
  }

  if (!adminClient) {
    // Local fallback: append to file only in non-production
    const events = await getEvents()
    const existingIds = new Set(events.map((e) => e.id))
    const nextEvents = events.filter((e) => !existingIds.has(e.id))
    await writeJsonFile('events.json', [...events, ...eventItems.filter((e) => !existingIds.has(e.id))])
    return eventItems.length
  }

  const results: string[] = []
  for (const event of eventItems) {
    const payload: Record<string, any> = {
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
    // Import rows carry no image data: omit empty image keys so re-imports
    // never wipe image URLs previously set through the event CMS.
    if (event.posterUrl) payload.poster_url = event.posterUrl
    if (event.bannerUrl) payload.banner_url = event.bannerUrl
    if (event.thumbnailUrl) payload.thumbnail_url = event.thumbnailUrl
    const { error } = await adminClient.from('events').upsert(payload, { onConflict: 'slug' })
    if (error) {
      console.error('Bulk event upsert error:', error.message)
      throw new Error(`Bulk event upsert failed for slug ${event.id}: ${error.message}`)
    }
    results.push(event.id)
  }
  return results.length
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

export async function getPlayerResults(playerId: string): Promise<PlayerResultItem[]> {
  const client = createPublicClient()
  try {
    if (client) {
      const { data, error } = await client
        .from('player_results')
        .select('id,event_id,event_name,event_date,position,field_size,buy_in,earnings,created_at')
        .eq('player_id', playerId)
      if (!error && data && data.length > 0) {
        const eventIds = (data || [])
          .map((row: any) => row.event_id ? String(row.event_id) : null)
          .filter(Boolean)
        // Resolve event UUID -> event slug for public links
        let eventSlugMap: Record<string, string> = {}
        if (eventIds.length > 0) {
          const { data: eventData, error: eventError } = await client
            .from('events')
            .select('id,slug')
            .in('id', eventIds)
          if (!eventError && eventData) {
            for (const e of eventData) {
              eventSlugMap[String(e.id)] = String(e.slug || e.id)
            }
          }
        }
        const mapped: PlayerResultItem[] = (data || []).map((row: any) => {
          const eventScoreResult = calculateEventScore({
            eventId: row.event_id ? String(row.event_id) : undefined,
            eventName: String(row.event_name || ''),
            eventDate: String(row.event_date || ''),
            position: Number(row.position) || 1,
            fieldSize: Number(row.field_size) || 1,
            buyIn: Number(row.buy_in) || 0,
            earnings: row.earnings != null ? Number(row.earnings) : undefined,
          })
          return {
            id: String(row.id || ''),
            eventId: row.event_id ? String(row.event_id) : undefined,
            eventSlug: row.event_id && eventSlugMap[String(row.event_id)] ? eventSlugMap[String(row.event_id)] : undefined,
            eventName: String(row.event_name || ''),
            eventDate: String(row.event_date || ''),
            position: Number(row.position) || 1,
            fieldSize: Number(row.field_size) || 1,
            buyIn: Number(row.buy_in) || 0,
            earnings: row.earnings != null ? Number(row.earnings) : undefined,
            eventScore: eventScoreResult.eventScore,
            createdAt: row.created_at ? String(row.created_at) : undefined,
          }
        })
        return mapped
      }
    }
  } catch {
    // DB read failed; fall through
  }
  // Fallback: read synthetic results from local JSON file for design QA
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'player-results.json'), 'utf8')
    const allResults: Record<string, any[]> = JSON.parse(raw)
    // Try slug key first (as used in JSON), then dbId-derived slug
    const slugKey = playerId.startsWith('test-player-') ? playerId : `test-player-${String(playerId).replace('synthetic-', '').padStart(3, '0')}`
    const syntheticData = allResults[slugKey] || allResults[playerId] || []
    const mapped: PlayerResultItem[] = syntheticData.map((row: any) => {
      const eventScoreResult = calculateEventScore({
        eventId: row.eventId || undefined,
        eventName: row.eventName || '',
        eventDate: row.eventDate || '',
        position: Number(row.position) || 1,
        fieldSize: Number(row.fieldSize) || 1,
        buyIn: Number(row.buyIn) || 0,
        earnings: row.earnings != null ? Number(row.earnings) : undefined,
      })
      return {
        id: String(row.id || ''),
        eventId: row.eventId ? String(row.eventId) : undefined,
        eventSlug: row.eventSlug ? String(row.eventSlug) : (row.eventId ? String(row.eventSlug || row.eventId) : undefined),
        eventName: String(row.eventName || ''),
        eventDate: String(row.eventDate || ''),
        position: Number(row.position) || 1,
        fieldSize: Number(row.fieldSize) || 1,
        buyIn: Number(row.buyIn) || 0,
        earnings: row.earnings != null ? Number(row.earnings) : undefined,
        eventScore: eventScoreResult.eventScore,
        createdAt: row.createdAt ? String(row.createdAt) : undefined,
      }
    })
    return mapped
  } catch {
    // No synthetic results file; return empty array
  }
  return []
}

export async function getRankedPlayers(limit = 100): Promise<RankedPlayer[]> {
  const players = await getPlayers()
  const published = players.filter((p) => p.published)

  const ranked: RankedPlayer[] = []

  for (const player of published) {
    const resultLookupId = player.id.startsWith('test-player-') ? player.id : (player.dbId || player.id)
    const resultsRaw = await getPlayerResults(resultLookupId)

    // Convert to RankingResultInput for scoring engine
    const inputs: RankingResultInput[] = resultsRaw.map((r) => ({
      eventId: r.eventId || undefined,
      eventName: r.eventName,
      eventDate: r.eventDate,
      position: r.position,
      fieldSize: r.fieldSize,
      buyIn: r.buyIn,
      earnings: r.earnings,
    }))

    const hasResults = inputs.length > 0
    let score = 0
    let scoreSource: 'calculated' | 'legacy' = 'calculated'
    let breakdownRows: PlayerScoreRow[] = []

    if (hasResults) {
      const breakdown = buildPlayerScoreBreakdown(player.id, inputs, { bestResultsCount: 10 })
      score = breakdown.totalScore
      scoreSource = 'calculated'
      breakdownRows = breakdown.rows.map((r) => ({
        eventId: r.eventId,
        eventName: r.eventName,
        eventScore: r.eventScore,
        finishFactor: r.finishFactor,
        fieldFactor: r.fieldFactor,
        buyInFactor: r.buyInFactor,
        recencyFactor: r.recencyFactor,
        counted: r.counted,
        position: r.position,
        fieldSize: r.fieldSize,
        buyIn: r.buyIn,
        eventDate: r.eventDate,
        earnings: r.earnings,
      }))
    } else {
      // Fallback to legacy points/rank only when NO results exist
      // Preserve manual rank order: lower rank number = higher fallback score.
      const legacyRank = Number(player.rank) || 99999
      score = Math.max(0, 100000 - legacyRank)
      scoreSource = 'legacy'
      breakdownRows = []
    }

    ranked.push({
      rank: 0, // assigned after sort
      playerId: player.id,
      dbId: player.dbId,
      name: player.name,
      country: player.country,
      portrait: player.portrait,
      titles: player.titles,
      finalTables: player.finalTables,
      score,
      scoreSource,
      results: resultsRaw,
      scoreBreakdown: breakdownRows,
      bio: player.bio,
    })
  }

  // Sort DESC by calculated score; assign rank after sorting
  ranked.sort((a, b) => b.score - a.score)
  for (let i = 0; i < ranked.length; i++) {
    ranked[i].rank = i + 1
  }

  return ranked.slice(0, Math.max(0, limit))
}

export async function getPlayerRankingDetail(playerId: string): Promise<RankedPlayer | undefined> {
  const all = await getRankedPlayers(10000)
  return all.find((p) => p.playerId === playerId)
}
