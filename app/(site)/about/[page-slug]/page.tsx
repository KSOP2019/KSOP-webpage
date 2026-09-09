import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AboutTopicClient } from '@/components/site/about-page-client'
import { getSiteContent } from '@/lib/data'

const ABOUT_TOPICS = [
  { slug: 'series', title: 'THE SERIES' },
  { slug: 'venue', title: 'THE VENUE' },
] as const

type PageProps = { params: Promise<{ 'page-slug': string }> }

export const revalidate = 120

export function generateStaticParams() {
  return ABOUT_TOPICS.map((topic) => ({ 'page-slug': topic.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) return { title: 'About · KSOP' }
  return {
    title: topic.title,
    description: `${topic.title} — About the Korea Series of Poker.`,
    alternates: { canonical: `/about/${slug}` },
  }
}

export default async function AboutDetailPage({ params }: PageProps) {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) notFound()

  const content = await getSiteContent()

  return <AboutTopicClient content={content} slug={topic.slug} />
}
