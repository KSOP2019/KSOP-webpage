import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { MediaManager } from '@/components/admin/media-manager'

export default async function AdminMediaPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>Media</h2>
      <p>Upload images to the public media storage bucket.</p>
      <MediaManager />
      <p className="muted-copy" style={{ marginTop: '12px' }}>
        Supported types: jpg, jpeg, png, webp, gif, avif. Max size: 10MB.
        Uploaded images can be selected from Home / Schedule / News image fields.
      </p>
    </section>
  )
}
