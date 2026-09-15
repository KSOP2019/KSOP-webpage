'use client'

import type { ReactNode } from 'react'

function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function setAtPath(root: any, path: Array<string | number>, value: string) {
  const next = cloneValue(root)
  let cursor = next
  path.slice(0, -1).forEach((part) => {
    cursor = cursor[part]
  })
  cursor[path[path.length - 1]] = value
  return next
}

export function NestedCopyEditor<T>({ value, onChange, title }: { value: T; onChange: (value: T) => void; title: string }) {
  function renderNode(node: any, path: Array<string | number>, label: string): ReactNode {
    if (typeof node === 'string') {
      const multiline = node.length > 90
      return (
        <label key={path.join('.')}>
          {humanize(label)}
          {multiline ? (
            <textarea rows={3} value={node} onChange={(event) => onChange(setAtPath(value, path, event.target.value))} />
          ) : (
            <input value={node} onChange={(event) => onChange(setAtPath(value, path, event.target.value))} />
          )}
        </label>
      )
    }

    if (Array.isArray(node)) {
      return (
        <fieldset key={path.join('.')} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 14 }}>
          <legend style={{ padding: '0 8px', fontWeight: 700 }}>{humanize(label)}</legend>
          {node.map((item, index) => renderNode(item, [...path, index], `${label} ${index + 1}`))}
        </fieldset>
      )
    }

    if (node && typeof node === 'object') {
      return (
        <fieldset key={path.join('.') || label} style={{ border: '1px solid #d8dde5', borderRadius: 10, padding: 14 }}>
          <legend style={{ padding: '0 8px', fontWeight: 700 }}>{humanize(label)}</legend>
          {Object.entries(node).map(([key, item]) => renderNode(item, [...path, key], key))}
        </fieldset>
      )
    }

    return null
  }

  return (
    <details style={{ marginTop: 14 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{title}</summary>
      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{renderNode(value, [], title)}</div>
    </details>
  )
}
