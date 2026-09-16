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
      <p>
        왼쪽 축소 미리보기와 오른쪽 컨트롤을 동시에 보면서 조정합니다. 타이틀·액션 카드·심볼은 미리보기에서 직접 드래그할 수 있고,
        심볼과 카드 이미지는 파일로 추가하거나 제거할 수 있습니다.
      </p>
      <HeroLayoutEditorMain initialLayout={heroLayout} heroImage={content.heroImage} />
    </section>
  )
}
