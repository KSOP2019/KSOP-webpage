import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminMediaPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>Media</h2>
      <p>Upload images to the public media storage bucket.</p>
      <form action="/api/admin/upload" method="POST" encType="multipart/form-data" className="admin-form">
        <label>
          File
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        <button className="admin-button" type="submit">Upload</button>
      </form>
      <p className="muted-copy" style={{ marginTop: '12px' }}>
        Supported types: jpg, jpeg, png, webp. Max size: 10MB. GIF not allowed.
      </p>
      <p className="muted-copy" style={{ marginTop: '12px' }}>
        Upload returns the public URL which can be used in hero/poster/news fields.
      </p>
    </section>
  )
}
