/**
 * KSOP Design System — Glass Tokens (Single Source of Truth)
 *
 * 원칙:
 * 1. 레이아웃/DOM 변경 금지 — 이 파일은 색상·블러·테두리·그림자 값만 제공한다.
 * 2. 모든 색상은 이 파일에서만 import 해서 사용한다. (하드코딩 금지)
 * 3. 라이트/다크는 next-themes `resolvedTheme` 기준으로 `resolveGlassMode()` 로 분기한다.
 * 4. backdrop-blur 모바일 폴백은 8px (`GLASS_MOBILE_BLUR_PX`).
 * 5. 소비자는 TypeScript + Tailwind(레이아웃) + framer-motion(모션)만 사용한다.
 *
 * 기존 globals.css / header-stability.css 에 흩어진 rgba 값을 걷어내
 * 라이트(#f7faff 캔버스) / 다크(#111722 캔버스) 두 모드로 정 geld리한 것이다.
 * 새로운 값(신규 hue)을 만들지 않고 기존에 쓰이던 값만 토큰화했다.
 */

export type GlassThemeMode = 'light' | 'dark';

export type GlassVariant = 'header' | 'card' | 'popover' | 'subtle' | 'heroChip';

export interface GlassSurfaceTokens {
  /** 카드/헤더 유리 표면 */
  surface: string;
  /** 호버·강조 시 조금 더 불투명한 표면 */
  surfaceStrong: string;
  /** 중첩 패널(디테일 팩트 등)용 은은한 표면 */
  surfaceMuted: string;
  /** 외곽선 */
  stroke: string;
  /** 상단 1px 하이라이트 (inset) */
  highlight: string;
  /** 드롭 섀도우 (box-shadow 앞부분) */
  shadow: string;
  /** 본문 텍스트 */
  foreground: string;
  /** 보조 텍스트 */
  muted: string;
}

export interface GlassThemeTokens extends GlassSurfaceTokens {
  mode: GlassThemeMode;
  /** 페이지 캔버스 */
  canvas: string;
  /** 카드 CSS 변수 폴백용 */
  card: string;
  cardForeground: string;
  /** 브랜드 포인트 */
  primary: string;
  primaryForeground: string;
  border: string;
  /** backdrop blur (desktop, px) */
  blur: Record<GlassVariant, number>;
  /** saturate (%) */
  saturate: Record<GlassVariant, number>;
  /** radius */
  radius: { lg: string; md: string; sm: string; pill: string };
}

/**
 * 원칙 4 — 모바일 backdrop-blur 폴백. 모든 유리 요소는
 * `@media (max-width: 768px)` 에서 이 값으로 떨어진다.
 */
export const GLASS_MOBILE_BLUR_PX = 8 as const;

/** 모바일 판정 브레이크포인트 (Tailwind `md` 와 일치) */
export const GLASS_MOBILE_BREAKPOINT_PX = 768 as const;

/** 데스크톱 기준 블러 (px) — 기존 globals.css 의 24/22/18/16 을 그대로 승계 */
export const GLASS_BLUR_PX: Record<GlassVariant, number> = {
  header: 24,
  card: 22,
  popover: 22,
  subtle: 18,
  heroChip: 16,
} as const;

export const GLASS_SATURATE_PCT: Record<GlassVariant, number> = {
  header: 115,
  card: 100,
  popover: 100,
  subtle: 100,
  heroChip: 105,
} as const;

export const GLASS_RADIUS = {
  lg: '22px',
  md: '16px',
  sm: '12px',
  pill: '999px',
} as const;

