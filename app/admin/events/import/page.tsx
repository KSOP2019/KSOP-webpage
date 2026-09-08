'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type PreviewRow = {
  rowIndex: number
  slug: string
  date: string
  name: string
  type: string
  buyIn: string
  gtd: string
  startingChips: number
  lateReg: string
  levelTime: string
  dayLabel: string
  buyInType: string
  blindStructure: []
  classification: 'NEW' | 'UPDATE_EXISTING' | 'INVALID' | 'DUPLICATE_IN_FILE'
  errors: string[]
}

type PreviewSummary = {
  fileName: string
  totalRows: number
  validRows: number
  invalidRows: number
  newRows: number
  updateRows: number
  duplicateInFile: number
}

export default function AdminImportPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [summary, setSummary] = useState<PreviewSummary | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setErrors(['Only .xlsx files are allowed'])
      setPreview([])
      setSummary(null)
      return
    }

    setLoading(true)
    setErrors([])
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/events/import/preview', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) {
        setErrors([result.error || `Preview failed: ${response.status}`])
        setPreview([])
        setSummary(null)
      } else {
        setPreview(result.preview || [])
        setSummary({
          fileName: result.fileName || file.name,
          totalRows: result.totalRows || 0,
          validRows: result.validRows || 0,
          invalidRows: result.invalidRows || 0,
          newRows: result.newRows || 0,
          updateRows: result.updateRows || 0,
          duplicateInFile: result.duplicateInFile || 0,
        })
      }
    } catch (e: any) {
      setErrors([`Upload error: ${e.message}`])
      setPreview([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(mode: 'draft' | 'publish') {
    const validRows = preview.filter((row) => row.classification === 'NEW' || row.classification === 'UPDATE_EXISTING')
    if (validRows.length === 0) {
      setErrors(['No valid rows available to import'])
      return
    }
    if (mode === 'publish' && !window.confirm(`Publish ${validRows.length} valid event rows now? Existing matching slugs will be updated.`)) {
      return
    }

    setLoading(true)
    setErrors([])
    try {
      const response = await fetch('/api/admin/events/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows, mode }),
      })
      const result = await response.json()
      if (!response.ok) setErrors([result.error || `Import failed: ${response.status}`])
      else {
        router.push('/admin/events')
        router.refresh()
      }
    } catch (e: any) {
      setErrors([`Import error: ${e.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-card">
      <h2>Bulk Import Events</h2>
      <p>Upload an Excel (.xlsx) file. The server validates every row before anything is written.</p>
      <p><a href="/api/admin/events/import/template" download>Download Excel Template</a></p>

      <form onSubmit={handleUpload} className="admin-form">
        <label>
          Excel file (.xlsx)
          <input type="file" name="file" accept=".xlsx" required />
        </label>
        <button className="admin-button" type="submit" disabled={loading}>Upload and Preview</button>
      </form>

      {summary && (
        <p className="muted-copy" style={{ marginTop: '16px' }}>
          File: {summary.fileName} | Total: {summary.totalRows} | Valid: {summary.validRows} | Invalid: {summary.invalidRows} | New: {summary.newRows} | Update: {summary.updateRows} | Duplicate: {summary.duplicateInFile}
        </p>
      )}

      {errors.length > 0 && (
        <div style={{ color: '#c5202d', marginTop: '12px' }}>
          <strong>Errors:</strong>
          <ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
        </div>
      )}

      {preview.length > 0 && (
        <div style={{ marginTop: '24px', overflowX: 'auto' }}>
          <h3>Preview</h3>
          <table className="admin-table">
            <thead>
              <tr><th>Row</th><th>Slug</th><th>Date</th><th>Name</th><th>Type</th><th>Buy-in</th><th>GTD</th><th>Action</th><th>Error</th></tr>
            </thead>
            <tbody>
              {preview.map((row) => (
                <tr key={`${row.rowIndex}-${row.slug}`}>
                  <td>{row.rowIndex}</td>
                  <td>{row.slug}</td>
                  <td>{row.date}</td>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.buyIn}</td>
                  <td>{row.gtd}</td>
                  <td><strong>{row.classification.replace('_', ' ')}</strong></td>
                  <td style={{ color: '#c5202d', fontSize: '11px' }}>{row.errors.join(', ') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-actions" style={{ marginTop: '16px' }}>
            <button className="admin-button" type="button" onClick={() => handleImport('draft')} disabled={loading || !summary?.validRows}>Import Valid Rows as Draft</button>
            <button className="admin-button" type="button" onClick={() => handleImport('publish')} disabled={loading || !summary?.validRows}>Publish Valid Rows</button>
          </div>
        </div>
      )}
    </section>
  )
}
