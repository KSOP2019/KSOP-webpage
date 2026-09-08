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
    setFileName(file.name)
    setLoading(true)
    setErrors([])

    try {
      // This uses xlsx library for parsing
      const { read, utils } = await import('xlsx')
      const data = await file.arrayBuffer()
      const workbook = read(new Uint8Array(data), { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = utils.sheet_to_json(sheet) || []
      const validRows = []
      const rowErrors: string[] = []

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (!r.name) rowErrors.push(`Row ${i + 1}: missing name`)
        if (!r.date) rowErrors.push(`Row ${i + 1}: missing date`)
        if (r.date && !/\b(19|20)\d{2}\b/.test(String(r.date))) rowErrors.push(`Row ${i + 1}: date missing explicit year`)
        validRows.push({ ...r, rowIndex: i + 1 })
      }

      setPreview(validRows)
      setErrors(rowErrors)
    } catch (e: any) {
      setErrors([`Parse error: ${e.message}`])
      setPreview([])
    }
    setLoading(false)
  }

  async function handleImport(publish: boolean) {
    setLoading(true)
    const response = await fetch('/api/admin/events/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: preview.map((r) => ({
        slug: r.slug || (r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: r.name,
        date: r.date,
        type: r.type || 'NLH',
        buyInType: r.buyInType || 'INVITATION',
        buyIn: r.buyIn || '',
        gtd: r.gtd || '',
        startingChips: Number(r.startingChips) || 0,
        lateReg: r.lateReg || '',
        levelTime: r.levelTime || '',
        published: publish,
      })), publish }),
    })
    if (response.ok) {
      router.push('/admin/events')
      router.refresh()
    } else {
      setErrors([`Import failed: ${response.status}`])
    }
    setLoading(false)
  }

  return (
    <section className="admin-card">
      <h2>Bulk Import Events</h2>
      <p>Upload an Excel (.xlsx) file with event rows.</p>
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
          <table className="admin-table">
            <thead>
              <tr><th>Row</th><th>Name</th><th>Date</th><th>Type</th></tr>
            </thead>
            <tbody>
              {preview.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{r.rowIndex}</td>
                  <td>{r.name || ''}</td>
                  <td>{r.date || ''}</td>
                  <td>{r.type || ''}</td>
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
