import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPlayers } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminPlayersPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')
  const players = await getPlayers()
  return (
    <section className="admin-card">
      <h2>Players</h2>
      <div className="admin-actions" style={{ marginBottom: '16px' }}>
        <Link className="admin-button" href="/admin/players/new">New Player</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Country</th>
            <th>Published</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>#{player.rank}</td>
              <td>{player.name}</td>
              <td>{player.country}</td>
              <td>{player.published ? 'Yes' : 'No'}</td>
              <td>
                <Link href={`/admin/players/${player.id}`} className="admin-button secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
