'use client';

import { useId, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { getGlassTokens, glassCssVars } from '@/lib/tokens/glass';
import type { CSSProperties } from 'react';

type GlassTooltipProps = {
  /** 기존 Events row (trigger). hover/focus 시 buy-in 표시. */
  children: ReactNode;
  /** Tooltip에 표시할 buy-in 텍스트 */
  buyIn: string;
};

/**
 * GlassTooltip — Events existing row에 hover/focus 시 buy-in 표시.
 * - Absolutely positioned overlay only.
 * - Must NOT affect row height, must NOT push siblings.
 * - Glass tokens only.
 * - Keyboard focus supported (focus-within).
 * - Mobile: hover-only tooltip disable, tap/focus accessible fallback (focus shows).
 */
export function GlassTooltip({ children, buyIn }: GlassTooltipProps) {
  const { resolvedTheme } = useTheme();
  const tokens = getGlassTokens(resolvedTheme);
  const tipId = useId();

  const tipStyle = {
    ...(glassCssVars(resolvedTheme) as CSSProperties),
    background: tokens.surfaceStrong,
    borderColor: tokens.mode === 'light' ? tokens.stroke : tokens.border,
    boxShadow: `0 10px 28px ${tokens.shadow}, inset 0 1px ${tokens.highlight}`,
    color: tokens.foreground,
  } as CSSProperties;

  return (
    <span className="glass-tooltip-wrap" style={{ position: 'relative', display: 'block' }}>
      <span className="glass-tooltip-trigger" aria-describedby={tipId} style={{ display: 'block' }}>
        {children}
      </span>
      <span
        id={tipId}
        role="tooltip"
        data-glass="popover"
        className="glass glass-tooltip-bubble"
        style={{
          ...tipStyle,
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          padding: '6px 10px',
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: 'solid',
          fontSize: 11,
          letterSpacing: '0.08em',
          opacity: 0,
        }}
      >
        {buyIn}
      </span>
      <style>{`
        .glass-tooltip-wrap .glass-tooltip-bubble { opacity: 0; transition: opacity .18s ease; }
        .glass-tooltip-wrap:hover .glass-tooltip-bubble,
        .glass-tooltip-wrap:focus-within .glass-tooltip-bubble { opacity: 1; }
        @media (hover: none) {
          .glass-tooltip-wrap .glass-tooltip-bubble { opacity: 0; }
          .glass-tooltip-wrap:focus-within .glass-tooltip-bubble { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .glass-tooltip-wrap .glass-tooltip-bubble { transition: none; }
        }
      `}</style>
    </span>
  );
}

export default GlassTooltip;
