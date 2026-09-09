'use client'

import { Globe2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSite } from '@/components/site/site-provider'
import type { Language } from '@/lib/types'

const LANGUAGE_ORDER: Language[] = ['KR', 'EN', 'JP', 'CN']

const LANGUAGE_LABELS: Record<Language, string> = {
  KR: '한국어',
  EN: 'ENGLISH',
  JP: '日本語',
  CN: '中文',
}

/** Globe-only closed state; fixed popup below the globe.
 *  Closes immediately on selection, on outside click, and on Escape.
 *  Opening/closing never moves header geometry (overlay only). */
export function LanguageMenu() {
  const { language, setLanguage } = useSite()
  const detailsRef = useRef<HTMLDetailsElement | null>(null)

  useEffect(() => {
    const details = detailsRef.current
    if (!details) return

    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) {
        details.open = false
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.open) {
        details.open = false
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const availableLanguages = LANGUAGE_ORDER.filter((code) => code !== language)

  return (
    <details className="language-menu" ref={detailsRef}>
      <summary className="language" aria-label={`Language ${language}`}>
        <Globe2 aria-hidden="true" />
      </summary>
      <div className="language-options">
        {availableLanguages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setLanguage(code)
              if (detailsRef.current) detailsRef.current.open = false
            }}
          >
            {LANGUAGE_LABELS[code]}
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
