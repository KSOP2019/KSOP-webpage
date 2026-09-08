'use client'

import { useState } from 'react'
import type { Language, LocaleCopy, SiteContent } from '@/lib/types'

const languages: Language[] = ['EN', 'KR', 'JP', 'CN']
const copyFields: Array<{ key: keyof LocaleCopy; label: string }> = [
  { key: 'ticker', label: 'Ticker' },
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'hero', label: 'Hero title' },
  { key: 'intro', label: 'Hero intro' },
  { key: 'register', label: 'Register button' },
  { key: 'explore', label: 'Explore button' },
  { key: 'guaranteed', label: 'Guaranteed label' },
  { key: 'invitation', label: 'Invitation label' },
  { key: 'stack', label: 'Starting stack label' },
  { key: 'reg', label: 'Registration label' },
  { key: 'schedule', label: 'Schedule section label' },
  { key: 'ranking', label: 'Ranking section label' },
  { key: 'news', label: 'News section label' },
  { key: 'follow', label: 'Follow label' },
  { key: 'buyin', label: 'Buy-in label' },
]

export function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaved(false)
    setSaving(true)

    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })

    setSaving(false)
    if (response.ok) setSaved(true)
  }

  function updateCopy(language: Language, key: keyof LocaleCopy, value: string) {
    setContent({
      ...content,
      copy: {
        ...content.copy,
        [language]: { ...content.copy[language], [key]: value },
      },
    })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Images & logos</h3>
      <label>
        Hero / poster image URL
        <input value={content.heroImage} onChange={(event) => setContent({ ...content, heroImage: event.target.value })} />
      </label>
      <label>
        Light mode logo URL
        <input value={content.logoBlack} onChange={(event) => setContent({ ...content, logoBlack: event.target.value })} />
      </label>
      <label>
        Dark mode logo URL
        <input value={content.logoWhite} onChange={(event) => setContent({ ...content, logoWhite: event.target.value })} />
      </label>

      <h3>Series information</h3>
      <label>
        Series date
        <input value={content.seriesDate} onChange={(event) => setContent({ ...content, seriesDate: event.target.value })} />
      </label>
      <label>
        Series venue
        <input value={content.seriesVenue} onChange={(event) => setContent({ ...content, seriesVenue: event.target.value })} />
      </label>
      <label>
        Series GTD
        <input value={content.seriesGtd} onChange={(event) => setContent({ ...content, seriesGtd: event.target.value })} />
      </label>
      <label>
        Countdown days
        <input type="number" value={content.countdownDays} onChange={(event) => setContent({ ...content, countdownDays: Number(event.target.value) })} />
      </label>

      <h3>Home sections</h3>
      <label>
        Intro title
        <textarea rows={2} value={content.introTitle} onChange={(event) => setContent({ ...content, introTitle: event.target.value })} />
      </label>
      <label>
        Intro body
        <textarea rows={4} value={content.introBody} onChange={(event) => setContent({ ...content, introBody: event.target.value })} />
      </label>
      <label>
        Image break label
        <input value={content.imageBreakLabel} onChange={(event) => setContent({ ...content, imageBreakLabel: event.target.value })} />
      </label>
      <label>
        Image break title
        <input value={content.imageBreakTitle} onChange={(event) => setContent({ ...content, imageBreakTitle: event.target.value })} />
      </label>
      <label>
        Image break emphasis
        <input value={content.imageBreakEmphasis} onChange={(event) => setContent({ ...content, imageBreakEmphasis: event.target.value })} />
      </label>

      <h3>Navigation & multilingual copy</h3>
      {languages.map((language) => (
        <fieldset key={language} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 16 }}>
          <legend style={{ padding: '0 8px', fontWeight: 700 }}>{language}</legend>
          <label>
            Navigation labels (comma separated)
            <input
              value={content.copy[language].nav.join(', ')}
              onChange={(event) =>
                setContent({
                  ...content,
                  copy: {
                    ...content.copy,
                    [language]: {
                      ...content.copy[language],
                      nav: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
                    },
                  },
                })
              }
            />
          </label>
          {copyFields.map(({ key, label }) => (
            <label key={`${language}-${String(key)}`}>
              {label}
              <input
                value={String(content.copy[language][key] ?? '')}
                onChange={(event) => updateCopy(language, key, event.target.value)}
              />
            </label>
          ))}
        </fieldset>
      ))}

      <div className="admin-actions">
        <button className="admin-button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save content'}
        </button>
        {saved ? <span>Saved.</span> : null}
      </div>
    </form>
  )
}
