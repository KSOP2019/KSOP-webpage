'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';
import type { CSSProperties, ReactNode } from 'react';
import {
  getGlassTokens,
  glassCssVars,
  resolveGlassMode,
  type GlassThemeMode,
  type GlassThemeTokens,
  type GlassVariant,
} from '@/lib/tokens/glass';
import { cn } from '@/lib/utils';

/**
 * KSOP Glass primitives
 *
 * 원칙 1 (래핑만 허용):
 * - 기존 박스의 레이아웃·위치를 바꾸지 않는다. 이 파일의 컴포넌트는
 *   색상·블러·테두리·그림자·모션만 담당하고 margin/padding/grid/flex 는 건드리지 않는다.
 * - 기존 DOM 에 박스를 추가하고 싶지 않으면 <Glass> 대신 `useGlassSurface()` 훅으로
 *   기존 요소의 style/data-glass 에만 주입한다 (DOM 0 변경).
 * 원칙 2: 색상은 전부 lib/tokens/glass.ts 경유. 이 파일에 색상 리터럴 금지.
 * 원칙 3: useTheme().resolvedTheme → resolveGlassMode() 로만 테마 판정.
 * 원칙 4: backdrop-blur 는 glass.css 가 담당. 모바일(≤768px) 8px 폴백.
 * 원칙 5: TypeScript + Tailwind(레이아웃 클래스만) + framer-motion(모션만).
 */

export type GlassMotion = 'none' | 'fade-up';

type GlassBaseProps = {
  children: ReactNode;
  /** 토큰 블러/채도 프리셋. 기본값 'card' */
  variant?: GlassVariant;
  /** Tailwind 레이아웃 클래스만 전달 (색상 유틸리티 클래스 금지) */
  className?: string;
  style?: CSSProperties;
  id?: string;
  ariaLabel?: string;
};

function useGlassTheme(): { mode: GlassThemeMode; tokens: GlassThemeTokens } {
  const { resolvedTheme } = useTheme();
  const mode = resolveGlassMode(resolvedTheme);
  return { mode, tokens: getGlassTokens(mode) };
}

/**
 * DOM 추가 없이 기존 요소에 유리 스타일을 입히는 훅 (원칙 1 권장 경로).
 * 반환된 style + dataGlass 를 기존 박스에 그대로 펼치면 된다:
 *
 *   const { style, dataGlass } = useGlassSurface('card');
 *   <article className="podium-card ..." style={{ ...style }} data-glass={dataGlass}>…
 */
export function useGlassSurface(variant: GlassVariant = 'card'): {
  mode: GlassThemeMode;
  tokens: GlassThemeTokens;
  /** 기존 요소 style 에 스프레드 */
  style: CSSProperties;
  /** 기존 요소 data-glass 에 그대로 전달 (blur 폴백 CSS 트리거) */
  dataGlass: GlassVariant;
} {
  const { mode, tokens } = useGlassTheme();
  const background =
    variant === 'header'
      ? tokens.surfaceStrong
      : variant === 'subtle'
        ? tokens.surfaceMuted
        : tokens.surface;

  const style: CSSProperties = {
    // 색상은 전부 토큰. 블러 수치는 CSS 변수로 내려보내고 실 블러는 glass.css 가 적용.
    ...(glassCssVars(mode) as CSSProperties),
    '--glass-blur-subtle': `${tokens.blur.subtle}px`,
    '--glass-blur-hero': `${tokens.blur.heroChip}px`,
    background,
    borderColor: mode === 'light' ? tokens.stroke : tokens.border,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: `0 14px 30px ${tokens.shadow}, inset 0 1px ${tokens.highlight}`,
    borderRadius: tokens.radius.lg,
    color: tokens.foreground,
  } as CSSProperties;

  return { mode, tokens, style, dataGlass: variant };
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
};

export function Glass({
  children,
  variant = 'card',
  className,
  style,
  id,
  ariaLabel,
  motion: motionKind = 'fade-up',
  hoverLift = false,
}: GlassBaseProps & { motion?: GlassMotion; hoverLift?: boolean }) {
  const { style: tokenStyle, dataGlass } = useGlassSurface(variant);
  const reduceMotion = useReducedMotion();
  const animate = motionKind === 'none' || reduceMotion === true;

  return (
    <motion.div
      id={id}
      aria-label={ariaLabel}
      data-glass={dataGlass}
      // Tailwind는 레이아웃 전용 (position/overflow/display). 색상 유틸 금지.
      className={cn('glass relative overflow-hidden border', className)}
      style={{ ...tokenStyle, ...style }}
      {...(animate
        ? {}
        : {
            initial: fadeUp.initial,
            whileInView: fadeUp.whileInView,
            viewport: { once: true, margin: '0px 0px -6% 0px' },
            transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
          })}
      {...(hoverLift && !reduceMotion ? { whileHover: { y: -5 } } : {})}
    >
      {children}
    </motion.div>
  );
}

/** 카드 기본형 — 기존 .podium-card / .event-detail / .telemetry-grid>div 래핑용 */
export function GlassCard(props: GlassBaseProps & { hoverLift?: boolean }) {
  return <Glass {...props} variant={props.variant ?? 'card'} hoverLift={props.hoverLift ?? true} />;
}

/** 헤더 기본형 — 기존 .site-header 래핑용 (sticky/위치는 기존 CSS 소유) */
export function GlassHeader(props: GlassBaseProps) {
  return <Glass {...props} variant="header" motion="none" />;
}

/** 팝오버/드롭다운 기본형 — 기존 .language-options 래핑용 */
export function GlassPopover(props: GlassBaseProps) {
  return <Glass {...props} variant="popover" motion="none" />;
}
