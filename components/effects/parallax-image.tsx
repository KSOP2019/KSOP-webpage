'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type ParallaxImageProps = {
  children: ReactNode;
  className?: string;
};

/**
 * ParallaxImage — 기존 arena/image-break image wrapper.
 * - scroll progress: scale 1.1 → 1.0 (transform only)
 * - wrapper must preserve existing dimensions (no width/height set here).
 * - overflow hidden only if original parent already supports it.
 * - prefers-reduced-motion: scale 1.
 */
export function ParallaxImage({ children, className }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.0]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className} style={{ width: '100%', height: '100%', overflow: 'clip' }}>
        <div style={{ width: '100%', height: '100%', transform: 'scale(1)' }}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ width: '100%', height: '100%', overflow: 'clip' }}>
      <motion.div style={{ scale, width: '100%', height: '100%' }}>{children}</motion.div>
    </div>
  );
}

export default ParallaxImage;
