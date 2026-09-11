'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * KSOP 테마 래퍼 — 레이아웃/DOM 박스에 영향을 주지 않는 Provider 전용 래퍼.
 * 원칙 1: 자식 DOM 구조·박스 위치를 바꾸지 않는다 (context만 공급).
 * 원칙 3: 하위 컴포넌트는 `useTheme().resolvedTheme` 기준으로만 라이트/다크를 판정.
 */
export function KsopThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
