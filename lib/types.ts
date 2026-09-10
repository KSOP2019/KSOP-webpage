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
  posterUrl?: string
  bannerUrl?: string
  thumbnailUrl?: string
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
  coverUrl?: string
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
  seatReserved?: string
  viewEvent?: string
  viewEvents?: string
  viewAllEvents?: string
  fullRanking?: string
  viewProfile?: string
  allNews?: string
  readStory?: string
  registerShort?: string
  searchPlayer?: string
  showing?: string
  noEvents?: string
  clearFilters?: string
  showMore?: string
  allDates?: string
  openEvent?: string
  seriesLabel?: string
  scheduleLabel?: string
  rankingLabel?: string
  newsLabel?: string
  introTitle?: string
  introEmphasis?: string
  footerLine1?: string
  footerLine2?: string
  countdown?: string
  posterMonth?: string
  factChips?: string
  factLate?: string
  factLevel?: string
  factType?: string
  factBuyin?: string
  eventDetail?: string
  eventStatus?: string
  regStatus?: string
  statusPending?: string
  regPending?: string
  blindStructure?: string
  blindLevel?: string
  blindSmallBig?: string
  blindAnte?: string
  resultLabel?: string
  liveLabel?: string
  resultPending?: string
  livePending?: string
  backToSchedule?: string
  backToRanking?: string
  backToNews?: string
  backToAbout?: string
  backHome?: string
  backToScheduleArrow?: string
  playerProfile?: string
  rankLabel?: string
  countryLabel?: string
  earningsLabel?: string
  bioPending?: string
  resultHistory?: string
  noNews?: string
  newsNotes?: string
  exploreSchedule?: string
  theSeries?: string
  theVenue?: string
  seriesDetail?: string
  venueLabel?: string
  dateLabel?: string
  guaranteedLabel?: string
  contentPending?: string
  eventList?: string
  schedulePending?: string
  seriesWord?: string
  dateRangeLabel?: string
  eventsWord?: string
  tba?: string
  scheduleKicker?: string
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

export interface PlayerResultItem {
  id: string
  eventId?: string | null
  eventName: string
  eventDate: string
  position: number
  fieldSize: number
  buyIn: number
  earnings?: number
  eventScore?: number
  createdAt?: string
}

export interface PlayerScoreRow {
  eventId?: string
  eventName: string
  eventScore: number
  finishFactor: number
  fieldFactor: number
  buyInFactor: number
  recencyFactor: number
  counted: boolean
  position: number
  fieldSize: number
  buyIn: number
  eventDate: string
  earnings?: number
}

export interface RankedPlayer {
  rank: number
  playerId: string
  name: string
  country: string
  portrait?: string
  score: number
  scoreSource: 'calculated' | 'legacy'
  results: PlayerResultItem[]
  scoreBreakdown: PlayerScoreRow[]
  bio?: string
}

export interface SiteData {
  events: EventItem[]
  players: PlayerItem[]
  news: NewsItem[]
  content: SiteContent
}
