import { promises as fs } from 'fs'
import path from 'path'
import type { EventItem, NewsItem, PlayerItem, SiteContent, SiteData } from './types'
import { filterEvents } from './event-filters'
import { createSeedEvents, seedContent, seedNews, seedPlayers } from './seed'

export { filterEvents }

const dataDir = path.join(process.cwd(), 'data')

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

export async function getEvents(): Promise<EventItem[]> {
  return readJsonFile('events.json', createSeedEvents())
}

export async function getEvent(id: string): Promise<EventItem | undefined> {
  const events = await getEvents()
  return events.find((event) => event.id === id)
}

export async function saveEvents(events: EventItem[]) {
  await writeJsonFile('events.json', events)
}

export async function getPlayers(): Promise<PlayerItem[]> {
  return readJsonFile('players.json', seedPlayers)
}

export async function getPlayer(id: string): Promise<PlayerItem | undefined> {
  const players = await getPlayers()
  return players.find((player) => player.id === id)
}

export async function savePlayers(players: PlayerItem[]) {
  await writeJsonFile('players.json', players)
}

export async function getNews(): Promise<NewsItem[]> {
  return readJsonFile('news.json', seedNews)
}

export async function getNewsItem(slug: string): Promise<NewsItem | undefined> {
  const news = await getNews()
  return news.find((item) => item.slug === slug)
}

export async function saveNews(news: NewsItem[]) {
  await writeJsonFile('news.json', news)
}

export async function getSiteContent(): Promise<SiteContent> {
  return readJsonFile('content.json', seedContent)
}

export async function saveSiteContent(content: SiteContent) {
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
