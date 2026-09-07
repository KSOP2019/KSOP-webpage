import { SiteProvider } from '@/components/site/site-provider'
import { SiteShell } from '@/components/site/site-shell'
import { getSiteContent } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent()

  return (
    <SiteProvider initialContent={content}>
      <SiteShell>{children}</SiteShell>
    </SiteProvider>
  )
}
