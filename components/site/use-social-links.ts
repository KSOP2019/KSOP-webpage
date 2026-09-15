'use client'

import { useEffect, useState } from 'react'
import { EMPTY_SOCIAL_LINKS, normalizeSocialLinks, type SocialLinks } from '@/lib/social-links'

export function useSocialLinks() {
  const [socials, setSocials] = useState<SocialLinks>(EMPTY_SOCIAL_LINKS)

  useEffect(() => {
    let active = true
    fetch('/api/social', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : EMPTY_SOCIAL_LINKS))
      .then((value) => {
        if (active) setSocials(normalizeSocialLinks(value))
      })
      .catch(() => {
        if (active) setSocials(EMPTY_SOCIAL_LINKS)
      })
    return () => {
      active = false
    }
  }, [])

  return socials
}
