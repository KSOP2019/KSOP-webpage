import { redirect } from 'next/navigation'
import { HeroLayoutEditorMain } from '@/components/admin/hero-layout-editor-main'
import { getSiteContent } from '@/lib/data'
import { getHeroLayout } from '@/lib/hero-layout-admin'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminHeroLayoutPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')

  const [content, heroLayout] = await Promise.all([
    getSiteContent(),
    getHeroLayout(),
  ])

  return (
    <section className="admin-card">
      <h2>HERO Layout</h2>
      <p>Drag the title, action card, and KSOP symbol. Fine-tune with sliders, then save. These values are used by the Preview HERO.</p>
      <HeroLayoutEditorMain
        initialLayout={heroLayout}
        heroImage={content.heroImage}
        darkLogo={content.logoWhite}
      />
    </section>
  )
}
