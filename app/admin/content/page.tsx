import { redirect } from 'next/navigation'
import { ContentEditor } from '@/components/admin/content-editor'
import { HeroLayoutEditor } from '@/components/admin/hero-layout-editor'
import { PartnerEditor } from '@/components/admin/partner-editor'
import { getSiteContent } from '@/lib/data'
import { getHeroLayout } from '@/lib/hero-layout-store'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminContentPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const [content, heroLayout] = await Promise.all([
    getSiteContent(),
    getHeroLayout(),
  ])

  return (
    <section className="admin-card">
      <h2>Site Content</h2>
      <p>Edit hero poster image, logos, series copy, multilingual hero text, homepage layout, and partnerships.</p>
      <HeroLayoutEditor
        initialLayout={heroLayout}
        heroImage={content.heroImage}
        darkLogo={content.logoWhite}
      />
      <ContentEditor initialContent={content} />
      <PartnerEditor />
    </section>
  )
}
