'use client'

import { createElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react'

type RevealTag = 'div' | 'article' | 'section'

interface RevealProps {
  children: ReactNode
  as?: RevealTag
  className?: string
  style?: CSSProperties
  delay?: number
  id?: string
  ariaLabel?: string
}

/**
 * Subtle once-only scroll reveal (opacity + 16px rise).
 * Content stays fully visible when JS is disabled (hiding applies
 * only once `.js` is present), when IntersectionObserver is missing,
 * and under prefers-reduced-motion.
 */
export function Reveal({ children, as = 'div', className = '', style, delay = 0, id, ariaLabel }: RevealProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('js')
  }, [])

  useEffect(() => {
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  const mergedStyle: CSSProperties | undefined = delay > 0 ? { ...style, transitionDelay: `${delay}ms` } : style
  const mergedClass = `reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`

  return createElement(
    as,
    { ref: setElement, className: mergedClass, style: mergedStyle, id, 'aria-label': ariaLabel },
    children,
  )
}
