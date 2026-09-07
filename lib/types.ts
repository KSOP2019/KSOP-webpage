export type Language = 'EN' | 'KR' | 'JP' | 'CN'

export type EventCategory = 'ALL EVENT' | 'MAIN EVENT' | 'HIGH ROLLER' | 'DAY'

export type EventType = 'NLH' | 'PLO' | 'SATELLITE' | 'MAIN EVENT' | 'HIGH ROLLER'

export type NewsCategory = 'FIELD NOTES' | 'PLAYER PORTRAIT' | 'KSOP JOURNAL'

export interface BlindLevel {
  level: number
  small: number
  big: number
  ante: number
}

export interface EventItem {
  id: string
  date: string
  dayLabel: string
  name: string
  type: EventType
  buyInType: string
  buyIn: string
  gtd: string
  startingChips: number
  lateReg: string
  levelTime: string
  blindStructure: BlindLevel[]
  published: boolean
}

export interface PlayerItem {
  id: string
  rank: number
  name: string
  country: string
  earnings: string
  portrait?: string
  bio?: string
  published: boolean
}

export interface NewsItem {
  slug: string
  category: NewsCategory
  date: string
  title: string
  excerpt: string
  body: string
  published: boolean
}

export interface LocaleCopy {
  ticker: string
  nav: string[]
  eyebrow: string
  hero: string
  intro: string
  register: string
  explore: string
  guaranteed: string
  invitation: string
  stack: string
  reg: string
  schedule: string
  ranking: string
  news: string
  follow: string
  buyin?: string
}

export interface SiteContent {
  heroImage: string
  logoBlack: string
  logoWhite: string
  seriesDate: string
  seriesVenue: string
  seriesGtd: string
  countdownDays: number
  introTitle: string
  introBody: string
  imageBreakLabel: string
  imageBreakTitle: string
  imageBreakEmphasis: string
  copy: Record<Language, LocaleCopy>
}

export interface SiteData {
  events: EventItem[]
  players: PlayerItem[]
  news: NewsItem[]
  content: SiteContent
}
