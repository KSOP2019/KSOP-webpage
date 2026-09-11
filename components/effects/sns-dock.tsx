'use client';

import type { CSSProperties, ReactNode } from 'react';
import { socialBrandColors, type SocialBrandName } from '@/lib/tokens/glass';
import { cn } from '@/lib/utils';
import './sns-dock.css';

type SnsDockProps = {
  /** Must match a key in socialBrandColors (tokens single source). */
  name: SocialBrandName | string;
  children: ReactNode;
  className?: string;
  href?: string;
  ariaLabel?: string;
};

/**
 * SnsDock icon — existing header/footer box 위치를 유지하는 skin wrapper.
 * - width/height/gap/margin/padding/position 을 절대 지정하지 않는다.
 * - 32px circular visual: border-radius 50% only (box size owned by header-stability.css).
 * - 기본 monochrome, hover에만 brand color (tokens → CSS var).
 * - Glass blur는 .glass[data-glass] (glass.css) 담당.
 */
export function SnsDock({ name, children, className, href = '/#social', ariaLabel }: SnsDockProps) {
  const brand = (socialBrandColors as Record<string, string>)[name] ?? 'currentColor';
  const style = { '--sns-brand': brand } as CSSProperties;

  return (
    <a
      href={href}
      aria-label={ariaLabel ?? name}
      data-glass="subtle"
      data-sns={name}
      className={cn('social-icon', 'glass', 'sns-glass', className)}
      style={style}
    >
      {children}
    </a>
  );
}

export default SnsDock;
