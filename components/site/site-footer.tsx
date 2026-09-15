'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { SnsDock } from '@/components/effects/sns-dock'
import { useSocialLinks } from '@/components/site/use-social-links'
import { getNavItems } from '@/lib/nav'
import { SOCIAL_ORDER, SOCIAL_SYMBOLS } from '@/lib/social-links'

export function SiteFooter() {
  const { t, darkMode, language } = useSite()
  const socialLinks = useSocialLinks()
  const logo = darkMode ? '/images/ksop-dark-approved.png' : '/images/ksop-light-approved.png'

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
        {getNavItems(t.nav, language).map(({ href, label }) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </div>

      <div className="socials">
        <span>{t.follow}</span>
        <div aria-label="KSOP social channels">
          {SOCIAL_ORDER.map((name) => (
            <SnsDock key={name} name={name} ariaLabel={name} href={socialLinks[name] || undefined}>
              <span aria-hidden="true">{SOCIAL_SYMBOLS[name]}</span>
            </SnsDock>
          ))}
        </div>
      </div>

      <div className="copyright">© 2026 KSOP · ALL RIGHTS RESERVED</div>
    </footer>
  )
}
