'use client'

import { useState } from 'react'
import type { ScheduleContent } from '@/lib/schedule-content'

export function ScheduleEditor({ initialContent }: { initialContent: ScheduleContent }) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    const response = await fetch('/api/admin/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
    setSaving(false)
    if (response.ok) setSaved(true)
  }

  function updateItem(index: number, field: 'label' | 'image', value: string) {
    const items = content.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    setContent({ ...content, items })
  }

  function addItem() {
    setContent({ ...content, items: [...content.items, { label: 'NEW SERIES', image: '' }] })
  }

  function removeItem(index: number) {
    setContent({ ...content, items: content.items.filter((_, itemIndex) => itemIndex !== index) })
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <label>
        Kicker
        <input value={content.kicker} onChange={(e) => setContent({ ...content, kicker: e.target.value })} />
      </label>
      <label>
        Title
        <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} />
      </label>
      <label>
        Intro
        <textarea rows={3} value={content.intro} onChange={(e) => setContent({ ...content, intro: e.target.value })} />
      </label>

      <h3>Schedule cards</h3>
      {content.items.map((item, index) => (
        <fieldset key={index} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 16 }}>
          <legend style={{ padding: '0 8px', fontWeight: 700 }}>Card {index + 1}</legend>
          <label>
            Label / title
            <input value={item.label} onChange={(e) => updateItem(index, 'label', e.target.value)} />
          </label>
          <label>
            Background image URL
            <input value={item.image} onChange={(e) => updateItem(index, 'image', e.target.value)} />
          </label>
          <button className="admin-button secondary" type="button" onClick={() => removeItem(index)}>Remove card</button>
        </fieldset>
      ))}

      <div className="admin-actions">
        <button className="admin-button secondary" type="button" onClick={addItem}>Add schedule card</button>
        <button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save schedule'}</button>
        {saved ? <span>Saved.</span> : null}
      </div>
    </form>
  )
}
