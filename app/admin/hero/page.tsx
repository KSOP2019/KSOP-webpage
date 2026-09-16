import { redirect } from 'next/navigation'
import { HeroLayoutEditorV3 } from '@/components/admin/hero-layout-editor-v3'
import { getSiteContent } from '@/lib/data'
import { getHeroLayout } from '@/lib/hero-layout-admin'
import { getScheduleContent } from '@/lib/schedule-content'
import { isAdminAuthenticated } from '@/lib/auth'
import './hero-layout-admin.css'

export default async function AdminHeroLayoutPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')

  const [content, heroLayout, scheduleContent] = await Promise.all([
    getSiteContent(),
    getHeroLayout(),
    getScheduleContent(),
  ])
  const seriesLabel = scheduleContent.items[0]?.label || 'KSOP SERIES'

  return (
    <section className="admin-card hero-layout-admin" style={{ padding: '18px 22px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.05 }}>HERO Layout</h2>
        <p style={{ margin: 0, color: '#687386', fontSize: 13 }}>
          관리자와 Preview 홈이 동일한 HeroCanvas를 사용합니다. 여기서 보이는 좌표와 크기가 홈에 그대로 적용됩니다.
        </p>
      </div>
      <HeroLayoutEditorV3
        initialLayout={heroLayout}
        heroImage={content.heroImage}
        seriesCount={scheduleContent.items.length}
        seriesLabel={seriesLabel}
      />
    </section>
  )
}
