'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { resolveGlassMode } from '@/lib/tokens/glass';

type SpotlightProps = {
  /** Spotlight overlay를掛ける Hero container의 ref */
  containerRef: React.RefObject<HTMLElement | null>;
};

/**
 * Spotlight — ONLY Hero, ONLY dark mode.
 * - pointer position CSS variables (--spot-x/--spot-y).
 * - radial-gradient overlay: position absolute, pointer-events none.
 * - Do not insert into layout flow, do not change hero x/y/height.
 * - rAF via pointer update, will-change only while needed.
 * - prefers-reduced-motion: static/disabled.
 */
export function Spotlight({ containerRef }: SpotlightProps) {
  const { resolvedTheme } = useTheme();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const isDark = resolveGlassMode(resolvedTheme) === 'dark';

  useEffect(() => {
    if (!isDark) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const apply = () => {
      rafRef.current = 0;
      if (!pending.current || !overlay) return;
      const { x, y } = pending.current;
      overlay.style.setProperty('--spot-x', `${x}px`);
      overlay.style.setProperty('--spot-y', `${y}px`);
      overlay.style.opacity = '1';
      pending.current = null;
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pending.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (overlay) overlay.style.opacity = '0';
    };

    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);
    return () => {
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, isDark]);

  if (!isDark) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0,
        background:
          'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(255,255,255,0.14), transparent 65%)',
        zIndex: 2,
      }}
    />
  );
}

export default Spotlight;
