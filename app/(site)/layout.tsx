import { SiteProvider } from '@/components/site/site-provider'
import { SiteShell } from '@/components/site/site-shell'
import { getSiteContent } from '@/lib/data'
import { seedContent } from '@/lib/seed'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let content
  try {
    content = await getSiteContent()
  } catch (error) {
    // About/company hub is static localized corporate copy (not QA ranking data):
    // never blank the page. CMS may override later, but empty/error CMS must
    // fall back to canonical local copy in BOTH preview and production.
    console.error('SiteLayout content fallback to seedContent:', error)
    content = seedContent
  }

  return (
    <SiteProvider initialContent={content}>
      <SiteShell>{children}</SiteShell>
    </SiteProvider>
  )
}
