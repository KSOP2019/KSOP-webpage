'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { useSite } from '@/components/site/site-provider'
import { glassCssVars } from '@/lib/tokens/glass'

export function SiteShell({ children }: { children: ReactNode }) {
  const { darkMode, language } = useSite()
  // 원칙 2·3: 토큰 변수만 주입(색상 하드코딩 없음), 값은 resolvedTheme 기준.
  // 원칙 1: <main> 박스·클래스 구조 불변. style var 추가만 허용.
  const { resolvedTheme } = useTheme()

  return (
    <main
      className={`${darkMode ? 'theme-dark' : ''} lang-${language.toLowerCase()}`}
      style={glassCssVars(resolvedTheme) as CSSProperties}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  )
}
