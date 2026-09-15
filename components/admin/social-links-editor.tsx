'use client'

import { useEffect, useState } from 'react'

const FIELDS = [
  ['flopin', 'FLOPIN'],
  ['instagram', 'Instagram'],
  ['x', 'X'],
  ['discord', 'Discord'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
] as const

type SocialState = Record<(typeof FIELDS)[number][0], string>

const EMPTY: SocialState = {
  flopin: '', instagram: '', x: '', discord: '', facebook: '', youtube: '',
}

export function SocialLinksEditor() {
  const [social, setSocial] = useState<SocialState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/social', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : EMPTY)
      .then((data) => setSocial({ ...EMPTY, ...data }))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaved(false)
    setSaving(true)
    const response = await fetch('/api/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(social),
    })
    setSaving(false)
    if (response.ok) setSaved(true)
  }

  return (
    <section className="admin-subcard">
      <h3>Social channels</h3>
      <p>Header/Footer에 6개 채널은 항상 노출됩니다. URL이 비어 있으면 비활성 상태로 표시됩니다.</p>
      {FIELDS.map(([key, label]) => (
        <label key={key}>
          {label} URL
          <input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={social[key]}
            disabled={loading}
            onChange={(event) => setSocial({ ...social, [key]: event.target.value })}
          />
        </label>
      ))}
      <div className="admin-actions">
        <button className="admin-button" type="button" disabled={loading || saving} onClick={save}>
          {saving ? 'Saving…' : 'Save social links'}
        </button>
        {saved ? <span>Saved.</span> : null}
      </div>
    </section>
  )
}
