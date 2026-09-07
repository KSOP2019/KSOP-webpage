'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      setError('Invalid password')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <section className="admin-login">
      <form className="admin-card admin-form" onSubmit={handleSubmit}>
        <h2>KSOP Admin Login</h2>
        <p className="muted-copy">Manage events, posters, copy, rankings, and news.</p>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p style={{ color: '#c5202d' }}>{error}</p> : null}
        <button className="admin-button" type="submit">
          Sign in
        </button>
      </form>
    </section>
  )
}