const light: GlassThemeTokens = {
  mode: 'light',
  canvas: '#f7faff',
  card: 'rgba(255, 255, 255, 0.64)',
  cardForeground: '#171a24',
  primary: '#c5202d',
  primaryForeground: '#ffffff',
  border: 'rgba(37, 48, 72, 0.14)',
  foreground: '#171a24',
  muted: '#727785',
  surface: 'rgba(255, 255, 255, 0.64)',
  surfaceStrong: 'rgba(255, 255, 255, 0.82)',
  surfaceMuted: 'rgba(244, 248, 255, 0.72)',
  stroke: 'rgba(255, 255, 255, 0.72)',
  highlight: 'rgba(255, 255, 255, 0.9)',
  shadow: 'rgba(88, 120, 171, 0.1)',
  blur: { ...GLASS_BLUR_PX },
  saturate: { ...GLASS_SATURATE_PCT },
  radius: { ...GLASS_RADIUS },
};

const dark: GlassThemeTokens = {
  mode: 'dark',
  canvas: '#111722',
  card: 'rgba(28, 38, 56, 0.82)',
  cardForeground: '#edf3ff',
  primary: '#e45460',
  primaryForeground: '#111722',
  border: 'rgba(194, 211, 240, 0.2)',
  foreground: '#edf3ff',
  muted: '#a9b6cc',
  surface: 'rgba(28, 38, 56, 0.6)',
  surfaceStrong: 'rgba(28, 38, 56, 0.82)',
  surfaceMuted: 'rgba(23, 28, 38, 0.55)',
  stroke: 'rgba(194, 211, 240, 0.22)',
  highlight: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.32)',
  blur: { ...GLASS_BLUR_PX },
  saturate: { ...GLASS_SATURATE_PCT },
  radius: { ...GLASS_RADIUS },
};

/** 테마별 토큰 테이블 — 직접 `glass.light` / `glass.dark` 접근 금지, `getGlassTokens()` 사용 권장 */
export const glass: Record<GlassThemeMode, GlassThemeTokens> = { light, dark };

/**
 * 원칙 3 — next-themes `resolvedTheme` → 토큰 모드.
 * `resolvedTheme` 가 'dark' 일 때만 dark, 그 외(라이트·시스템 라이트·undefined·SSR)는 light.
 * SSR 안전: resolvedTheme 가 아직 없으면 light 로 폴백해 하이드레이션 미스매치를 막는다.
 */
