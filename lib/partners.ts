export type KsopPartner = {
  name: string
  url: string
  logoUrl: string
  logoAlt: string
}

/**
 * Homepage partnership source.
 * Keep this list limited to companies with an approved KSOP relationship.
 * Replace logoUrl with the contract-provided transparent PNG/WebP whenever an
 * official brand asset is supplied; homepage layout does not need to change.
 */
export const KSOP_PARTNERS: KsopPartner[] = [
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
]
