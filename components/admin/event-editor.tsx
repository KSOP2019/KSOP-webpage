'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { EventItem, EventType } from '@/lib/types'

const eventTypes: EventType[] = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER']

export function EventEditor({ initialEvent }: { initialEvent?: EventItem }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventItem>(
    initialEvent ?? {
      id: '',
      date: 'NOV 17',
      dayLabel: 'DAY 1',
      name: 'New Event',
      type: 'NLH',
      buyInType: 'INVITATION',
      buyIn: '₩10,000',
      gtd: '₩10,000',
      startingChips: 15000,
      lateReg: 'LEVEL 8',
      levelTime: '15 MIN',
      blindStructure: [{ level: 1, small: 100, big: 200, ante: 200 }],
      published: true,
    },
  )

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    const isNew = !initialEvent
    const response = await fetch(isNew ? '/api/events' : `/api/events/${event.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    if (response.ok) {
      router.push('/admin/events')
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!initialEvent) return
    await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    router.push('/admin/events')
    router.refresh()
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Event name
        <input value={event.name} onChange={(e) => setEvent({ ...event, name: e.target.value })} />
      </label>
      <label>
        Date
        <input value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} />
      </label>
      <label>
        Day label
        <input value={event.dayLabel} onChange={(e) => setEvent({ ...event, dayLabel: e.target.value })} />
      </label>
      <label>
        Type
        <select value={event.type} onChange={(e) => setEvent({ ...event, type: e.target.value as EventType })}>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Buy-in
        <input value={event.buyIn} onChange={(e) => setEvent({ ...event, buyIn: e.target.value })} />
      </label>
      <label>
        GTD
        <input value={event.gtd} onChange={(e) => setEvent({ ...event, gtd: e.target.value })} />
      </label>
      <label>
        Starting chips
        <input
          type="number"
          value={event.startingChips}
          onChange={(e) => setEvent({ ...event, startingChips: Number(e.target.value) })}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={event.published}
          onChange={(e) => setEvent({ ...event, published: e.target.checked })}
        />
        Published
      </label>
      <div className="admin-actions">
        <button className="admin-button" type="submit">
          Save event
        </button>
        {initialEvent ? (
          <button className="admin-button secondary" type="button" onClick={handleDelete}>
            Delete
          </button>
        ) : null}
        <Link className="admin-button secondary" href="/admin/events">
          Cancel
        </Link>
      </div>
    </form>
  )
}
