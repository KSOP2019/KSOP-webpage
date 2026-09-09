'use client'

import { useRef, useState } from 'react'

type AdminImageFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
  /** Storage folder for new uploads (home | schedule | news | events | logos | players | misc). */
  folder?: string
  /** e.g. "16:9, transparent PNG preferred". Shown as a hint. */
  aspectHint?: string
  required?: boolean
  allowClear?: boolean
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif'

/**
 * Reusable CMS image field: preview + file select + upload + replace + clear.
 * Upload only populates the field URL; the parent form's Save button persists it.
 */
export function AdminImageField({
  label,
  value,
  onChange,
  folder = 'misc',
  aspectHint,
  required,
  allowClear = true,
}: AdminImageFieldProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [pendingName, setPendingName] = useState('')
  const [localPreview, setLocalPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function pickFile() {
    setError('')
    fileRef.current?.click()
  }

  function onFileSelected() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setError('')
    setPendingName(file.name)
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview)
    setLocalPreview(URL.createObjectURL(file))
  }

  async function uploadSelected() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('먼저 파일을 선택하세요.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Upload failed')
        return
      }
      if (!data?.url) {
        setError('Upload failed: empty response')
        return
      }
      onChange(String(data.url))
      setPendingName('')
      if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview)
      setLocalPreview('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function clearAll() {
    onChange('')
    setPendingName('')
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview)
    setLocalPreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const preview = localPreview || value

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontWeight: 600 }}>
        {label}
        {required ? ' *' : ''}
      </span>
      {aspectHint ? (
        <span className="muted-copy" style={{ fontSize: 12 }}>
          {aspectHint}
        </span>
      ) : null}
      {preview ? (
        <img
          src={preview}
          alt={`${label} preview`}
          style={{ width: '100%', maxWidth: 360, maxHeight: 220, objectFit: 'contain', borderRadius: 10, border: '1px solid #d8dde5', background: '#f4f6f9' }}
        />
      ) : (
        <span className="muted-copy" style={{ fontSize: 12 }}>
          No image selected.
        </span>
      )}
      <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={onFileSelected} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="admin-button secondary" type="button" onClick={pickFile} disabled={uploading}>
          파일 선택
        </button>
        <button className="admin-button secondary" type="button" onClick={uploadSelected} disabled={uploading || !pendingName}>
          {uploading ? '업로드 중…' : value ? '이미지 업로드 / 교체' : '이미지 업로드'}
        </button>
        {allowClear && (value || pendingName) ? (
          <button className="admin-button secondary" type="button" onClick={clearAll} disabled={uploading}>
            지우기
          </button>
        ) : null}
      </div>
      {pendingName ? (
        <span className="muted-copy" style={{ fontSize: 12 }}>
          선택됨: {pendingName} — 업로드 버튼을 누르면 필드에 반영됩니다.
        </span>
      ) : null}
      <label style={{ fontWeight: 400, fontSize: 12 }}>
        Current URL (advanced)
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://…" />
      </label>
      {error ? (
        <span style={{ color: '#b42318', fontSize: 12 }}>{error}</span>
      ) : null}
    </div>
  )
}
