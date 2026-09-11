'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

type RevealTag = 'div' | 'article' | 'section';

interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  id?: string;
  ariaLabel?: string;
}

const MOTION_BY_TAG = {
  div: motion.div,
  article: motion.article,
  section: motion.section,
} as const;

/**
 * 스크롤 리빌 — 원칙 5에 따라 framer-motion 전담.
 * 원칙 1: 기존 DOM 계약 유지 (같은 태그·같은 className·같은 props).
 *  - className 은 기존처럼 `reveal is-visible <기존클래스>` 를 그대로 출력해
 *    기존 CSS 셀렉터(.podium-grid 등)가 깨지지 않는다.
 *  - 색상·레이아웃 속성을 절대 만지지 않는다 (opacity/translate 모션만).
 *  - `data-framer` 로 구 CSS transition 과 충돌하지 않게 glass.css 가 구 전환을 끈다.
 *  - prefers-reduced-motion / JS 없음 → 항상 보이는 상태로 폴백.
 */
export function Reveal({ children, as = 'div', className = '', style, delay = 0, id, ariaLabel }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = MOTION_BY_TAG[as];
  // 구 CSS(.js .reveal{opacity:0})와 no-JS 모두에서 보이도록 is-visible 항상 유지.
  const mergedClass = `reveal is-visible${className ? ` ${className}` : ''}`;
  const animate = reduceMotion === true;

  return (
    <MotionTag
      id={id}
      aria-label={ariaLabel}
      className={mergedClass}
      style={style}
      data-framer=""
      initial={animate ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1], delay: delay / 1000 }}
    >
      {children}
    </MotionTag>
  );
}
