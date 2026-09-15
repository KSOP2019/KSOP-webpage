import { createAdminClient, createPublicClient } from './supabase-server'
import type { EventType } from './types'

export type ScheduleCard = {
  label: string
  image: string
  status?: 'upcoming' | 'past'
  dateRange?: string
  venue?: string
  seriesId?: string
  matchType?: EventType | ''
  matchName?: string
}

export type ScheduleContent = {
  kicker: string
  title: string
  intro: string
  items: ScheduleCard[]
}

export const defaultScheduleContent: ScheduleContent = {
  kicker: '01 / SCHEDULE · SERIES',
  title: 'KSOP SERIES',
  intro: 'KSOP 시리즈 일정과 각 시리즈에 연결된 공식 이벤트를 확인합니다.',
  items: [
    { label: 'KSOP NAVER ENDING', image: '/images/schedule-warmup.png', status: 'upcoming', matchName: 'Warm-up' },
    { label: 'CROWN SERIES 11.22~28', image: '/images/schedule-plo.png', status: 'upcoming', dateRange: '11.22~28', matchType: 'PLO' },
    { label: 'YEAR FOR LAST 12.18~23', image: '/images/schedule-main-event.png', status: 'upcoming', dateRange: '12.18~23', matchType: 'MAIN EVENT' },
    { label: 'CHAMPIONSHIP 12.27~30', image: '/images/schedule-high-roller.png', status: 'upcoming', dateRange: '12.27~30', matchType: 'HIGH ROLLER' },
  ],
}

const EVENT_TYPES: EventType[] = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER']

function inferMatch(item: any): Pick<ScheduleCard, 'matchType' | 'matchName'> {
  const haystack = `${String(item?.label || '')} ${String(item?.image || '')}`.toLowerCase()
  if (haystack.includes('high-roller') || haystack.includes('high roller')) return { matchType: 'HIGH ROLLER', matchName: '' }
  if (haystack.includes('main-event') || haystack.includes('main event')) return { matchType: 'MAIN EVENT', matchName: '' }
  if (haystack.includes('plo')) return { matchType: 'PLO', matchName: '' }
  if (haystack.includes('warmup') || haystack.includes('warm-up')) return { matchType: '', matchName: 'Warm-up' }
  return { matchType: '', matchName: '' }
}

function normalize(value: any): ScheduleContent {
  const items = Array.isArray(value?.items)
    ? value.items
        .map((item: any) => {
          const inferred = inferMatch(item)
          const matchType = EVENT_TYPES.includes(item?.matchType as EventType)
            ? (item.matchType as EventType)
            : inferred.matchType
          return {
            label: String(item?.label || '').trim(),
            image: String(item?.image || '').trim(),
            status: item?.status === 'past' ? 'past' as const : 'upcoming' as const,
            dateRange: String(item?.dateRange || '').trim(),
            venue: String(item?.venue || '').trim(),
            seriesId: String(item?.seriesId || '').trim(),
            matchType,
            matchName: String(item?.matchName || inferred.matchName || '').trim(),
          }
        })
        .filter((item: ScheduleCard) => item.label)
        .slice(0, 24)
    : defaultScheduleContent.items

  return {
    kicker: String(value?.kicker || defaultScheduleContent.kicker),
    title: String(value?.title || defaultScheduleContent.title),
    intro: String(value?.intro || defaultScheduleContent.intro),
    items: items.length ? items : defaultScheduleContent.items,
  }
}

export async function getScheduleContent(): Promise<ScheduleContent> {
  const client = createPublicClient()
  if (!client) return defaultScheduleContent

  const { data, error } = await client
    .from('site_settings')
    .select('value')
    .eq('key', 'schedule')
    .maybeSingle()

  if (error || !data?.value) return defaultScheduleContent
  return normalize(data.value)
}

export async function saveScheduleContent(content: ScheduleContent): Promise<ScheduleContent> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_SCHEDULE_WRITE_BLOCKED: Supabase admin service role not configured.')

  const next = normalize(content)
  const { error } = await client
    .from('site_settings')
    .upsert({ key: 'schedule', value: next }, { onConflict: 'key' })

  if (error) throw new Error(`Supabase schedule save failed: ${error.message}`)
  return next
}
