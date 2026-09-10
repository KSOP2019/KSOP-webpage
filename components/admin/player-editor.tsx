'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { PlayerItem } from '@/lib/types'
import { createPublicClient } from '@/lib/supabase-server'
import type { EventItem } from '@/lib/types'

interface PlayerResultForm {
  eventName: string
  eventDate: string
  position: number
  fieldSize: number
  buyIn: number
  earnings: number
  eventId?: string // event UUID (optional)
  resultId?: string // DB result row UUID
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
  const [newResult, setNewResult] = useState<PlayerResultForm>({ eventName: '', eventDate: '', position: 1, fieldSize: 10, buyIn: 5000, earnings: 0 })
  const [adminError, setAdminError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const evs: EventItem[] = await res.json()
          setEvents(evs.filter((e: EventItem) => e.published))
        }
      } catch {
        // Load failed; continue without events
      }
    }
    loadEvents()
  }, [])

  useEffect(() => {
    async function load() {
      if (!initialItem) return
      try {
        const dbId = initialItem.dbId || initialItem.id
        if (!dbId) return
        const client = createPublicClient()
        let raw: any[] = []
        if (client) {
          const { data, error } = await client
            .from('player_results')
            .select('id,event_id,event_name,event_date,position,field_size,buy_in,earnings,created_at')
            .eq('player_id', dbId)
          if (!error && data) raw = data
        }
        setResults(raw.map((r: any) => ({
          eventName: r.event_name || '',
          eventDate: r.event_date || '',
          position: Number(r.position) || 1,
          fieldSize: Number(r.field_size) || 1,
          buyIn: Number(r.buy_in) || 0,
          earnings: r.earnings != null ? Number(r.earnings) : 0,
          eventId: r.event_id ? String(r.event_id) : undefined,
          resultId: r.id ? String(r.id) : undefined,
        })))
      } catch {
        // Load failed; continue without existing results
      }
    }
    load()
  }, [initialItem])

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
        {adminError && <div style={{ color: '#c00', marginTop: '8px', fontWeight: 600 }}>{adminError}</div>}
        <div style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Select Event</label>
          <select
            value={newResult.eventId || ''}
            onChange={(e) => {
              const ev = events.find((ev: EventItem) => ev.dbId === e.target.value)
              if (ev) {
                setNewResult({
                  ...newResult,
                  eventName: ev.name || '',
                  eventDate: ev.date || '',
                  eventId: ev.dbId || ev.id || '',
                })
              } else {
                setNewResult({ ...newResult, eventName: '', eventDate: '', eventId: '' })
              }
            }}
            style={{ padding: '4px', width: '240px', marginRight: '8px' }}
          >
            <option value="">-- Select existing event --</option>
            {events.map((ev: EventItem) => (
              <option key={ev.dbId || ev.id} value={ev.dbId || ev.id}>{ev.name} ({ev.id})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <input placeholder="Event name" value={newResult.eventName} onChange={(e) => setNewResult({ ...newResult, eventName: e.target.value })} style={{ padding: '4px' }} />
          <input placeholder="Event date" value={newResult.eventDate} onChange={(e) => setNewResult({ ...newResult, eventDate: e.target.value })} style={{ padding: '4px' }} />
          <input type="number" placeholder="Position" value={newResult.position} onChange={(e) => setNewResult({ ...newResult, position: Number(e.target.value) })} style={{ padding: '4px', width: '80px' }} />
          <input type="number" placeholder="Field size" value={newResult.fieldSize} onChange={(e) => setNewResult({ ...newResult, fieldSize: Number(e.target.value) })} style={{ padding: '4px', width: '80px' }} />
          <input type="number" placeholder="Buy-in" value={newResult.buyIn} onChange={(e) => setNewResult({ ...newResult, buyIn: Number(e.target.value) })} style={{ padding: '4px', width: '100px' }} />
          <input type="number" placeholder="Earnings" value={newResult.earnings} onChange={(e) => setNewResult({ ...newResult, earnings: Number(e.target.value) })} style={{ padding: '4px', width: '100px' }} />
          <button type="button" onClick={async () => {
            setAdminError(null)
            const res = await fetch('/api/player-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newResult, playerId: item.dbId || item.id || adminId }) })
            if (res.ok) {
              const data = await res.json()
              setResults([...results, { ...newResult, resultId: data.id ? String(data.id) : undefined }])
              setNewResult({ eventName: '', eventDate: '', position: 1, fieldSize: 10, buyIn: 5000, earnings: 0 })
            } else {
              setAdminError('Failed to save result. Check admin permissions.')
            }
          }}>Add</button>
        </div>
        {results.length > 0 && (
          <ul style={{ marginTop: '12px', paddingLeft: '16px' }}>
            {results.map((res, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {res.eventName} ({res.eventDate}) — Pos {res.position}, Field {res.fieldSize}, Buy-In {res.buyIn}, Earnings {res.earnings}
                <button type="button" onClick={async () => {
                  setAdminError(null)
                  if (res.resultId) {
                    const delRes = await fetch('/api/player-results', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: res.resultId }) })
                    if (!delRes.ok) {
                      setAdminError('Failed to delete result.')
                      return
                    }
                  }
                  setResults(results.filter((_, i) => i !== idx))
                }} style={{ marginLeft: '8px', fontSize: '12px' }}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <h4>TEST DATA CONTROLS</h4>
        <button
          type="button"
          className="admin-button secondary"
          onClick={async () => {
            if (!window.confirm('TEST 랭킹 데이터 전체 삭제')) return
            setAdminError(null)
            try {
              // Delete synthetic players first (cascade removes results via RLS/DB design)
              const client = createPublicClient()
              if (client) {
                // Find synthetic players
                const { data: syntheticPlayers } = await client.from('players').select('id,slug').like('slug', 'test-player-%')
                for (const p of syntheticPlayers || []) {
                  await fetch(`/api/players/${p.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
                }
                // Also delete synthetic results directly for safety
                const { data: syntheticResults } = await client.from('player_results').select('id').in('player_id', (syntheticPlayers || []).map((p: any) => p.id))
                for (const r of syntheticResults || []) {
                  await fetch('/api/player-results', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id }) })
                }
              }
              setResults([])
              setAdminError('Synthetic ranking test data deleted.')
            } catch {
              setAdminError('Failed to delete synthetic ranking data.')
            }
          }}
        >TEST 랭킹 데이터 전체 삭제</button>
        <button
          type="button"
          className="admin-button secondary"
          onClick={async () => {
            setAdminError(null)
            try {
              // Re-seed synthetic players via seed endpoint if available, else rely on seedPlayers update
              // This refreshes the page so synthetic players load from seed
              router.refresh()
              window.location.reload()
            } catch {
              setAdminError('Failed to refresh synthetic ranking data.')
            }
          }}
        >TEST 랭킹 100명 생성</button>
      </div>

      <div className="admin-actions">
        <button className="admin-button" type="submit">Save Player</button>
        <Link className="admin-button secondary" href="/admin/players">Cancel</Link>
      </div>
    </form>
  )
}
