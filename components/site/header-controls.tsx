'use client'

import { Globe2 } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import type { Language } from '@/lib/types'

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'EN', label: 'ENGLISH' },
  { code: 'KR', label: '한국어' },
  { code: 'JP', label: '日本語' },
  { code: 'CN', label: '中文' },
]

/** Globe-only closed state; full native names in a fixed popup below the globe. */
export function LanguageMenu() {
  const { language, setLanguage } = useSite()

  return (
    <details className="language-menu">
      <summary className="language" aria-label={`Language ${language}`}>
        <Globe2 aria-hidden="true" />
      </summary>
      <div className="language-options">
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            aria-pressed={language === code}
            onClick={() => setLanguage(code)}
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  )
}

export function ThemeSwitch() {
  const { darkMode, setDarkMode } = useSite()

  return (
    <button
      className={darkMode ? 'theme-switch is-dark' : 'theme-switch'}
      type="button"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={darkMode}
      onClick={() => setDarkMode(!darkMode)}
    >
      <span className="theme-sun" aria-hidden="true">☀</span>
      <span className="theme-track"><span /></span>
      <span className="theme-moon" aria-hidden="true">☾</span>
    </button>
  )
}
