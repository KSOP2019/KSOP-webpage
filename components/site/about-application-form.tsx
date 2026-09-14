'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useSite } from '@/components/site/site-provider'
import type { AboutFormCopy } from '@/lib/types'
import type { ApplyFieldSpec } from '@/lib/about-data'
import './about-hub.css'

export interface LocalizedField {
  label: string
  options?: string[]
}

interface AboutApplicationFormProps {
  spec: ApplyFieldSpec[]
  copy: AboutFormCopy
  fields: LocalizedField[]
}

/**
 * UI-only application form. No backend storage exists, so intake is disabled
 * by design: submit is locked and a "preparing" notice is shown upfront.
 * Never shows fake success. Includes honeypot, client validation,
 * aria-invalid/describedby, first-error focus, and aria-live feedback.
 * PII is never placed in URL or logged.
 */
export function AboutApplicationForm({ spec, copy, fields }: AboutApplicationFormProps) {
  const { t } = useSite()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [lastSubmitAt, setLastSubmitAt] = useState(0)
  const errorRef = useRef<HTMLDivElement | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Client duplicate-submit lock (10s). No submission API exists; this is not server rate limiting.
    const now = Date.now()
    if (submitting || now - lastSubmitAt < 10000) return
    const form = event.currentTarget
    const data = new FormData(form)
    // Honeypot: bots fill hidden field → silently drop.
    if (String(data.get('company_website') || '').trim() !== '') return
    const nextErrors: Record<string, string> = {}
    for (const field of spec) {
      const raw = String(data.get(field.name) || '').trim()
      if (field.required && !raw) {
        nextErrors[field.name] = t.forms.required
        continue
      }
      if (!raw) continue
      if (raw.length > 2000) {
        nextErrors[field.name] = t.forms.tooLong
        continue
      }
      if (field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        nextErrors[field.name] = t.forms.invalidEmail
        continue
      }
      if (field.kind === 'tel' && !/^[+0-9()\-\s]{7,20}$/.test(raw)) {
        nextErrors[field.name] = t.forms.invalidPhone
        continue
      }
    }
    // Privacy consent is mandatory.
    if (!data.get('privacy_consent')) {
      nextErrors['privacy_consent'] = t.forms.privacyConsent
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus(t.forms.correctErrors)
      // First-error focus.
      const firstName = Object.keys(nextErrors)[0]
      const el = document.getElementById(firstName === 'privacy_consent' ? 'apply-privacy-consent' : `apply-${firstName}`)
      el?.focus()
      errorRef.current?.focus()
      return
    }
    // No backend: never fake success. Show preparing notice, lock submit.
    setSubmitting(true)
    setLastSubmitAt(now)
    setStatus(copy.pending)
    setSubmitting(false)
  }

  return (
    <div>
      <p className="muted-copy" role="status" style={{ marginBottom: '16px' }}>
        {t.forms.preparing}
      </p>
      <div ref={errorRef} tabIndex={-1} aria-live="polite" style={{ outline: 'none' }}>
        {status ? <p className="muted-copy" role="status">{status}</p> : null}
      </div>
      <form className="about-hub-form" onSubmit={onSubmit} noValidate>
        {/* Honeypot — hidden from users, bots only. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
          <label htmlFor="apply-company-website">
            Website
            <input id="apply-company-website" name="company_website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} />
          </label>
        </div>
        {spec.map((field, index) => {
          const localized = fields[index]
          if (!localized) return null
          const fullWidth = field.fullWidth || field.kind === 'textarea'
          const id = `apply-${field.name}`
          const errorId = `${id}-error`
          const hasError = !!errors[field.name]
          return (
            <label key={field.name} className={fullWidth ? 'about-hub-field about-hub-field--full' : 'about-hub-field'} htmlFor={id}>
              <span>
                {localized.label}
                {field.required ? ' *' : ''}
              </span>
              {field.kind === 'textarea' ? (
                <textarea
                  id={id}
                  name={field.name}
                  required={field.required}
                  maxLength={2000}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                />
              ) : field.kind === 'select' ? (
                <select
                  id={id}
                  name={field.name}
                  required={field.required}
                  defaultValue=""
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {(localized.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.kind}
                  required={field.required}
                  maxLength={field.kind === 'email' ? 254 : 200}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                />
              )}
              {hasError ? (
                <span id={errorId} role="alert" className="muted-copy">
                  {errors[field.name]}
                </span>
              ) : null}
            </label>
          )
        })}
        <div className="about-hub-field about-hub-field--full">
          <label htmlFor="apply-privacy-consent" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <input
              id="apply-privacy-consent"
              name="privacy_consent"
              type="checkbox"
              required
              aria-invalid={!!errors['privacy_consent']}
              aria-describedby={errors['privacy_consent'] ? 'apply-privacy-consent-error' : undefined}
            />
            <span>{t.forms.privacyConsent}</span>
          </label>
          {errors['privacy_consent'] ? (
            <span id="apply-privacy-consent-error" role="alert" className="muted-copy">
              {errors['privacy_consent']}
            </span>
          ) : null}
        </div>
        <div className="about-hub-field about-hub-field--full">
          <button className="primary-cta" type="submit" disabled aria-disabled="true" title={t.forms.preparing} style={{ justifyContent: 'center', opacity: 0.6 }}>
            {t.forms.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
