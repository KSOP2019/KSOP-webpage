'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { resolveGlassMode } from '@/lib/tokens/glass'
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

export function SiteProvider({ children, initialContent }: { children: ReactNode; initialContent?: SiteContent }) {
  const [language, setLanguageState] = useState<Language>('KR')
  const [content, setContent] = useState<SiteContent>(initialContent ?? seedContent)
  // 원칙 3: 라이트/다크 판정은 next-themes resolvedTheme 단일 소스.
  // 기존 darkMode boolean API는 유지해 소비자 DOM 변경 없이 브릿지한다.
  const { resolvedTheme, setTheme } = useTheme()
  const darkMode = resolveGlassMode(resolvedTheme) === 'dark'

  const setDarkMode = (value: boolean) => {
    setTheme(value ? 'dark' : 'light')
  }

  const setLanguage = (nextLanguage: Language) => {
    if (nextLanguage === language) return
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase()
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, darkMode, setDarkMode, content, setContent, t: content.copy[language] }),
    [language, darkMode, content],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) throw new Error('useSite must be used within SiteProvider')
  return context
}
