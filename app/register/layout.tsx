import { SiteProvider } from '@/components/site/site-provider'
import { SiteShell } from '@/components/site/site-shell'
import { getSiteContent } from '@/lib/data'
import { seedContent } from '@/lib/seed'

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  let content
  try {
    content = await getSiteContent()
  } catch (error) {
    console.error('RegisterLayout content fallback to seedContent:', error)
    content = seedContent
  }

  return (
    <SiteProvider initialContent={content}>
      <SiteShell>{children}</SiteShell>
    </SiteProvider>
  )
}
