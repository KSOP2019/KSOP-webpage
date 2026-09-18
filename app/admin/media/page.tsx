import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { MediaManager } from '@/components/admin/media-manager'

export default async function AdminMediaPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>파일 관리</h2>
      <p>이미지와 PDF를 등록하고 주소를 복사해 연결하세요.</p>
      <MediaManager />
      <p className="muted-copy" style={{ marginTop: '12px' }}>
        Supported types: JPG, PNG, WebP, GIF, PDF. 최대 4MB.
        Uploaded images can be selected from Home / Schedule / News image fields.
      </p>
    </section>
  )
}
