'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { resolveGlassMode } from '@/lib/tokens/glass'
import type { Language, SiteContent } from '@/lib/types'
import { seedContent } from '@/lib/seed'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'
import zh from '@/locales/zh.json'

/** Editorial UI strings — single source for public chrome. Event names never live here. */
export type LocaleStrings = typeof ko;

const LOCALES: Record<Language, LocaleStrings> = { KR: ko, EN: en, JP: ja, CN: zh } as Record<Language, LocaleStrings>

const LOCALE_STORAGE_KEY = 'ksop-locale'

function readStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (value === 'KR' || value === 'EN' || value === 'JP' || value === 'CN') return value
  } catch {
    // Storage unavailable — fall through to default.
  }
  return null
}

type SiteContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  content: SiteContent
  setContent: (content: SiteContent) => void
  /** Editorial UI strings from locales/*.json (instant, no reload). */
  t: LocaleStrings
  /** CMS-driven copy (about/forms) — data, not chrome. Falls back to local seed. */
  copy: SiteContent['copy'][Language]
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children, initialContent }: { children: ReactNode; initialContent?: SiteContent }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage() ?? 'KR')
  const [content, setContent] = useState<SiteContent>(initialContent ?? seedContent)
  // 원칙 3: 라이트/다크 판정은 next-themes resolvedTheme 단일 소스.
  // 기존 darkMode boolean API는 유지해 소비자 DOM 변경 없이 브릿지한다.
  const { resolvedTheme, setTheme } = useTheme()
  const darkMode = resolveGlassMode(resolvedTheme) === 'dark'

  const setDarkMode = (value: boolean) => {
    setTheme(value ? 'dark' : 'light')
  }

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState((current) => {
      if (current === nextLanguage) return current
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLanguage)
      } catch {
        // Storage unavailable — language still switches instantly in memory.
      }
      return nextLanguage
    })
  }

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
      t: LOCALES[language],
      copy: content.copy[language],
    }),
    [language, darkMode, content],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) throw new Error('useSite must be used within SiteProvider')
  return context
}
