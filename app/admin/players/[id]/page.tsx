import { redirect } from 'next/navigation'
import { getPlayer } from '@/lib/data'
import { PlayerEditor } from '@/components/admin/player-editor'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminEditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const { id } = await params
  const player = await getPlayer(id)
  if (!player) redirect('/admin/players')
  return (
    <section className="admin-card">
      <h2>Edit Player</h2>
      <PlayerEditor initialItem={player} />
    </section>
  )
}
