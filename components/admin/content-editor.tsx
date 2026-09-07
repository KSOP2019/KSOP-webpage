'use client'

import { useState } from 'react'
import type { SiteContent } from '@/lib/types'

export function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaved(false)

    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })

    if (response.ok) setSaved(true)
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Hero / poster image URL
        <input
          value={content.heroImage}
          onChange={(event) => setContent({ ...content, heroImage: event.target.value })}
        />
      </label>
      <label>
        Black logo URL
        <input
          value={content.logoBlack}
          onChange={(event) => setContent({ ...content, logoBlack: event.target.value })}
        />
      </label>
      <label>
        White logo URL
        <input
          value={content.logoWhite}
          onChange={(event) => setContent({ ...content, logoWhite: event.target.value })}
        />
      </label>
      <label>
        Series date
        <input
          value={content.seriesDate}
          onChange={(event) => setContent({ ...content, seriesDate: event.target.value })}
        />
      </label>
      <label>
        Series venue
        <input
          value={content.seriesVenue}
          onChange={(event) => setContent({ ...content, seriesVenue: event.target.value })}
        />
      </label>
      <label>
        Series GTD
        <input
          value={content.seriesGtd}
          onChange={(event) => setContent({ ...content, seriesGtd: event.target.value })}
        />
      </label>
      <label>
        Countdown days
        <input
          type="number"
          value={content.countdownDays}
          onChange={(event) => setContent({ ...content, countdownDays: Number(event.target.value) })}
        />
      </label>
      <label>
        Intro body
        <textarea
          rows={4}
          value={content.introBody}
          onChange={(event) => setContent({ ...content, introBody: event.target.value })}
        />
      </label>
      <label>
        Hero title (EN)
        <input
          value={content.copy.EN.hero}
          onChange={(event) =>
            setContent({
              ...content,
              copy: { ...content.copy, EN: { ...content.copy.EN, hero: event.target.value } },
            })
          }
        />
      </label>
      <label>
        Hero title (KR)
        <input
          value={content.copy.KR.hero}
          onChange={(event) =>
            setContent({
              ...content,
              copy: { ...content.copy, KR: { ...content.copy.KR, hero: event.target.value } },
            })
          }
        />
      </label>
      <div className="admin-actions">
        <button className="admin-button" type="submit">
          Save content
        </button>
        {saved ? <span>Saved.</span> : null}
      </div>
    </form>
  )
}
