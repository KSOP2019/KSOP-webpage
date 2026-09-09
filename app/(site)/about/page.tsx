import { AboutPageClient } from '@/components/site/about-page-client'
import { getSiteContent } from '@/lib/data'

export const revalidate = 120

export default async function AboutPage() {
  const content = await getSiteContent()

  return <AboutPageClient content={content} />
}
