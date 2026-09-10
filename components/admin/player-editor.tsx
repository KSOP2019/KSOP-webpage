'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { PlayerItem } from '@/lib/types'

interface PlayerResultForm {
  eventName: string
  eventDate: string
  position: number
  fieldSize: number
  buyIn: number
  earnings: number
  eventId?: string
}

export function PlayerEditor({ initialItem, adminId }: { initialItem?: PlayerItem; adminId?: string }) {
  const router = useRouter()
  const [item, setItem] = useState<PlayerItem>(
    initialItem ?? {
      id: '',
      rank: 0,
      name: '',
      country: '',
      earnings: '',
      portrait: '',
      bio: '',
      published: false,
    },
  )

  const [results, setResults] = useState<PlayerResultForm[]>([])
  const [newResult, setNewResult] = useState<PlayerResultForm>({ eventName: '', eventDate: '', position: 1, fieldSize: 10, buyIn: 5000, earnings: 0, eventId: '' })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const isNew = !initialItem
    const slug = (item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).trim()
    const response = await fetch(isNew ? '/api/players' : `/api/players/${adminId}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, id: slug, published: item.published }),
    })
    if (response.ok) {
      router.push('/admin/players')
      router.refresh()
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Slug
        <input value={item.id} onChange={(e) => setItem({ ...item, id: e.target.value })} disabled={!initialItem ? false : true} />
      </label>
      <label>
        Name
        <input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} />
      </label>
      <label>
        Country
        <input value={item.country} onChange={(e) => setItem({ ...item, country: e.target.value })} />
      </label>
      <label>
        Rank
        <input type="number" value={item.rank} onChange={(e) => setItem({ ...item, rank: Number(e.target.value) })} />
      </label>
      <label>
        Earnings
        <input value={item.earnings} onChange={(e) => setItem({ ...item, earnings: e.target.value })} />
      </label>
      <label>
        Portrait URL
        <input value={item.portrait || ''} onChange={(e) => setItem({ ...item, portrait: e.target.value })} />
      </label>
      <label>
        Bio
        <textarea rows={4} value={item.bio || ''} onChange={(e) => setItem({ ...item, bio: e.target.value })} />
      </label>
      <label>
        <input type="checkbox" checked={item.published} onChange={(e) => setItem({ ...item, published: e.target.checked })} />
        Published
      </label>

      <div style={{ borderTop: '1px solid #333', paddingTop: '16px', marginTop: '16px' }}>
        <h4>RESULT HISTORY</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <input placeholder="Event name" value={newResult.eventName} onChange={(e) => setNewResult({ ...newResult, eventName: e.target.value })} style={{ padding: '4px' }} />
          <input placeholder="Event date" value={newResult.eventDate} onChange={(e) => setNewResult({ ...newResult, eventDate: e.target.value })} style={{ padding: '4px' }} />
          <input type="number" placeholder="Position" value={newResult.position} onChange={(e) => setNewResult({ ...newResult, position: Number(e.target.value) })} style={{ padding: '4px', width: '80px' }} />
          <input type="number" placeholder="Field size" value={newResult.fieldSize} onChange={(e) => setNewResult({ ...newResult, fieldSize: Number(e.target.value) })} style={{ padding: '4px', width: '80px' }} />
          <input type="number" placeholder="Buy-in" value={newResult.buyIn} onChange={(e) => setNewResult({ ...newResult, buyIn: Number(e.target.value) })} style={{ padding: '4px', width: '100px' }} />
          <input type="number" placeholder="Earnings" value={newResult.earnings} onChange={(e) => setNewResult({ ...newResult, earnings: Number(e.target.value) })} style={{ padding: '4px', width: '100px' }} />
          <button type="button" onClick={async () => {
            const res = await fetch('/api/player-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newResult, playerId: item.id || adminId }) })
            if (res.ok) {
              const data = await res.json()
              setResults([...results, { ...newResult, eventId: data.eventId || undefined }])
              setNewResult({ eventName: '', eventDate: '', position: 1, fieldSize: 10, buyIn: 5000, earnings: 0, eventId: '' })
            }
          }}>Add</button>
        </div>
        {results.length > 0 && (
          <ul style={{ marginTop: '12px', paddingLeft: '16px' }}>
            {results.map((res, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {res.eventName} ({res.eventDate}) — Pos {res.position}, Field {res.fieldSize}, Buy-In {res.buyIn}, Earnings {res.earnings}
                <button type="button" onClick={async () => {
                  if (res.eventId) {
                    await fetch('/api/player-results', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: res.eventId }) })
                  }
                  setResults(results.filter((_, i) => i !== idx))
                }} style={{ marginLeft: '8px', fontSize: '12px' }}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-actions">
        <button className="admin-button" type="submit">Save Player</button>
        <Link className="admin-button secondary" href="/admin/players">Cancel</Link>
      </div>
    </form>
  )
}
