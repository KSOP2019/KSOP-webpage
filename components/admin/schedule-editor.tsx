'use client'

import { useState } from 'react'
import type { ScheduleContent } from '@/lib/schedule-content'
import { AdminImageField } from '@/components/admin/admin-image-field'

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

  function updateItem(index: number, field: keyof ScheduleContent['items'][number], value: string) {
    const items = content.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    setContent({ ...content, items })
  }

  function addItem() {
    setContent({
      ...content,
      items: [...content.items, { label: 'NEW SERIES', image: '', status: 'upcoming', dateRange: '', venue: '', matchType: '', matchName: '' }],
    })
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

      <h3>Series / schedule cards</h3>
      <p>각 카드는 홈 일정 → 일정 페이지 → 시리즈 상세로 동일하게 연결됩니다. 연결 조건은 해당 시리즈에 포함될 이벤트를 자동 분류하는 기준입니다.</p>
      {content.items.map((item, index) => (
        <fieldset key={index} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 16 }}>
          <legend style={{ padding: '0 8px', fontWeight: 700 }}>Series {index + 1}</legend>
          <label>
            Series title
            <input value={item.label} onChange={(e) => updateItem(index, 'label', e.target.value)} />
          </label>
          <label>
            Status
            <select value={item.status || 'upcoming'} onChange={(e) => updateItem(index, 'status', e.target.value)}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </label>
          <label>
            Date range
            <input value={item.dateRange || ''} onChange={(e) => updateItem(index, 'dateRange', e.target.value)} placeholder="2026.11.22 – 11.28" />
          </label>
          <label>
            Venue
            <input value={item.venue || ''} onChange={(e) => updateItem(index, 'venue', e.target.value)} placeholder="Venue / City" />
          </label>
          <AdminImageField
            label="Series image"
            value={item.image}
            onChange={(url) => updateItem(index, 'image', url)}
            folder="schedule"
            aspectHint="홈 일정 카드와 일정 페이지 시리즈 카드에 공통 사용됩니다. 저장 후 공개 페이지에 반영됩니다."
          />
          <label>
            Linked event type
            <select value={item.matchType || ''} onChange={(e) => updateItem(index, 'matchType', e.target.value)}>
              <option value="">No type filter</option>
              <option value="NLH">NLH</option>
              <option value="PLO">PLO</option>
              <option value="SATELLITE">SATELLITE</option>
              <option value="MAIN EVENT">MAIN EVENT</option>
              <option value="HIGH ROLLER">HIGH ROLLER</option>
            </select>
          </label>
          <label>
            Event name contains
            <input value={item.matchName || ''} onChange={(e) => updateItem(index, 'matchName', e.target.value)} placeholder="예: Warm-up" />
          </label>
          <button className="admin-button secondary" type="button" onClick={() => removeItem(index)}>Remove series</button>
        </fieldset>
      ))}

      <div className="admin-actions">
        <button className="admin-button secondary" type="button" onClick={addItem}>Add series</button>
        <button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save schedule'}</button>
        {saved ? <span>Saved.</span> : null}
      </div>
    </form>
  )
}
