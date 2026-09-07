'use client'

import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { useSite } from '@/components/site/site-provider'

export function SiteShell({ children }: { children: ReactNode }) {
  const { darkMode, language } = useSite()

  return (
    <main className={`${darkMode ? 'theme-dark' : ''} lang-${language.toLowerCase()}`}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  )
}
