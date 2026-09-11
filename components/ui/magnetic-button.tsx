'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState, type ReactNode, type MouseEvent } from 'react';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
};

/**
 * MagneticButton — 기존 Request Invitation CTA를 감싼다.
 * - pointer offset × 0.3
 * - pointer leave: x 0, y 0
 * - button original width/height/layout unchanged (wrapper transform only).
 * - touch/mobile: magnetic disabled.
 */
export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  const disabled =
    reduceMotion === true ||
    (typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 768px)').matches));

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: offsetX * 0.3, y: offsetY * 0.3 });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      style={{ display: 'inline-block', willChange: pos.x !== 0 || pos.y !== 0 ? 'transform' : 'auto' }}
    >
      {children}
    </motion.div>
  );
}

export default MagneticButton;
