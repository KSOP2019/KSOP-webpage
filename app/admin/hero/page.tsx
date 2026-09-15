import { redirect } from 'next/navigation'
import { HeroLayoutEditor } from '@/components/admin/hero-layout-editor'
import { getSiteContent } from '@/lib/data'
import { getHeroLayout } from '@/lib/hero-layout-store'
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
      <p>
        Drag the title, action card, and KSOP symbol in the preview. Use the sliders for precise size,
        position, opacity, and bottom information-rail adjustments, then save.
      </p>
      <HeroLayoutEditor
        initialLayout={heroLayout}
        heroImage={content.heroImage}
        darkLogo={content.logoWhite}
      />
    </section>
  )
}
