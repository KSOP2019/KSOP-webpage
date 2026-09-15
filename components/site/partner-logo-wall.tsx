'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { DEFAULT_KSOP_PARTNERS, normalizePartners, type KsopPartner } from '@/lib/partners'

function PartnerItem({ partner }: { partner: KsopPartner }) {
  const content = (
    <>
      <span className="ksop-partner-logo-wrap">
        <img
          className="ksop-partner-logo"
          src={partner.logoUrl}
          alt={partner.logoAlt || partner.name}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="ksop-partner-name">{partner.name}</span>
      {partner.url ? <ArrowUpRight aria-hidden="true" /> : null}
    </>
  )

  if (!partner.url) {
    return (
      <div className="ksop-partner-link is-static" aria-label={partner.name}>
        {content}
      </div>
    )
  }

  const external = /^https?:\/\//i.test(partner.url)
  return (
    <a
      className="ksop-partner-link"
      href={partner.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={`${partner.name} 공식 사이트로 이동`}
    >
      {content}
    </a>
  )
}

export function PartnerLogoWall() {
  const [partners, setPartners] = useState<KsopPartner[]>(DEFAULT_KSOP_PARTNERS)

  useEffect(() => {
    let cancelled = false

    fetch('/api/partners', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : DEFAULT_KSOP_PARTNERS)
      .then((value) => {
        if (!cancelled) setPartners(normalizePartners(value))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const visiblePartners = partners.slice(0, 6)

  return (
    <section className="ksop-partners-section" aria-labelledby="ksop-partners-title">
      <div className="section-top ksop-partners-heading">
        <div>
          <div className="section-label" id="ksop-partners-title">OFFICIAL PARTNERS</div>
        </div>
        <Link className="text-link" href="/partners">전체 파트너 보기 <ArrowUpRight /></Link>
      </div>

      <div className="ksop-partners-grid">
        {visiblePartners.map((partner) => (
          <PartnerItem partner={partner} key={`${partner.name}-${partner.logoUrl}`} />
        ))}
      </div>
    </section>
  )
}
