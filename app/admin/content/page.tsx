import { redirect } from 'next/navigation'
import { ContentEditor } from '@/components/admin/content-editor'
import { SocialLinksEditor } from '@/components/admin/social-links-editor'
import { getSiteContent } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminContentPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const content = await getSiteContent()

  return (
    <section className="admin-card">
      <h2>Site Content</h2>
      <p>Edit hero/poster imagery, logos, series copy, multilingual text, and all six social channel URLs.</p>
      <ContentEditor initialContent={content} />
      <SocialLinksEditor />
    </section>
  )
}
