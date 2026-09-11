'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, type ReactNode, type MouseEvent } from 'react';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
};

/**
 * MagneticButton — 기존 Request Invitation CTA를 감싼다.
 * - pointerType mouse일 때만 활성 (touch/mobile disable).
 * - cursor 중심 offset x 0.3, pointer leave x/y -> 0.
 * - useMotionValue + useSpring (transform only).
 * - button 자체 width/height/margin/position 변경 금지 (wrapper transform only).
 */
export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion === true) return;
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      if (window.matchMedia('(max-width: 768px)').matches) return;
    }
    const native = e.nativeEvent as unknown as { pointerType?: string };
    if (native.pointerType && native.pointerType !== 'mouse') return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * 0.3);
    y.set(offsetY * 0.3);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: 'inline-block', x: sx, y: sy }}
    >
      {children}
    </motion.div>
  );
}

export default MagneticButton;
