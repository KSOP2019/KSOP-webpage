import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsDetailClient } from '@/components/site/news-detail-client'
import { getNewsItemForPreview } from '@/lib/news-preview'
import { SITE_OG_IMAGE, SITE_URL } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = { params: Promise<{ slug: string }> }

async function loadItem(slug: string) {
  let decodedSlug = slug
  try {
    decodedSlug = decodeURIComponent(slug)
  } catch {
    // Keep the original segment if it is already decoded or malformed.
  }
  const item = await getNewsItemForPreview(decodedSlug)
  return item && item.published ? item : undefined
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await loadItem(slug)
  if (!item) return {}
  return {
    title: item.title,
    description: item.excerpt || item.title,
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt || undefined,
      url: `/news/${item.slug}`,
      images: [{ url: item.coverUrl || SITE_OG_IMAGE }],
    },
    twitter: { card: 'summary_large_image', title: item.title, images: [item.coverUrl || SITE_OG_IMAGE] },
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await loadItem(slug)
  if (!item) notFound()

  // NewsArticle JSON-LD — verified factual fields only, no synthetic claims.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt || item.title,
    datePublished: item.date,
    author: [{ '@type': 'Organization', name: 'KSOP' }],
    mainEntityOfPage: `${SITE_URL}/news/${item.slug}`,
    ...(item.coverUrl ? { image: [item.coverUrl] } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NewsDetailClient item={item} />
    </>
  )
}