export function resolveGlassMode(resolvedTheme?: string | null): GlassThemeMode {
  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

/** resolvedTheme(또는 모드) → 해당 테마 토큰. 색상이 필요하면 반드시 이 함수 경유. */
export function getGlassTokens(resolvedThemeOrMode?: string | null): GlassThemeTokens {
  return glass[resolveGlassMode(resolvedThemeOrMode)];
}

/** backdrop-filter 문자열. 모바일 폴백은 CSS(`glassBlurCssVars`/`GLASS_BLUR_CSS`)가 담당. */
export function glassBackdropFilter(variant: GlassVariant = 'card'): string {
  const blur = GLASS_BLUR_PX[variant];
  const saturate = GLASS_SATURATE_PCT[variant];
  return `blur(${blur}px) saturate(${saturate}%)`;
}

/**
 * 유리 표면 인라인 스타일 (색상은 전부 토큰에서).
 * 레이아웃 속성(margin/padding/grid)은 절대 넣지 않는다 — 원칙 1(래핑만 허용).
 */
export function glassSurfaceStyle(
  resolvedThemeOrMode: string | null | undefined,
  variant: GlassVariant = 'card',
): {
  background: string;
  borderColor: string;
  boxShadow: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
} {
  const t = getGlassTokens(resolvedThemeOrMode);
  const background = variant === 'header' ? t.surfaceStrong : variant === 'subtle' ? t.surfaceMuted : t.surface;
  return {
    background,
    borderColor: t.mode === 'light' ? t.stroke : t.border,
    boxShadow: `0 14px 30px ${t.shadow}, inset 0 1px ${t.highlight}`,
    backdropFilter: glassBackdropFilter(variant),
    WebkitBackdropFilter: glassBackdropFilter(variant),
  };
}

/**
 * CSS 변수 주입용 객체 — `style={glassCssVars(resolvedTheme)}` 로 루트/래퍼에 깔면
 * Tailwind arbitrary value (`bg-[var(--glass-surface)]` 등)에서 토큰 색상을 쓸 수 있다.
 */
export function glassCssVars(resolvedThemeOrMode?: string | null): Record<string, string> {
  const t = getGlassTokens(resolvedThemeOrMode);
  return {
    '--glass-surface': t.surface,
    '--glass-surface-strong': t.surfaceStrong,
    '--glass-surface-muted': t.surfaceMuted,
    '--glass-stroke': t.mode === 'light' ? t.stroke : t.border,
    '--glass-highlight': t.highlight,
    '--glass-shadow': t.shadow,
    '--glass-foreground': t.foreground,
    '--glass-muted': t.muted,
    '--glass-canvas': t.canvas,
    '--glass-primary': t.primary,
    '--glass-primary-foreground': t.primaryForeground,
    '--glass-blur-card': `${t.blur.card}px`,
    '--glass-blur-header': `${t.blur.header}px`,
    '--glass-blur-mobile': `${GLASS_MOBILE_BLUR_PX}px`,
  };
}

/**
 * 원칙 4 — 전역 CSS에 1회 삽입하는 블러 폴백.
 * 데스크톱은 토큰 블러, `max-width: 768px` 에서는 전부 8px 로 폴백.
 * (이 문자열 자체는 CSS이므로 globals.css 에서 import 하거나 <style> 로 주입)
 */
export const GLASS_BLUR_CSS = `
.glass[data-glass] {
  -webkit-backdrop-filter: blur(var(--glass-blur-card, 22px)) saturate(100%);
  backdrop-filter: blur(var(--glass-blur-card, 22px)) saturate(100%);
}
.glass[data-glass='header'] {
  -webkit-backdrop-filter: blur(var(--glass-blur-header, 24px)) saturate(115%);
  backdrop-filter: blur(var(--glass-blur-header, 24px)) saturate(115%);
}
@media (max-width: ${GLASS_MOBILE_BREAKPOINT_PX}px) {
  .glass[data-glass] {
    -webkit-backdrop-filter: blur(${GLASS_MOBILE_BLUR_PX}px) saturate(100%);
    backdrop-filter: blur(${GLASS_MOBILE_BLUR_PX}px) saturate(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .glass[data-glass] { transition: none !important; animation: none !important; }
}
`.trim();

/**
 * SPEC-COMPAT minimal skin (mission STEP 1 literal values).
 * 기존 rich `glass` 토큰을 깨지 않기 위해 별도 export로 제공한다.
 * 신규 glass color/blur는 이 파일에서만 가져온다 — 이 객체 또는 위 `glass` 경유.
 * Geometry 금지: 색상·블러·하이라이트 문자열만 포함, layout 속성 없음.
 */
export const glassSkin = {
  dark: {
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.12)',
    blur: 'blur(20px) saturate(1.8)',
    highlight: 'inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  light: {
    bg: 'rgba(255,255,255,0.72)',
    border: 'rgba(0,0,0,0.08)',
    blur: 'blur(16px) saturate(1.2)',
    highlight: 'inset 0 1px 0 rgba(255,255,255,0.8)',
  },
} as const;

/**
 * SNS hover brand colors — 하드코딩 금지, 이 export에서만 사용.
 * STEP 1 spec exact keys (lowercase) + uppercase aliases for existing header/footer code.
 * 기본 상태는 monochrome, hover에서만 이 색상을 사용한다.
 * Header/footer geometry를 바꾸지 않는다 (색상만).
 */
export const socialBrandColors = {
  flopin: '#111111',
  instagram: '#E1306C',
  x: '#111111',
  discord: '#5865F2',
  facebook: '#1877F2',
  youtube: '#FF0000',
  // Aliases: existing SnsDock/site-header use these names (same spec values).
  FLOPIN: '#111111',
  Instagram: '#E1306C',
  X: '#111111',
  Discord: '#5865F2',
  Facebook: '#1877F2',
  YouTube: '#FF0000',
} as const;

export type SocialBrandName = keyof typeof socialBrandColors;
