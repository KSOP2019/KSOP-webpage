import { SiteProvider } from '@/components/site/site-provider'
import { SiteShell } from '@/components/site/site-shell'
import { getSiteContent } from '@/lib/data'
import { seedContent } from '@/lib/seed'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let content
  try {
    content = await getSiteContent()
  } catch (error) {
    if (process.env.VERCEL_ENV !== 'preview') throw error
    content = seedContent
  }

  return (
    <SiteProvider initialContent={content}>
      <SiteShell>{children}</SiteShell>
    </SiteProvider>
  )
}
