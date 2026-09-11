'use client';

import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type KineticTextProps = {
  /** 기존 Hero H1 text (string). Wrapper로만 감싼다 — font-size/line-height/width 변경 금지. */
  text: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * KineticText — 기존 Hero H1을 wrapper로만 감싸는 character stagger.
 * - 각 글자: opacity 0→1 only (transform 없음, will-change 없음, inline-block 없음).
 * - 글자는 display:inline, 공백은 plain text → 기존 줄바꿈과 완전히 동일.
 * - stagger delay cap: Math.min(index, 12) * 0.025 (600ms 내 대부분 paint).
 * - prefers-reduced-motion: 즉시 표시.
 */
export function KineticText({ text, className, ariaLabel }: KineticTextProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <span className={className} aria-label={ariaLabel ?? text}>
        {text}
      </span>
    );
  }

  const parts = text.split(/(\s+)/);
  let charIndex = 0;

  return (
    <span className={className} aria-label={ariaLabel ?? text}>
      <span aria-hidden="true">
        {parts.map((part, pi) =>
          /^\s+$/.test(part) || part === '' ? (
            <Fragment key={pi}>{part}</Fragment>
          ) : (
            <Fragment key={pi}>
              {Array.from(part).map((ch, ci) => {
                const delay = Math.min(charIndex++, 12) * 0.025;
                return (
                  <motion.span
                    key={ci}
                    style={{ display: 'inline' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </Fragment>
          ),
        )}
      </span>
    </span>
  );
}

export default KineticText;
