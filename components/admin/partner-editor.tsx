'use client'

import { useEffect, useState } from 'react'
import { AdminImageField } from '@/components/admin/admin-image-field'
import { DEFAULT_KSOP_PARTNERS, normalizePartners, type KsopPartner } from '@/lib/partners'

function emptyPartner(): KsopPartner {
  return { name: '', url: '', logoUrl: '', logoAlt: '' }
}

export function PartnerEditor() {
  const [partners, setPartners] = useState<KsopPartner[]>(DEFAULT_KSOP_PARTNERS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/partners', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : DEFAULT_KSOP_PARTNERS)
      .then((value) => setPartners(normalizePartners(value)))
      .catch(() => setPartners(DEFAULT_KSOP_PARTNERS))
  }, [])

  function updatePartner(index: number, patch: Partial<KsopPartner>) {
    setSaved(false)
    setPartners((current) => current.map((partner, partnerIndex) => (
      partnerIndex === index ? { ...partner, ...patch } : partner
    )))
  }

  function removePartner(index: number) {
    setSaved(false)
    setPartners((current) => current.filter((_, partnerIndex) => partnerIndex !== index))
  }

  async function savePartners() {
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const response = await fetch('/api/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partners),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Partner save failed')
      setPartners(normalizePartners(payload))
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Partner save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-form" style={{ marginTop: 36 }}>
      <div>
        <h3 style={{ marginBottom: 8 }}>Homepage Partnerships</h3>
        <p style={{ marginTop: 0 }}>
          계약이 확정된 회사만 등록합니다. 회사명, 공식 사이트 URL, 로고를 저장하면 홈 하단 파트너십 영역에 반영됩니다.
        </p>
      </div>

      {partners.map((partner, index) => (
        <div
          key={`${partner.name}-${index}`}
          style={{
            display: 'grid',
            gap: 14,
            padding: 18,
            border: '1px solid var(--border)',
            borderRadius: 16,
          }}
        >
          <strong>Partner {index + 1}</strong>
          <label>
            Company name
            <input
              value={partner.name}
              onChange={(event) => updatePartner(index, {
                name: event.target.value,
                logoAlt: partner.logoAlt || event.target.value,
              })}
              placeholder="Japan Open Poker Tour"
            />
          </label>
          <label>
            Official website URL
            <input
              value={partner.url}
              onChange={(event) => updatePartner(index, { url: event.target.value })}
              placeholder="https://example.com/"
            />
          </label>
          <AdminImageField
            label="Partner logo"
            value={partner.logoUrl}
            onChange={(url) => updatePartner(index, { logoUrl: url })}
            folder="partners"
            aspectHint="권장: 투명 배경 PNG/WebP(SVG 가능 시 SVG). 흰 배경이 없는 누끼 로고를 사용하세요."
          />
          <label>
            Logo alt text
            <input
              value={partner.logoAlt}
              onChange={(event) => updatePartner(index, { logoAlt: event.target.value })}
              placeholder={partner.name || 'Partner logo'}
            />
          </label>
          <button type="button" className="secondary-button" onClick={() => removePartner(index)}>
            Remove partner
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setSaved(false)
            setPartners((current) => [...current, emptyPartner()])
          }}
          disabled={partners.length >= 24}
        >
          Add partner
        </button>
        <button type="button" onClick={savePartners} disabled={saving}>
          {saving ? 'Saving…' : 'Save partnerships'}
        </button>
      </div>

      {saved ? <p role="status">Partnerships saved.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  )
}
