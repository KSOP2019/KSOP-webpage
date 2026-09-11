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
    if (typeof window === 'undefined') return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const lenis = new Lenis({ duration: 1.2 });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScroll;
