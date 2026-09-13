'use client'

import { useState, type FormEvent } from 'react'
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
 * UI-only application form. No backend storage exists, so submit resolves to
 * the localized "intake being prepared" state. No API routes, no DB writes.
 */
export function AboutApplicationForm({ spec, copy, fields }: AboutApplicationFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="section-pad about-hub">
        <div className="section-label">{copy.title}</div>
        <p className="large-copy" style={{ marginTop: '20px', maxWidth: '60ch' }}>
          {copy.pending}
        </p>
      </section>
    )
  }

  return (
    <form className="about-hub-form" onSubmit={onSubmit}>
      {spec.map((field, index) => {
        const localized = fields[index]
        if (!localized) return null
        const fullWidth = field.fullWidth || field.kind === 'textarea'
        const id = `apply-${field.name}`
        return (
          <label key={field.name} className={fullWidth ? 'about-hub-field about-hub-field--full' : 'about-hub-field'} htmlFor={id}>
            <span>
              {localized.label}
              {field.required ? ' *' : ''}
            </span>
            {field.kind === 'textarea' ? (
              <textarea id={id} name={field.name} required={field.required} />
            ) : field.kind === 'select' ? (
              <select id={id} name={field.name} required={field.required} defaultValue="">
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
              <input id={id} name={field.name} type={field.kind} required={field.required} />
            )}
          </label>
        )
      })}
      <div className="about-hub-field about-hub-field--full">
        <button className="primary-cta" type="submit" style={{ justifyContent: 'center' }}>
          {copy.cta}
        </button>
      </div>
    </form>
  )
}
