'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { getGlassTokens } from '@/lib/tokens/glass';
import { cn } from '@/lib/utils';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Render as a different element tag (default 'div'). Geometry unchanged. */
  as?: React.ElementType;
  /** When true, clone the single child element and apply glass skin directly (no extra div). */
  asChild?: boolean;
  style?: React.CSSProperties;
  id?: string;
};

/**
 * GlassCard — existing geometry를 바꾸지 않는 "skin wrapper".
 * 색상·테두리·그림자만 인라인으로 담당하고, blur는 CSS(data-glass)가 담당해
 * 모바일 8px 폴백이 JS/hydration 이전 첫 paint부터 적용된다.
 * width/height/padding/margin/position/display/grid/flex/transform/top/left/right/bottom
 * 을 절대 강제로 지정하지 않는다.
 */
export function GlassCard({ children, className, as, asChild, style, id }: GlassCardProps) {
  const { resolvedTheme } = useTheme();
  const tokens = getGlassTokens(resolvedTheme);

  const skinStyle: React.CSSProperties = {
    background: tokens.surface,
    border: `1px solid ${tokens.mode === 'light' ? tokens.stroke : tokens.border}`,
    boxShadow: `0 14px 30px ${tokens.shadow}, inset 0 1px ${tokens.highlight}`,
  };

  // asChild: DOM 추가 없이 기존 요소에 skin만 입힌다 (telemetry-grid 자식 보존용).
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
      ['data-glass']?: string;
    }>;
    return React.cloneElement(child, {
      ...child.props,
      'data-glass': 'card',
      className: cn('glass', child.props.className, className),
      style: { ...skinStyle, ...child.props.style, ...style },
    });
  }

  const Tag = (as ?? 'div') as React.ElementType;
  return (
    <Tag id={id} data-glass="card" className={cn('glass', className)} style={{ ...skinStyle, ...style }}>
      {children}
    </Tag>
  );
}

export default GlassCard;
