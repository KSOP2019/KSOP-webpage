import { notFound } from 'next/navigation'
import { AboutTopicClient } from '@/components/site/about-page-client'
import { getSiteContent } from '@/lib/data'

const ABOUT_TOPICS = [
  { slug: 'series', title: 'THE SERIES' },
  { slug: 'venue', title: 'THE VENUE' },
] as const

type PageProps = { params: Promise<{ 'page-slug': string }> }

export function generateStaticParams() {
  return ABOUT_TOPICS.map((topic) => ({ 'page-slug': topic.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) return { title: 'About · KSOP' }
  return { title: `${topic.title} · KSOP About` }
}

export default async function AboutDetailPage({ params }: PageProps) {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) notFound()

  const content = await getSiteContent()

  return <AboutTopicClient content={content} slug={topic.slug} />
}
