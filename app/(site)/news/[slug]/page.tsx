import { notFound } from 'next/navigation'
import { NewsDetailClient } from '@/components/site/news-detail-client'
import { getNewsItem } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = { params: Promise<{ slug: string }> }

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  let decodedSlug = slug
  try {
    decodedSlug = decodeURIComponent(slug)
  } catch {
    // Keep the original segment if it is already decoded or malformed.
  }

  const item = await getNewsItem(decodedSlug)
  if (!item || !item.published) notFound()

  return <NewsDetailClient item={item} />
}
