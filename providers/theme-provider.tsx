'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * ThemeProvider — next-themes wrapper.
 * Root layout children만 감싸고 DOM geometry를 만들지 않는다 (extra div 없음).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={true} disableTransitionOnChange={false}>
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
