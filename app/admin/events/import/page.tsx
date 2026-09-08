'use client'

import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminImportPage() {
  const router = useRouter()
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault()
    const input = (event.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.xlsx')) {
      setErrors(['Only .xlsx files are allowed'])
      setFileName('')
      setPreview([])
      return
    }
    setFileName(file.name)
    setLoading(true)
    setErrors([])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/events/import/preview', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) {
        setErrors([result.error || `Preview failed: ${response.status}`])
        setPreview([])
      } else {
        setPreview(result.preview || [])
        setErrors(result.errors || [])
      }
    } catch (e: any) {
      setErrors([`Upload error: ${e.message}`])
      setPreview([])
    }
    setLoading(false)
  }

  async function handleImport(publish: boolean) {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/events/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: preview, publish }),
      })
      const result = await response.json()
      if (response.ok) {
        router.push('/admin/events')
        router.refresh()
      } else {
        setErrors([result.error || `Import failed: ${response.status}`])
      }
    } catch (e: any) {
      setErrors([`Import error: ${e.message}`])
    }
    setLoading(false)
  }

  return (
    <section className="admin-card">
      <h2>Bulk Import Events</h2>
      <p>Upload an Excel (.xlsx) file with event rows.</p>
      <p><a href="/api/admin/events/import/template" download>Download Excel Template</a></p>
      <form onSubmit={handleUpload} className="admin-form">
        <label>
          Excel file (.xlsx)
          <input type="file" name="file" accept=".xlsx" required />
        </label>
        <button className="admin-button" type="submit" disabled={loading}>Upload and Preview</button>
      </form>
      {fileName && <p className="muted-copy">File: {fileName}</p>}
      {errors.length > 0 && (
        <div style={{ color: '#c5202d', marginTop: '12px' }}>
          <strong>Errors:</strong>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {preview.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Preview ({preview.length} rows)</h3>
          <p className="muted-copy">
            Total: {preview.length} | Valid: {preview.filter((r) => !(r.errors && r.errors.length > 0)).length} | Invalid: {preview.filter((r) => r.errors && r.errors.length > 0).length} | New: {preview.filter((r) => r.classification === 'NEW').length} | Update: {preview.filter((r) => r.classification === 'UPDATE_EXISTING').length} | Duplicate: {preview.filter((r) => r.classification === 'DUPLICATE_IN_FILE').length}
          </p>
          <table className="admin-table">
            <thead>
              <tr><th>Row</th><th>Slug</th><th>Date</th><th>Name</th><th>Type</th><th>Buy-in</th><th>GTD</th><th>Starting Chips</th><th>Late Reg</th><th>Level Time</th><th>Action</th><th>Error</th></tr>
            </thead>
            <tbody>
              {preview.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{r.rowIndex || i + 1}</td>
                  <td>{r.slug || ''}</td>
                  <td>{r.date || ''}</td>
                  <td>{r.name || ''}</td>
                  <td>{r.type || ''}</td>
                  <td>{r.buyIn || ''}</td>
                  <td>{r.gtd || ''}</td>
                  <td>{r.startingChips || ''}</td>
                  <td>{r.lateReg || ''}</td>
                  <td>{r.levelTime || ''}</td>
                  <td style={{ fontWeight: 'bold', color: r.classification === 'NEW' ? '#1a6' : r.classification === 'UPDATE_EXISTING' ? '#d90' : r.classification === 'DUPLICATE_IN_FILE' ? '#c5202d' : '#c5202d' }}>{r.classification || 'PENDING'}</td>
                  <td style={{ color: '#c5202d', fontSize: '11px' }}>{(r.errors || []).join(', ') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-actions" style={{ marginTop: '16px' }}>
            <button className="admin-button" type="button" onClick={() => handleImport(false)} disabled={loading}>Import as Draft</button>
            <button className="admin-button" type="button" onClick={() => handleImport(true)} disabled={loading}>Import and Publish</button>
          </div>
        </div>
      )}
    </section>
  )
}
