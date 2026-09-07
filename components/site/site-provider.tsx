'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Language, SiteContent } from '@/lib/types'
import { seedContent } from '@/lib/seed'

type SiteContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  content: SiteContent
  setContent: (content: SiteContent) => void
  t: SiteContent['copy'][Language]
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({
  children,
  initialContent,
}: {
  children: ReactNode
  initialContent?: SiteContent
}) {
  const [language, setLanguage] = useState<Language>('EN')
  const [darkMode, setDarkMode] = useState(false)
  const [content, setContent] = useState<SiteContent>(initialContent ?? seedContent)

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase()
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      content,
      setContent,
      t: content.copy[language],
    }),
    [language, darkMode, content],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSite must be used within SiteProvider')
  }
  return context
}
