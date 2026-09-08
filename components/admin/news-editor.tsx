'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { NewsItem, NewsCategory } from '@/lib/types'

const categories: NewsCategory[] = ['FIELD NOTES', 'PLAYER PORTRAIT', 'KSOP JOURNAL']

export function NewsEditor({ initialItem }: { initialItem?: NewsItem }) {
  const router = useRouter()
  const [item, setItem] = useState<NewsItem>(
    initialItem ?? {
      slug: '',
      category: 'FIELD NOTES',
      date: 'DATE PENDING',
      title: '',
      excerpt: '',
      body: '',
      published: false,
    },
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const isNew = !initialItem
    const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const response = await fetch(isNew ? '/api/news' : `/api/news/${slug}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, slug, published: item.published }),
    })
    if (response.ok) {
      router.push('/admin/news')
      router.refresh()
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Slug
        <input value={item.slug} onChange={(e) => setItem({ ...item, slug: e.target.value })} />
      </label>
      <label>
        Title
        <input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
      </label>
      <label>
        Category
        <select value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value as NewsCategory })}>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </label>
      <label>
        Excerpt
        <textarea rows={3} value={item.excerpt} onChange={(e) => setItem({ ...item, excerpt: e.target.value })} />
      </label>
      <label>
        Body
        <textarea rows={6} value={item.body} onChange={(e) => setItem({ ...item, body: e.target.value })} />
      </label>
      <label>
        <input type="checkbox" checked={item.published} onChange={(e) => setItem({ ...item, published: e.target.checked })} />
        Published
      </label>
      <div className="admin-actions">
        <button className="admin-button" type="submit">Save News</button>
        <Link className="admin-button secondary" href="/admin/news">Cancel</Link>
      </div>
    </form>
  )
}
