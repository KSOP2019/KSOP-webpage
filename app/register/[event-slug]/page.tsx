import { notFound } from 'next/navigation'
import { RegistrationPageClient } from '@/components/site/registration-page-client'
import { getEvent, getSiteContent } from '@/lib/data'

type PageProps = { params: Promise<{ 'event-slug': string }> }

export const revalidate = 120

export default async function RegisterPage({ params }: PageProps) {
  const { 'event-slug': eventSlug } = await params
  const [event, content] = await Promise.all([getEvent(eventSlug), getSiteContent()])

  if (!event || !event.published) notFound()

  return <RegistrationPageClient event={event} venue={content.seriesVenue} />
}
