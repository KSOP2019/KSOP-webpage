import { createAdminClient, createPublicClient } from './supabase-server'

export type ScheduleCard = {
  label: string
  image: string
}

export type ScheduleContent = {
  kicker: string
  title: string
  intro: string
  items: ScheduleCard[]
}

export const defaultScheduleContent: ScheduleContent = {
  kicker: '01 / SCHEDULE',
  title: 'SCHEDULE',
  intro: 'A considered calendar of live poker, from opening tables to championship nights.',
  items: [
    { label: 'KSOP NAVER ENDING', image: '/images/schedule-warmup.png' },
    { label: 'CROWN SERIES 11.22~28', image: '/images/schedule-plo.png' },
    { label: 'YEAR FOR LAST 12.18~23', image: '/images/schedule-main-event.png' },
    { label: 'CHAMPIONSHIP 12.27~30', image: '/images/schedule-high-roller.png' },
  ],
}

function normalize(value: any): ScheduleContent {
  const items = Array.isArray(value?.items)
    ? value.items
        .map((item: any) => ({ label: String(item?.label || '').trim(), image: String(item?.image || '').trim() }))
        .filter((item: ScheduleCard) => item.label)
        .slice(0, 12)
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
