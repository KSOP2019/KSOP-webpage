'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { SnsDock } from '@/components/effects/sns-dock'
import { getNavItems, socials, SOCIAL_URLS } from '@/lib/nav'

function SocialIcon({ name, src }: { name: string; src: string }) {
  const href = SOCIAL_URLS[name]
  // Confirmed URL only. Unconfirmed → hidden (never "#" or "/#social").
  if (!href) return null
  return (
    <SnsDock name={name} ariaLabel={name} href={href}>
      <img src={src} alt="" />
    </SnsDock>
  )
}

export function SiteFooter() {
  const { t, darkMode, language } = useSite()
  const logo = darkMode ? '/images/ksop-dark-approved.png' : '/images/ksop-light-approved.png'
  const confirmedSocials = Object.entries(socials).filter(([name]) => SOCIAL_URLS[name])

  return (
    <footer className="site-footer" id="social">
      <div>
        <img className="footer-logo" src={logo} alt="KSOP Korea Series of Poker" width={160} height={54} />
        <p className="footer-note">
          {t.footerLine1}
          <br />
          {t.footerLine2}
        </p>
      </div>
      <div className="footer-nav">
        {getNavItems(t.nav, language).slice(0, 4).map(({ href, label }) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </div>
      {confirmedSocials.length > 0 ? (
        <div className="socials">
          <span>{t.follow}</span>
          <div>
            {confirmedSocials.map(([name, src]) => (
              <SocialIcon key={name} name={name} src={src} />
            ))}
          </div>
        </div>
      ) : null}
      <div className="copyright">© 2026 KSOP · ALL RIGHTS RESERVED</div>
    </footer>
  )
}
