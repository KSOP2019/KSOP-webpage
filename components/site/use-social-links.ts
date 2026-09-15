'use client'

import { useEffect, useState } from 'react'

export type SocialLinks = {
  FLOPIN: string
  Instagram: string
  X: string
  Discord: string
  Facebook: string
  YouTube: string
}

const EMPTY: SocialLinks = {
  FLOPIN: '',
  Instagram: '',
  X: '',
  Discord: '',
  Facebook: '',
  YouTube: '',
}

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLinks>(EMPTY)

  useEffect(() => {
    let active = true
    fetch('/api/social', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data) return
        setLinks({
          FLOPIN: data.flopin || '',
          Instagram: data.instagram || '',
          X: data.x || '',
          Discord: data.discord || '',
          Facebook: data.facebook || '',
          YouTube: data.youtube || '',
        })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return links
}
