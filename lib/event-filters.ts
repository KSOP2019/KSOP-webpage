import type { EventItem } from './types'

export function filterEvents(events: EventItem[], category: string, date: string): EventItem[] {
  return events
    .filter((event) => event.published)
    .filter((event) => {
      if (date !== 'ALL' && event.date !== date) return false
      if (category === 'ALL EVENT') return true
      if (category === 'MAIN EVENT') return event.type === 'MAIN EVENT'
      if (category === 'HIGH ROLLER') return event.type === 'HIGH ROLLER'
      if (category === 'DAY') return event.name.includes('Day')
      return true
    })
    .sort((a, b) => {
      const dayA = Number(a.date.replace(/\D/g, ''))
      const dayB = Number(b.date.replace(/\D/g, ''))
      if (dayA !== dayB) return dayA - dayB
      const numA = Number(a.name.match(/#(\d+)/)?.[1] ?? 0)
      const numB = Number(b.name.match(/#(\d+)/)?.[1] ?? 0)
      return numA - numB
    })
}
