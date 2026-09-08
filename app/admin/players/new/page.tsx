import { redirect } from 'next/navigation'
import { PlayerEditor } from '@/components/admin/player-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminNewPlayerPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  return (
    <section className="admin-card">
      <h2>New Player</h2>
      <PlayerEditor />
    </section>
  )
}
