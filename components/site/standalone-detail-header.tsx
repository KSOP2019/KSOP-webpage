'use client'

import { SiteProvider } from '@/components/site/site-provider'
import { DetailHeader } from '@/components/site/detail-header'

/** Series pages render outside the (site) layout, so they carry their own provider. */
export function StandaloneDetailHeader({ activeHref }: { activeHref?: string }) {
  return (
    <SiteProvider>
      <DetailHeader activeHref={activeHref} />
    </SiteProvider>
  )
}
