'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { PlayerItem } from '@/lib/types'

export function PlayerEditor({ initialItem }: { initialItem?: PlayerItem }) {
  const router = useRouter()
  const [item, setItem] = useState<PlayerItem>(
    initialItem ?? {
      id: '',
      rank: 1,
      name: '',
      country: 'KR',
      earnings: '₩ 0',
      portrait: '',
      bio: '',
      published: false,
    },
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const isNew = !initialItem
    const slug = item.id || item.name.toLowerCase().replace(/\s/g, '-')
    const response = await fetch(isNew ? '/api/players' : `/api/players/${slug}`, {
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
        <input value={item.id} onChange={(e) => setItem({ ...item, id: e.target.value })} />
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
      <div className="admin-actions">
        <button className="admin-button" type="submit">Save Player</button>
        <Link className="admin-button secondary" href="/admin/players">Cancel</Link>
      </div>
    </form>
  )
}
