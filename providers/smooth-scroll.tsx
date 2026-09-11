'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — Lenis wrapper.
 * Wrapper element를 새로 만들지 않고 return children.
 * unmount 시 destroy, rAF lifecycle 정확히 정리.
 * prefers-reduced-motion 사용자는 Lenis disable.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reduced.matches) return

    const lenis = new Lenis({
      duration: 1.2,
    })

    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return children
}

export default SmoothScroll;
