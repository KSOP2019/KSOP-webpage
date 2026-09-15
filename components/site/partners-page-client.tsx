'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { DEFAULT_KSOP_PARTNERS, normalizePartners, type KsopPartner } from '@/lib/partners'

function slugifyPartner(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function FullPartnerCard({ partner }: { partner: KsopPartner }) {
  const content = (
    <>
      <span className="partners-full-logo-wrap">
        <img
          className="partners-full-logo"
          src={partner.logoUrl}
          alt={partner.logoAlt || partner.name}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="partners-full-name">{partner.name}</span>
      {partner.url ? <ArrowUpRight aria-hidden="true" /> : null}
    </>
  )
  const id = slugifyPartner(partner.name)

  if (!partner.url) {
    return (
      <article className="partners-full-card is-static" id={id}>
        {content}
      </article>
    )
  }

  const external = /^https?:\/\//i.test(partner.url)
  return (
    <a
      className="partners-full-card"
      id={id}
      href={partner.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={`${partner.name} 공식 사이트로 이동`}
    >
      {content}
    </a>
  )
}

export function PartnersPageClient() {
  const { language } = useSite()
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

  const labels = {
    KR: {
      kicker: 'PARTNERS',
      title: 'OFFICIAL PARTNERS',
      intro: 'KSOP와 공식 협력 관계에 있는 파트너를 한곳에서 확인할 수 있습니다.',
    },
    EN: {
      kicker: 'PARTNERS',
      title: 'OFFICIAL PARTNERS',
      intro: 'Explore the companies and organizations officially working with KSOP.',
    },
    JP: {
      kicker: 'PARTNERS',
      title: 'OFFICIAL PARTNERS',
      intro: 'KSOPと公式に協力しているパートナーを一覧でご覧いただけます。',
    },
    CN: {
      kicker: 'PARTNERS',
      title: 'OFFICIAL PARTNERS',
      intro: '查看与KSOP建立正式合作关系的合作伙伴。',
    },
  }[language]

  return (
    <section className="section-pad partners-page">
      <div className="section-top partners-page-head">
        <div>
          <div className="section-label">{labels.kicker}</div>
          <h2>{labels.title}</h2>
        </div>
        <p className="partners-page-intro">{labels.intro}</p>
      </div>

      <div className="partners-full-grid">
        {partners.map((partner) => (
          <FullPartnerCard partner={partner} key={`${partner.name}-${partner.logoUrl}`} />
        ))}
      </div>
    </section>
  )
}
