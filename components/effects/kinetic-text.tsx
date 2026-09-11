'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type KineticTextProps = {
  /** 기존 Hero H1 text (string). Wrapper로만 감싼다 — font-size/line-height/width 변경 금지. */
  text: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * KineticText — 기존 Hero H1을 wrapper로만 감싸는 character stagger.
 * - 각 글자: opacity 0→1, y 18→0
 * - No width/line-height/font-size modification.
 * - No layout shift: span display inline-block, white-space inherit.
 * - prefers-reduced-motion: animation disable.
 */
export function KineticText({ text, className, ariaLabel }: KineticTextProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <span className={className} aria-label={ariaLabel}>
        {text}
      </span>
    );
  }

  const chars = Array.from(text);
  return (
    <span className={className} aria-label={ariaLabel} role="text">
      {chars.map((ch, i) =>
        ch === ' ' || ch === '\n' ? (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {ch}
          </span>
        ) : (
          <motion.span
            key={i}
            aria-hidden={ch === ' ' ? undefined : undefined}
            style={{ display: 'inline-block', whiteSpace: 'inherit', willChange: 'opacity, transform' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.025, ease: [0.2, 0.8, 0.2, 1] }}
            onAnimationComplete={() => {
              // will-change only while needed — no permanent will-change.
            }}
          >
            {ch}
          </motion.span>
        ),
      )}
    </span>
  );
}

export default KineticText;
