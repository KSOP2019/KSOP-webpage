import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AboutApplyClient } from '@/components/site/about-apply-client'
import { COOPERATION_IDS, isCooperationId } from '@/lib/about-data'
import { seedContent } from '@/lib/seed'

type PageProps = { params: Promise<{ type: string }> }

export const revalidate = 120

export function generateStaticParams() {
  return COOPERATION_IDS.map((type) => ({ type }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params
  if (!isCooperationId(type)) return {}
  const form = seedContent.copy.KR.about?.forms[type]
  return {
    title: form?.title ?? type,
    description: form?.description ?? 'KSOP partnership application.',
    alternates: { canonical: `/about/apply/${type}` },
  }
}

export default async function AboutApplyPage({ params }: PageProps) {
  const { type } = await params
  if (!isCooperationId(type)) notFound()

  return <AboutApplyClient type={type} />
}
