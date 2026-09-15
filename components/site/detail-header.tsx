'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { LanguageMenu, ThemeSwitch } from '@/components/site/header-controls'
import { SnsDock } from '@/components/effects/sns-dock'
import { useSocialLinks } from '@/components/site/use-social-links'
import { getNavItems } from '@/lib/nav'
import { SOCIAL_ORDER, SOCIAL_SYMBOLS } from '@/lib/social-links'

const LIGHT_LOGO = '/images/ksop-light-approved.png'
const DARK_LOGO = '/images/ksop-dark-approved.png'

/** Shared fixed-geometry detail header (Schedule/Events/Ranking/News/About + series pages). */
export function DetailHeader({ activeHref }: { activeHref?: string }) {
  const { t, darkMode, language } = useSite()
  const socialLinks = useSocialLinks()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const firstLink = navRef.current?.querySelector('a')
    firstLink instanceof HTMLElement && firstLink.focus()
    const closeAndRefocus = () => {
      setMenuOpen(false)
      requestAnimationFrame(() => toggleRef.current?.focus())
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRefocus()
      }
      if (event.key === 'Tab' && navRef.current) {
        const focusables = Array.from(navRef.current.querySelectorAll('a, button'))
        if (focusables.length === 0) return
        const first = focusables[0] as HTMLElement
        const last = focusables[focusables.length - 1] as HTMLElement
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        closeAndRefocus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  const closeMenu = (returnFocus: boolean) => {
    setMenuOpen(false)
    if (returnFocus) requestAnimationFrame(() => toggleRef.current?.focus())
  }

  return (
    <header className={`site-header detail-header glass${scrolled ? ' is-scrolled' : ''}`} data-glass="header">
      <Link href="/" className="brand">
        <img
          src={darkMode ? DARK_LOGO : LIGHT_LOGO}
          alt="KSOP Korea Series of Poker"
          width={170}
          height={54}
        />
      </Link>
      <nav ref={navRef} id="detail-primary-navigation" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary">
        {getNavItems(t.nav, language).map(({ href, label }) => {
          const active = activeHref === href
          return (
            <Link
              key={href}
              href={href}
              className={active ? 'active' : undefined}
              aria-current={active ? 'page' : undefined}
              onClick={() => closeMenu(true)}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="header-right">
        <div className="header-socials" aria-label="KSOP social channels">
          {SOCIAL_ORDER.map((name) => (
            <SnsDock key={name} name={name} ariaLabel={name} href={socialLinks[name] || undefined} className="social-icon social-text">
              <span aria-hidden="true">{SOCIAL_SYMBOLS[name]}</span>
              <span className="social-tooltip">{name.toUpperCase()}</span>
            </SnsDock>
          ))}
        </div>
        <div className="detail-actions header-actions">
          <LanguageMenu />
          <ThemeSwitch />
          <button
            ref={toggleRef}
            className="menu-toggle"
            onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="detail-primary-navigation"
            type="button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
