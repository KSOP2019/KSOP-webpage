import { redirect } from 'next/navigation'
import { HeroLayoutEditorV2 } from '@/components/admin/hero-layout-editor-v2'
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
    <section className="admin-card" style={{ padding: '18px 22px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.05 }}>HERO Layout</h2>
        <p style={{ margin: 0, color: '#687386', fontSize: 13 }}>
          미리보기와 컨트롤을 한 화면에서 조정합니다. 타이틀·액션 카드·심볼은 직접 드래그할 수 있습니다.
        </p>
      </div>
      <HeroLayoutEditorV2 initialLayout={heroLayout} heroImage={content.heroImage} />
    </section>
  )
}
