'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { NAV_ROUTES, socials } from '@/lib/nav'

function SocialIcon({ name, src }: { name: string; src: string }) {
  return (
    <a className="social-icon" href="/#social" aria-label={name}>
      <img src={src} alt="" />
    </a>
  )
}

export function SiteFooter() {
  const { content, t, darkMode } = useSite()
  const lightLogo = !content.logoBlack || ['/images/ksop-logo-black.png', '/images/ksop-dark-logo.png'].includes(content.logoBlack)
    ? '/images/ksop-light-logo.svg'
    : content.logoBlack
  const darkLogo = !content.logoWhite || content.logoWhite === '/images/ksop-logo-white.png'
    ? '/images/ksop-dark-logo.svg'
    : content.logoWhite
  const logo = darkMode ? darkLogo : lightLogo

  return (
    <>
      <footer className="site-footer" id="social">
        <div>
          <img className="footer-logo" src={logo} alt="KSOP Korea Series of Poker" />
          <p className="footer-note">
            Korea&apos;s premier live poker series.
            <br />
            Designed for the game.
          </p>
        </div>
        <div className="footer-nav">
          {t.nav.slice(0, 4).map((item, index) => (
            <Link href={NAV_ROUTES[index]} key={item}>
              {item}
            </Link>
          ))}
        </div>
        <div className="socials">
          <span>{t.follow}</span>
          <div>
            {Object.entries(socials).map(([name, src]) => (
              <SocialIcon key={name} name={name} src={src} />
            ))}
          </div>
        </div>
        <div className="copyright">© 2026 KSOP · ALL RIGHTS RESERVED</div>
      </footer>
    </>
  )
}
