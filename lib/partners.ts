export type KsopPartner = {
  name: string
  url: string
  logoUrl: string
  logoAlt: string
}

export const DEFAULT_KSOP_PARTNERS: KsopPartner[] = [
  {
    name: 'Japan Open Poker Tour',
    url: 'https://japanopenpoker.com/',
    logoUrl: 'https://japanopenpoker.com/wp-content/uploads/ourlogos/JOPT_logo_blue.png',
    logoAlt: 'Japan Open Poker Tour',
  },
  {
    name: 'China Poker Games',
    url: 'http://www.chinapokergames.com/',
    logoUrl: 'https://www.lifeofpoker.com/storage/1654/conversions/tour-35-md-image.webp',
    logoAlt: 'China Poker Games',
  },
  {
    name: 'Global Poker Index',
    url: 'https://www.globalpokerindex.com/',
    logoUrl: 'https://pbs.twimg.com/profile_images/1460279332031586307/VF39Q_gb_400x400.jpg',
    logoAlt: 'Global Poker Index',
  },
  {
    name: 'PLAYSOFT',
    url: '',
    logoUrl: '/images/partners/playsoft.svg',
    logoAlt: 'PLAYSOFT',
  },
  {
    name: 'PLAYPLACE',
    url: '',
    logoUrl: '/images/partners/playplace.svg',
    logoAlt: 'PLAYPLACE',
  },
  {
    name: 'FLOPIN',
    url: '',
    logoUrl: '/images/partners/flopin-wordmark.svg',
    logoAlt: 'FLOPIN',
  },
]

export function normalizePartners(value: unknown): KsopPartner[] {
  if (!Array.isArray(value)) return DEFAULT_KSOP_PARTNERS

  return value
    .map((item) => {
      const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      const name = typeof source.name === 'string' ? source.name.trim() : ''
      const url = typeof source.url === 'string' ? source.url.trim() : ''
      const logoUrl = typeof source.logoUrl === 'string' ? source.logoUrl.trim() : ''
      const logoAlt = typeof source.logoAlt === 'string' ? source.logoAlt.trim() : name
      return { name, url, logoUrl, logoAlt }
    })
    .filter((partner) => partner.name && partner.logoUrl)
    .slice(0, 60)
}

// Default rendered during SSR and whenever CMS partner data is unavailable.
export const KSOP_PARTNERS = DEFAULT_KSOP_PARTNERS
