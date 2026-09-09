'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type MediaItem = {
  name: string
  path: string
  url: string
  size: number | null
  mime: string | null
  createdAt: string | null
}

const FOLDERS = ['misc', 'home', 'schedule', 'news', 'events', 'events/posters', 'events/banners', 'events/thumbnails', 'logos', 'players', 'media'] as const

function formatBytes(size: number | null): string {
  if (size == null) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export function MediaManager() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [folder, setFolder] = useState<string>('misc')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingName, setPendingName] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/media')
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data?.error === 'string' ? data.error : '목록을 불러오지 못했습니다.')
        return
      }
      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (e: any) {
      setError(e?.message || '목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function uploadSelected() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('먼저 파일을 선택하세요.')
      return
    }
    setUploading(true)
    setError('')
    setNotice('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      const response = await fetch('/api/admin/media/upload', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Upload failed')
        return
      }
      setNotice(`업로드 완료: ${data?.path || data?.url || ''}`)
      setPendingName('')
      if (fileRef.current) fileRef.current.value = ''
      await refresh()
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setNotice('URL이 복사되었습니다.')
    } catch {
      setNotice(url)
    }
  }

  async function removeItem(path: string) {
    if (!window.confirm(`삭제할까요?\n${path}\n(공개 페이지에서 사용 중이면 깨진 이미지가 됩니다)`)) return
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Delete failed')
        return
      }
      setItems((current) => current.filter((item) => item.path !== path))
      setNotice('삭제되었습니다.')
    } catch (e: any) {
      setError(e?.message || 'Delete failed')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label>
          폴더
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            {FOLDERS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={() => setPendingName(fileRef.current?.files?.[0]?.name || '')}
        />
        <button className="admin-button" type="button" onClick={uploadSelected} disabled={uploading || !pendingName}>
          {uploading ? '업로드 중…' : '이미지 업로드'}
        </button>
        <button className="admin-button secondary" type="button" onClick={refresh} disabled={loading}>
          새로고침
        </button>
      </div>
      <p className="muted-copy">JPG · PNG · WebP · GIF · AVIF, 최대 10MB. 업로드된 파일은 공개 URL로 바로 표시됩니다.</p>
      {error ? <span style={{ color: '#b42318', fontSize: 13 }}>{error}</span> : null}
      {notice ? <span style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{notice}</span> : null}
      {loading ? (
        <p className="muted-copy">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="muted-copy">업로드된 이미지가 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {items.map((item) => (
            <div key={item.path} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <img
                src={item.url}
                alt={item.name}
                loading="lazy"
                style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, background: '#f4f6f9' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, overflowWrap: 'anywhere' }}>{item.name}</span>
              <span className="muted-copy" style={{ fontSize: 11 }}>
                {item.path} · {formatBytes(item.size)}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="admin-button secondary" type="button" onClick={() => copyUrl(item.url)}>
                  URL 복사
                </button>
                <button className="admin-button secondary" type="button" onClick={() => removeItem(item.path)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
