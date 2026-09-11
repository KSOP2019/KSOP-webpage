'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getGlassTokens, glassCssVars } from '@/lib/tokens/glass';
import type { CSSProperties } from 'react';

/**
 * PrizeTicker — ₩1,500,000,000 GTD infinite ticker + page scroll progress.
 * CRITICAL: Do NOT create a new vertical header row, do NOT change header height.
 * Safe slot이 없으면 mount하지 말고 BLOCKED_LAYOUT_SLOT 보고.
 * 이 컴포넌트는 overlay 전용으로 설계. 호출 측에서 기존 header/top 영역 overlay로만 사용.
 */
export function PrizeTicker() {
  const { resolvedTheme } = useTheme();
  const tokens = getGlassTokens(resolvedTheme);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const barStyle = {
    ...(glassCssVars(resolvedTheme) as CSSProperties),
    background: tokens.surface,
    borderColor: tokens.mode === 'light' ? tokens.stroke : tokens.border,
    boxShadow: `0 10px 28px ${tokens.shadow}, inset 0 1px ${tokens.highlight}`,
    color: tokens.foreground,
  } as CSSProperties;

  const items = Array.from({ length: 8 }, (_, i) => `₩1,500,000,000 GTD${i < 7 ? ' · ' : ''}`);

  return (
    <div
      data-glass="subtle"
      data-ticker="prize"
      className="glass"
      role="status"
      aria-label="₩1,500,000,000 GTD prize pool"
      style={{
        ...barStyle,
        position: 'absolute',
        pointerEvents: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {reduceMotion ? (
        <span style={{ padding: '6px 12px', fontSize: 11, letterSpacing: '0.12em' }}>₩1,500,000,000 GTD</span>
      ) : (
        <motion.div
          style={{ display: 'inline-block', willChange: 'transform' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((t, i) => (
            <span key={i} style={{ padding: '6px 0', fontSize: 11, letterSpacing: '0.12em' }}>
              {t}
            </span>
          ))}
        </motion.div>
      )}
      {/* page scroll progress — transform only, no React render per frame */}
      <motion.div
        aria-hidden="true"
        style={{
          scaleX: reduceMotion ? 0 : progress,
          transformOrigin: '0 50%',
          height: 2,
          background: tokens.primary,
        }}
      />
    </div>
  );
}

export default PrizeTicker;
